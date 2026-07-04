import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase Client SDK for Serverless Function
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Direct options handling
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Allow GET requests for the Cron runner trigger
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Security check: Verify Vercel Cron Header or Authorization Header
  const isCronRequest =
    req.headers['x-vercel-cron'] === 'true' ||
    (process.env.CRON_SECRET && req.headers['authorization'] === `Bearer ${process.env.CRON_SECRET}`);

  if (!isCronRequest && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized access to cron trigger.' });
  }

  // SMTP Settings
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';

  if (!smtpUser || !smtpPass) {
    console.error('❌ Cron: SMTP configuration missing.');
    return res.status(500).json({ error: 'SMTP credentials missing on host.' });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const now = new Date().toISOString();
  const scheduledCol = collection(db, 'scheduledEmails');
  const q = query(
    scheduledCol,
    where('status', '==', 'pending'),
    where('sendAt', '<=', now)
  );

  try {
    const snap = await getDocs(q);
    if (snap.empty) {
      return res.status(200).json({ success: true, message: 'No pending scheduled emails to process.' });
    }

    let processedCount = 0;
    let failedCount = 0;

    for (const docSnapshot of snap.docs) {
      const emailId = docSnapshot.id;
      const emailData = docSnapshot.data();

      const formattedAttachments = Array.isArray(emailData.attachments)
        ? emailData.attachments.map((att: any) => ({
            filename: att.filename,
            content: Buffer.from(att.content, 'base64'),
            contentType: att.contentType,
          }))
        : [];

      try {
        await transporter.sendMail({
          from: `"ColorMyTrip" <${smtpUser}>`,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          attachments: formattedAttachments,
        });

        // Update status to sent
        await updateDoc(doc(db, 'scheduledEmails', emailId), {
          status: 'sent',
          sentAt: new Date().toISOString(),
        });
        processedCount++;
      } catch (sendError) {
        console.error(`❌ Cron: Failed to send email ID ${emailId}:`, sendError);
        // Update status to failed
        await updateDoc(doc(db, 'scheduledEmails', emailId), {
          status: 'failed',
          error: String(sendError),
        });
        failedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${processedCount + failedCount} emails. Sent: ${processedCount}, Failed: ${failedCount}`,
    });
  } catch (dbError) {
    console.error('❌ Cron: Firestore query failed:', dbError);
    return res.status(500).json({ error: 'Firestore query failed.', details: String(dbError) });
  }
}
