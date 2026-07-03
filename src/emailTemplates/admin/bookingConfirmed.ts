import { baseLayout } from '../base';

export type AdminBookingConfirmedData = {
  enquiryId?: string;
  bookingId?: string;
  customerName?: string;
  bookingAmount?: number;
  paymentStatus?: string;
  travelDate?: string;
  remarks?: string;
};

export function adminBookingConfirmedEmail(
  data: AdminBookingConfirmedData
): string {
  const body = `
    <p style="margin:0 0 12px 0;">A booking has been confirmed.</p>

    <div style="padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
      <div style="font-weight:800;margin-bottom:8px;">Booking Summary</div>
      ${data.bookingId ? `<div style="margin:6px 0;"><b>Booking ID:</b> ${escapeHtml(data.bookingId)}</div>` : ''}
      ${data.enquiryId ? `<div style="margin:6px 0;"><b>Enquiry ID:</b> ${escapeHtml(data.enquiryId)}</div>` : ''}
      ${data.customerName ? `<div style="margin:6px 0;"><b>Customer:</b> ${escapeHtml(data.customerName)}</div>` : ''}
      ${typeof data.bookingAmount === 'number' ? `<div style="margin:6px 0;"><b>Booking Amount:</b> ₹${escapeHtml(String(data.bookingAmount))}</div>` : ''}
      ${data.paymentStatus ? `<div style="margin:6px 0;"><b>Payment Status:</b> ${escapeHtml(data.paymentStatus)}</div>` : ''}
      ${data.travelDate ? `<div style="margin:6px 0;"><b>Travel Date:</b> ${escapeHtml(data.travelDate)}</div>` : ''}
      ${data.remarks ? `<div style="margin:10px 0 0 0;"><b>Remarks:</b><br/><span style="white-space:pre-wrap;">${escapeHtml(data.remarks)}</span></div>` : ''}
    </div>

    <p style="margin:16px 0 0 0; color:#475569;">
      Please update commission and payment status in the Admin Portal as needed.
    </p>
  `;

  return baseLayout({
    title: 'Booking Confirmed',
    subtitle: 'Action required in the Admin Portal',
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
