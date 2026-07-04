import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// ─── HTML ESCAPE HELPER ──────────────────────────────────────────────────────
function escapeHtml(input: string): string {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ─── BASE EMAIL LAYOUT (FOR ADMIN) ───────────────────────────────────────────
interface Brand {
  logoUrl?: string;
  brandName?: string;
  footerText?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
}

function baseLayout(params: {
  brand?: Brand;
  title: string;
  subtitle?: string;
  body: string;
}): string {
  const brand = params.brand || {};
  const brandName = brand.brandName ?? 'ColorMyTrip';
  const footerText = brand.footerText ?? 'Thank you for choosing ColorMyTrip. We look forward to assisting you.';
  const contactEmail = brand.contactEmail ?? 'info.colormytrip@gmail.com';
  const contactPhone = brand.contactPhone ?? '+91 9474103441';
  const websiteUrl = brand.websiteUrl ?? 'https://colormytrip.com';

  const logoHtml = brand.logoUrl
    ? `<img src="${escapeHtml(brand.logoUrl)}" alt="${escapeHtml(brandName)}" style="height:40px;width:auto;"/>`
    : `<div style="font-weight:800;letter-spacing:0.2px;">${escapeHtml(brandName)}</div>`;

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <style>
        body { margin:0; padding:0; background:#f6f7fb; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#0f172a;}
        .container { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
        .card { background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 8px 20px rgba(2,6,23,0.06); }
        .header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom: 16px; }
        .title { font-size: 20px; font-weight: 800; margin: 0; }
        .subtitle { margin: 6px 0 0 0; font-size: 13px; color:#64748b; }
        .content { margin-top: 18px; line-height:1.55; font-size:14px; }
        .pill { display:inline-block; padding: 6px 10px; border-radius: 999px; background: #eef2ff; color: #4338ca; font-weight:700; font-size:12px; }
        .divider { height:1px; background:#e2e8f0; margin: 18px 0; }
        .footer { color:#64748b; font-size:12px; line-height:1.5; margin-top: 10px; }
        a { color:#4f46e5; }
        @media (max-width:480px){
          .container { padding: 18px 12px; }
          .card { padding: 18px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div>${logoHtml}</div>
            <div class="pill">${escapeHtml(brandName)} Notifications</div>
          </div>

          <div>
            <h1 class="title">${escapeHtml(params.title)}</h1>
            ${
              params.subtitle
                ? `<p class="subtitle">${escapeHtml(params.subtitle)}</p>`
                : `<p class="subtitle">&nbsp;</p>`
            }
          </div>

          <div class="divider"></div>

          <div class="content">
            ${params.body}
          </div>

          <div class="divider"></div>

          <div class="footer">
            <div>${escapeHtml(footerText)}</div>
            <div style="margin-top:8px;">
              Contact: <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>
              &nbsp;|&nbsp;
              <span>${escapeHtml(contactPhone)}</span>
            </div>
            <div style="margin-top:6px;">
              Website: <a href="${escapeHtml(websiteUrl)}">${escapeHtml(websiteUrl)}</a>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}

// ─── NEW ENQUIRY HTML EMAIL TEMPLATE (FOR ADMIN) ──────────────────────────────
export type AdminNewEnquiryData = {
  enquiryId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  destination: string;
  travelDate?: string;
  travelers?: number;
  message?: string;
  packageTitle?: string;
};

export function adminNewEnquiryEmail(data: AdminNewEnquiryData): string {
  const body = `
    <p style="margin:0 0 12px 0;">
      A new travel enquiry has been submitted.
    </p>

    <div style="padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
      <div style="font-weight:800;margin-bottom:8px;">Enquiry Details</div>
      <div style="margin:6px 0;"><b>Enquiry ID:</b> ${escapeHtml(data.enquiryId)}</div>
      <div style="margin:6px 0;"><b>Customer:</b> ${escapeHtml(data.customerName)} (${escapeHtml(data.customerEmail)})</div>
      <div style="margin:6px 0;"><b>Phone:</b> ${escapeHtml(data.customerPhone)}</div>
      <div style="margin:6px 0;"><b>Destination:</b> ${escapeHtml(data.destination)}</div>
      ${
        data.packageTitle
          ? `<div style="margin:6px 0;"><b>Package:</b> ${escapeHtml(data.packageTitle)}</div>`
          : ''
      }
      ${
        data.travelDate
          ? `<div style="margin:6px 0;"><b>Travel Date:</b> ${escapeHtml(data.travelDate)}</div>`
          : ''
      }
      ${
        typeof data.travelers === 'number'
          ? `<div style="margin:6px 0;"><b>Travelers:</b> ${escapeHtml(String(data.travelers))}</div>`
          : ''
      }
      ${
        data.message
          ? `<div style="margin:10px 0 0 0;">
              <b>Customer Note:</b><br/>
              <span style="white-space:pre-wrap;">${escapeHtml(data.message)}</span>
            </div>`
          : ''
      }
    </div>

    <p style="margin:16px 0 0 0; color:#475569;">
      Please log into the Admin Portal to review and take action.
    </p>
  `;

  return baseLayout({
    title: 'New Enquiry Received',
    subtitle: 'Action required in the Admin Portal',
    body,
  });
}

// ─── GUEST ACKNOWLEDGEMENT EMAIL TEMPLATE ──────────────────────────────────────
interface GuestAcknowledgementData {
  guestName: string;
  destination: string;
  travelDate: string;
  duration: string;
  travellers: string;
  enquiryId: string;
  logoUrl: string;
}

function getGuestAcknowledgementHtml(data: GuestAcknowledgementData): string {
  const currentYear = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Travel Enquiry Received</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;color:#333333;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fa;padding:30px 15px;">
<tr>
<td align="center">

<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
        <td align="center" style="background:#0f4c81;padding:35px 20px;">
            <img src="${escapeHtml(data.logoUrl)}" alt="ColorMyTrip" width="180" style="display:block;border:0;max-width:180px;">
            <h1 style="margin:20px 0 5px;font-size:28px;color:#ffffff;font-weight:bold;">
                Thank You!
            </h1>
            <p style="margin:0;font-size:16px;color:#dbefff;">
                We've Successfully Received Your Enquiry
            </p>
        </td>
    </tr>

    <!-- Greeting -->
    <tr>
        <td style="padding:35px 40px 10px;">
            <p style="margin:0 0 20px;font-size:16px;">
                Dear <strong>${escapeHtml(data.guestName)}</strong>,
            </p>

            <p style="margin:0 0 18px;line-height:1.8;font-size:15px;">
                Thank you for choosing <strong>ColorMyTrip</strong>!
            </p>

            <p style="margin:0 0 18px;line-height:1.8;font-size:15px;">
                We have successfully received your travel enquiry and truly appreciate your interest in travelling with us.
                Our travel experts are currently reviewing your request and will contact you shortly with the best itinerary,
                pricing, and available options tailored to your requirements.
            </p>
        </td>
    </tr>

    <!-- Enquiry Details -->
    <tr>
        <td style="padding:10px 40px;">
            <table width="100%" cellpadding="12" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
                <tr>
                    <td colspan="2" style="background:#eef5fb;font-weight:bold;font-size:16px;">
                        Your Enquiry Details
                    </td>
                </tr>

                <tr>
                    <td width="40%"><strong>Destination</strong></td>
                    <td>${escapeHtml(data.destination)}</td>
                </tr>

                <tr>
                    <td><strong>Travel Date</strong></td>
                    <td>${escapeHtml(data.travelDate)}</td>
                </tr>

                <tr>
                    <td><strong>Duration</strong></td>
                    <td>${escapeHtml(data.duration)}</td>
                </tr>

                <tr>
                    <td><strong>Travellers</strong></td>
                    <td>${escapeHtml(data.travellers)}</td>
                </tr>

                <tr>
                    <td><strong>Enquiry ID</strong></td>
                    <td>${escapeHtml(data.enquiryId)}</td>
                </tr>

            </table>
        </td>
    </tr>

    <!-- Message -->
    <tr>
        <td style="padding:30px 40px 15px;">

            <p style="margin:0 0 18px;line-height:1.8;font-size:15px;">
                Our team usually responds within
                <strong>2–6 business days</strong>.
                During peak travel seasons, response times may be slightly longer, but rest assured that your enquiry is important to us.
            </p>

            <p style="margin:0 0 12px;font-weight:bold;font-size:16px;">
                Why Travel with ColorMyTrip?
            </p>

            <ul style="padding-left:20px;margin:0 0 20px;line-height:1.9;font-size:15px;">
                <li>Personalized travel itineraries</li>
                <li>Handpicked hotels & homestays</li>
                <li>Honeymoon, family & group tours</li>
                <li>Offbeat destinations & unique experiences</li>
                <li>Transparent pricing with dedicated travel support</li>
            </ul>

            <p style="margin:0 0 25px;line-height:1.8;font-size:15px;">
                If you have any additional questions or would like to update your travel requirements,
                simply reply to this email or connect with us on WhatsApp.
            </p>

        </td>
    </tr>

    <!-- CTA -->
    <tr>
        <td align="center" style="padding:10px 40px 40px;">
            <a href="https://wa.me/919748345171"
               style="background:#25D366;color:#ffffff;text-decoration:none;padding:14px 34px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
                Chat on WhatsApp
            </a>
        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td align="center" style="background:#f8f9fb;padding:30px;border-top:1px solid #ececec;">

            <h3 style="margin:0;font-size:18px;color:#0f4c81;">
                Team ColorMyTrip
            </h3>

            <p style="margin:8px 0 18px;color:#666666;font-size:14px;">
                Travel with Soul
            </p>

            <p style="margin:6px 0;font-size:14px;">
                📞 +91 97483 45171
            </p>

            <p style="margin:6px 0;font-size:14px;">
                ✉️ info.colormytrip@gmail.com
            </p>

            <p style="margin:6px 0 20px;font-size:14px;">
                🌐 www.colormytrip.in
            </p>

            <p style="margin:0;font-size:12px;color:#999999;">
                © ${currentYear} ColorMyTrip. All Rights Reserved.
            </p>

        </td>
    </tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
}

// ─── API HANDLER ─────────────────────────────────────────────────────────────
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
    promoCode,
    duration,
    logoUrl
  } = req.body;

  // Render Admin Template HTML
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

  // Render Guest Template HTML
  // Fallback logo URL (using the github-hosted white logo, which fits the dark blue header perfectly)
  const finalLogoUrl = logoUrl || 'https://raw.githubusercontent.com/infocolormytrip-ctrl/colormytripratnadeep/main/src/assets/logo%20white.png';
  const guestEmailHtml = getGuestAcknowledgementHtml({
    guestName: name,
    destination: destination,
    travelDate: travelDate || 'Flexible / To Be Decided',
    duration: duration || 'Customized Plan',
    travellers: travelers ? `${travelers} Pax` : '1 Pax',
    enquiryId: id || 'N/A',
    logoUrl: finalLogoUrl
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
      // 1. Send email to Admin
      await transporter.sendMail({
        from: `"ColorMyTrip Notifications" <${smtpUser}>`,
        to: adminEmail,
        subject: `📬 New Booking Enquiry Received - ID: ${id || 'N/A'}`,
        html: emailHtml,
      });
      console.log(`💌 Admin notification dispatched to ${adminEmail}`);

      // 2. Send confirmation email to the Guest/Customer
      if (email && email.trim().length > 0) {
        await transporter.sendMail({
          from: `"ColorMyTrip" <${smtpUser}>`,
          to: email.trim(),
          subject: `✈️ ColorMyTrip Enquiry Received! - ID: ${id || 'N/A'}`,
          html: guestEmailHtml,
        });
        console.log(`💌 Guest acknowledgement dispatched to ${email}`);
      }

      // 3. Send email to Affiliate if assigned
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
    console.log('❌ SMTP Credentials missing. Simulated SMTP forward logged successfully.');
    return res.status(200).json({
      success: true,
      message: 'Enquiry received. Email logged to console (SMTP credentials not configured).',
      payload: { id, name, email, destination }
    });
  }
}
