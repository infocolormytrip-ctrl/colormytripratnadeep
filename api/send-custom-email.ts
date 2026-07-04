import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, html, attachments } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing to, subject, or html in request body.' });
  }

  // SMTP Settings
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';

  if (!smtpUser || !smtpPass) {
    console.error('❌ SMTP configuration missing on host.');
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

  // Prepare attachments for Nodemailer
  const formattedAttachments = Array.isArray(attachments)
    ? attachments.map((att: any) => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType,
      }))
    : [];

  try {
    await transporter.sendMail({
      from: `"ColorMyTrip" <${smtpUser}>`,
      to,
      subject,
      html,
      attachments: formattedAttachments,
    });

    console.log(`💌 Custom email sent successfully to ${to}`);
    return res.status(200).json({ success: true, message: 'Email sent successfully.' });
  } catch (err) {
    console.error('❌ Custom email dispatch failed:', err);
    return res.status(500).json({ error: 'SMTP dispatch failed.', details: String(err) });
  }
}
