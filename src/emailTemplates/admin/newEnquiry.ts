import { baseLayout } from '../base';

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

function escapeHtml(input: string): string {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}
