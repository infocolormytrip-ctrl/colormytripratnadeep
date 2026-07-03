import { baseLayout } from '../base';

export type AffiliatePromoCodeUsedData = {
  promoCode: string;
  customerName?: string;
  enquiryId?: string;
  commissionType?: string;
  commissionValue?: number;
};

export function affiliatePromoCodeUsedEmail(
  data: AffiliatePromoCodeUsedData
): string {
  const body = `
    <p style="margin:0 0 12px 0;">A customer has used your promo code.</p>

    <div style="padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
      <div style="font-weight:800;margin-bottom:8px;">Promo Code Usage</div>
      <div style="margin:6px 0;"><b>Promo Code:</b> ${escapeHtml(data.promoCode)}</div>

      ${
        data.customerName
          ? `<div style="margin:6px 0;"><b>Customer:</b> ${escapeHtml(data.customerName)}</div>`
          : ''
      }
      ${
        data.enquiryId
          ? `<div style="margin:6px 0;"><b>Enquiry ID:</b> ${escapeHtml(data.enquiryId)}</div>`
          : ''
      }

      ${
        data.commissionType || typeof data.commissionValue === 'number'
          ? `<div style="margin:6px 0;">
              <b>Commission:</b>
              ${escapeHtml(data.commissionType ?? '')}
              ${typeof data.commissionValue === 'number' ? escapeHtml(String(data.commissionValue)) : ''}
            </div>`
          : ''
      }
    </div>

    <p style="margin:16px 0 0 0; color:#475569;">
      Track this enquiry in the Affiliate Portal for booking updates and commission.
    </p>
  `;

  return baseLayout({
    title: 'Promo Code Used',
    subtitle: 'New affiliate referral created',
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

