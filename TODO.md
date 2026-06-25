# TODO - CMS-driven Admin (siteSettings)

## Step 1
Inspect current UI components for Footer/About/Contact and confirm hardcoded content locations.

## Step 2
Add Firestore reads/writes in `src/context/DataContext.tsx`:
- Read `siteSettings/footer`, `siteSettings/about`, `siteSettings/contact`
- Expose `updateFooter`, `updateAbout`, `updateContact`

## Step 3
Update Firestore security rules in `firestore.rules`:
- Allow admin read/write for `siteSettings/**` (admin-only)

## Step 4
Extend `src/components/AdminPanel.tsx`:
- Add new tab “Website Settings”
- Provide forms to edit Footer, About, Contact

## Step 5
Refactor UI to be CMS-driven:
- `src/App.tsx`: Footer uses `siteSettings/footer`
- `src/components/About.tsx`: uses `siteSettings/about`
- `src/components/Contact.tsx`: uses `siteSettings/contact`

## Step 6
Seed default `siteSettings` docs for first run (in local fallback or via code) to avoid blank pages.

## Step 7
Run build/lint and sanity-check admin save + frontend render.

