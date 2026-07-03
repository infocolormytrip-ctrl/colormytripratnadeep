import { baseLayout } from '../base';

export type AdminCommissionApprovedData = {
  enquiryId?: string;
  bookingId?: string;
  affiliateName?: string;
  commissionAmount?: number;
  currency?: string;
  transactionId?: string;
};

export function adminCommissionApprovedEmail(
  data: AdminCommissionApprovedData
): string {
  const amount = typeof data.commissionAmount === 'number' ? data.commissionAmount : undefined;
  const currency = data.currency ?? 'INR';

  const body = `
    <p style="margin:0 0 12px 0;">Affiliate commission has been approved.</p>

    <div style="padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
      <div style="font-weight:800;margin-bottom:8px;">Commission Details</div>
      ${data.affiliateName ? `<div style="margin:6px 0;"><b>Affiliate:</b> ${escapeHtml(data.affiliateName)}</div>` : ''}
      ${data.enquiryId ? `<div style="margin:6px 0;"><b>Enquiry ID:</b> ${escapeHtml(data.enquiryId)}</div>` : ''}
      ${data.bookingId ? `<div style="margin:6px 0;"><b>Booking ID:</b> ${escapeHtml(data.bookingId)}</div>` : ''}
      ${
        typeof amount === 'number'
          ? `<div style="margin:6px 0;"><b>Commission:</b> ${escapeHtml(currency)} ${escapeHtml(String(amount))}</div>`
          : ''
      }
      ${data.transactionId ? `<div style="margin:6px 0;"><b>Transaction ID:</b> ${escapeHtml(data.transactionId)}</div>` : ''}
    </div>

    <p style="margin:16px 0 0 0; color:#475569;">
      Next step: mark commission as paid (if applicable) in the Admin Portal.
    </p>
  `;

  return baseLayout({
    title: 'Commission Approved',
    subtitle: 'In-app and email notification',
    body,
  });
}

function escapeHtml(input: string): string {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}
