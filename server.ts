import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { adminNewEnquiryEmail } from './src/emailTemplates/admin/newEnquiry';

dotenv.config();

// Since we are running in ESM, find __dirname safely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Remove COOP header in dev so Firebase signInWithPopup can communicate with the popup window
  if (process.env.NODE_ENV !== 'production') {
    app.use((_req, res, next) => {
      res.removeHeader('Cross-Origin-Opener-Policy');
      res.removeHeader('Cross-Origin-Embedder-Policy');
      next();
    });
  }

  // Body parser for enquiry submissions
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route - Capture Enquiry submission and mail to Admin & Affiliate
  app.post('/api/enquire', async (req, res) => {
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
    console.log('📬 NEW INCOMING ENQUIRY RECEIVED');
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
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // Serve Vite in development / production static build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ColorMyTrip Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal dev server start error:', error);
});
