# Affiliate Marketing Module - Implementation Tracker

## Phase 1 (Feature 1–2): Roles + Affiliate/Promo scaffolding
- [ ] Inspect and update Firestore data model types (src/types.ts) for new collections/fields used.
- [ ] Update `src/context/DataContext.tsx` to resolve and persist `role` for logged-in users.
- [ ] Add role-safe routing / guards (`src/router/Router.tsx`) for `/admin` and affiliate portal route.
- [ ] Create Affiliate portal base page + route (`src/pages/AffiliatePortal.tsx`).
- [ ] Update `src/components/AdminPanel.tsx` entry gating to only show for admin role.

## Phase 2 (Feature 3–5): Promo codes + Package enquiry integration + enquiry schema
- [ ] Extend enquiry form UI in `src/components/PackageDetails.tsx` with optional Promo Code.
- [ ] Implement promo validation + commission computation on submit.
- [ ] Extend `DataContext.addEnquiry` to persist new promo/commission fields.
- [ ] Add helper functions for promo validation under `src/lib/affiliate.ts`.
- [ ] Add admin UI for Promo Codes CRUD inside `src/components/AdminPanel.tsx` (new tab/view).

## Phase 3 (Feature 6–9): Booking workflow + soft delete + booking->commission calculation
- [ ] Implement booking conversion UI in admin (convert enquiry to booking + store booking amount/commission).
- [ ] Add booking/commission collections scaffolding and write paths.
- [ ] Extend enquiry->booking data model (bookingStatus / deleted soft delete).
- [ ] Update `firestore.rules` to support admin + affiliate read/write constraints.


## Phase 4 (Feature 10–11): Notifications + email
- [ ] Create Firestore `notifications` write helpers.
- [ ] Extend backend `/api/enquire` and add endpoints for booking/commission events.
- [ ] Add unread badge read model in affiliate portal.

## Phase 5 (Feature 7, 8, 12–13): Affiliate portal, admin commission manager, analytics
- [ ] Create admin dashboard cards + commission manager table.
- [ ] Create affiliate portal pages (My Promo Codes, My Enquiries, Commission, Graphs).
- [ ] Add CSV export for commissions.
- [ ] Add charts for analytics.

## Phase 6 (Feature 14, 17): Security rules + activity logs
- [ ] Implement `activityLogs` writes for key actions.
- [ ] Finalize Firestore rules: public promo validation, affiliate isolation, no admin access for affiliates.

## Final verification
- [ ] Manual E2E: create promo (admin) → login affiliate → enquiry with promo → convert to booking (admin) → pay commission.
- [ ] Validate soft delete behavior for enquiries.
- [ ] Validate UI restrictions for affiliates.

