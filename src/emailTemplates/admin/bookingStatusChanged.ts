import { baseLayout } from '../base';

export type AdminBookingStatusChangedData = {
  enquiryId?: string;
  customerName?: string;
  previousStatus?: string;
  newStatus?: string;
  bookingStatus?: string;
  note?: string;
};

export function adminBookingStatusChangedEmail(
  data: AdminBookingStatusChangedData
): string {
  const body = `
    <p style="margin:0 0 12px 0;">Booking status has been updated.</p>

    <div style="padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
      <div style="font-weight:800;margin-bottom:8px;">Update Details</div>
      ${data.enquiryId ? `<div style="margin:6px 0;"><b>Enquiry ID:</b> ${escapeHtml(data.enquiryId)}</div>` : ''}
      ${data.customerName ? `<div style="margin:6px 0;"><b>Customer:</b> ${escapeHtml(data.customerName)}</div>` : ''}
      ${data.previousStatus ? `<div style="margin:6px 0;"><b>Previous Status:</b> ${escapeHtml(data.previousStatus)}</div>` : ''}
      ${data.newStatus ? `<div style="margin:6px 0;"><b>New Status:</b> ${escapeHtml(data.newStatus)}</div>` : ''}
      ${data.bookingStatus ? `<div style="margin:6px 0;"><b>Booking Stage:</b> ${escapeHtml(data.bookingStatus)}</div>` : ''}
      ${data.note ? `<div style="margin:10px 0 0 0;"><b>Note:</b><br/><span style="white-space:pre-wrap;">${escapeHtml(data.note)}</span></div>` : ''}
    </div>

    <p style="margin:16px 0 0 0; color:#475569;">
      Please review this update in the Admin Portal.
    </p>
  `;

  return baseLayout({
    title: 'Booking Status Updated',
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
