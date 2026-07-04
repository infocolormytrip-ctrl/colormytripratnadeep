import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { adminNewEnquiryEmail } from '../src/emailTemplates/admin/newEnquiry';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
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

  // SMTP Configuration
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';
  const adminEmail = process.env.ADMIN_EMAIL || 'info.colormytrip@gmail.com';

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const {
    name,
    email,
    phone,
    destination,
    travelers,
    travelDate,
    message,
    id,
    affiliateEmail,
    affiliateName,
    promoCode
  } = req.body;

  const emailHtml = adminNewEnquiryEmail({
    enquiryId: id || 'N/A',
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    destination: destination,
    travelDate: travelDate || undefined,
    travelers: travelers ? Number(travelers) : undefined,
    message: message || undefined,
    packageTitle: destination
  });

  console.log('========================================================================');
  console.log('📬 VERCEL SERVERLESS FUNCTION: NEW INCOMING ENQUIRY RECEIVED');
  console.log('========================================================================');
  console.log(`Enquiry ID   : ${id || 'N/A'}`);
  console.log(`Customer Name: ${name}`);
  console.log(`Email Address: ${email}`);
  console.log(`Phone Number : ${phone}`);
  console.log(`Destination  : ${destination}`);
  console.log(`Travelers    : ${travelers} pax`);
  console.log(`Travel Date  : ${travelDate}`);
  if (affiliateEmail) {
    console.log(`Affiliate    : ${affiliateName} (${affiliateEmail}) via Code [${promoCode}]`);
  }
  console.log('========================================================================');

  // Attempt real SMTP dispatch
  if (smtpUser && smtpPass) {
    try {
      // Send email to Admin
      await transporter.sendMail({
        from: `"ColorMyTrip Notifications" <${smtpUser}>`,
        to: adminEmail,
        subject: `📬 New Booking Enquiry Received - ID: ${id || 'N/A'}`,
        html: emailHtml,
      });
      console.log(`💌 Admin notification dispatched to ${adminEmail}`);

      // Send email to Affiliate if assigned
      if (affiliateEmail && affiliateEmail.trim().length > 0) {
        await transporter.sendMail({
          from: `"ColorMyTrip Notifications" <${smtpUser}>`,
          to: affiliateEmail.trim(),
          subject: `🔥 New Customer Enquiry Assigned to You - Code: ${promoCode}`,
          html: emailHtml,
        });
        console.log(`💌 Affiliate notification dispatched to ${affiliateEmail}`);
      }

      return res.status(200).json({
        success: true,
        message: 'Enquiry emails dispatched successfully.',
        payload: { id, name, email, destination }
      });
    } catch (smtpError) {
      console.error('❌ SMTP Dispatch Error:', smtpError);
      return res.status(500).json({
        success: false,
        message: 'Enquiry saved but email dispatch failed.',
        error: String(smtpError)
      });
    }
  } else {
    console.log('⚠️ SMTP Credentials missing. Simulated SMTP forward over TLS logged successfully.');
    return res.status(200).json({
      success: true,
      message: 'Enquiry received. Email logged to console (SMTP credentials not configured).',
      payload: { id, name, email, destination }
    });
  }
}
