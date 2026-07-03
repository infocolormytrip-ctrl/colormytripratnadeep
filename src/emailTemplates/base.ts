type Brand = {
  logoUrl?: string;
  brandName?: string;
  footerText?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
};

export function baseLayout(params: {
  brand?: Brand;
  title: string;
  subtitle?: string;
  body: string;
}): string {
  const brand = params.brand || {};
  const brandName = brand.brandName ?? 'ColorMyTrip';
  const footerText =
    brand.footerText ?? 'Thank you for choosing ColorMyTrip. We look forward to assisting you.';

  const contactEmail = brand.contactEmail ?? 'info.colormytrip@gmail.com';
  const contactPhone = brand.contactPhone ?? '+91 9474103441';
  const websiteUrl = brand.websiteUrl ?? '#';

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

function escapeHtml(input: string): string {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}
