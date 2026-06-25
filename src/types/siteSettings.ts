export type FooterSocialLinks = {
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
};

export type SiteFooterSettings = {
  headquarters_address?: string;
  phone_number?: string;
  email_address?: string;
  footer_description_text?: string;
  social_links?: FooterSocialLinks;
  copyright_text?: string;
};

// Separate docs (chosen option B) for site-wide head/branding settings.
export type SiteBrandSettings = {
  site_logo_url?: string;
  footer_logo_url?: string;
  favicon_url?: string;
};

export type NetaTagsSettings = {
  // Store as array for easy admin editing. Render layer can stringify/parse if needed.
  neta_tags?: string[];
  // Optional legacy string variant (if you store as comma-separated).
  neta_tags_text?: string;
};

export type AboutSettings = Record<string, unknown>;
export type ContactSettings = Record<string, unknown>;

export type SiteSettingsDocument<T = unknown> = {
  // Stored as JSON-like object in Firestore.
  data?: T;
  // Optional: keep updatedAt for admin UX.
  updatedAt?: string;
};


