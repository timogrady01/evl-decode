# EVL Master Build Log — Express Vehicle Locators
> Complete vault of all builds, decisions, APIs, and configurations.
> Sensitive credentials are stored in Vercel environment variables — not in this file.

# EVL Build Log — Express Vehicle Locators
## Master Reference Document
**Platform:** expressvehiclelocators.com
**GitHub Repo:** timogrady01/evl-decode
**Firebase Project:** evl-acquisition-radar (Blaze Plan)
**Admin Email:** togradyevl@gmail.com
**Admin UID:** ADMIN_UID[stored securely]
**Vercel Plan:** Pro ($20/month — upgraded July 3, 2026)

---

## REVENUE MODEL (Final — July 5, 2026)

| Bucket | Price | Description |
|--------|-------|-------------|
| Find My Vehicle | $49 | Entry point — locate vehicle only. No price verification (brokerage exposure risk). |
| Advisory | $249 | Buying power analysis, rate vs rebate math, trade evaluation, negotiation script |
| Full Service | $399 | Everything in Advisory + EVL in deal start to finish |
| Service Vault Basic | $99/yr | Document archive + maintenance reminders |
| Service Vault Pro | $199/yr | + Trade analytics + tire intelligence + coupon finder |
| Service Vault Elite | $299/yr | + EVL advisor access + ownership forensics + trade prep |
| My Buying Power | FREE | Vetting tool — runs before $49 is charged |

---

## CUSTOMER JOURNEY (Phase 1–7)

```
Phase 1 → Find My Vehicle ($49) — /find-my-vehicle
Phase 2 → My Buying Power (FREE vetting) — /my-buying-power
Phase 3 → Appointment Booking — /appointment-booking
Phase 4 → Appointment Confirmation + Fair Deal Worksheet — /appointment-confirmation
Phase 5 → Fair Deal Worksheet (gated) — /fair-deal-worksheet
Phase 6 → Day of Appointment — CRM Check-In + QR Code — /crm
Phase 7 → Deal Protection Checklist (gated) — /deal-checklist
Post-Deal → Service Vault — /service-vault
```

---

## BUILD LOG — ALL PAGES & FILES

---

### HOME PAGE
**File:** `public/home.html`
**URL:** `expressvehiclelocators.com`
**Last Updated:** July 5, 2026
**What It Does:**
- EVL's main landing page and front door to the platform
- Hero section with 52% stat and EVL proposition
- 5 expandable drawers: How Much Can You Save, How It Works, Explore the Platform, The EVL Promise, Discover My Buying Power
- Primary CTA: "Discover My Buying Power — Free" → /my-buying-power
- Secondary CTA: "Find My Vehicle — $49" → /find-my-vehicle
- All broken links to old evl-decode-two.vercel.app domain fixed July 5, 2026
**Dependencies:** None — standalone entry point

---

### FIND MY VEHICLE
**File:** `public/find-my-vehicle.html`
**URL:** `expressvehiclelocators.com/find-my-vehicle`
**Built:** July 5, 2026
**Revenue Bucket:** $49 Entry
**What It Does:**
- Customer-facing $49 lead intake page
- Hero with 52% statistic (source: DealerRefresh / AutoTrader industry data)
- Want/Need scale explanation — how EVL matches vehicle to customer
- Revenue bucket chain — all 6 buckets shown with savings estimates
- Simple form: first name, last name, phone, email
- On submit → saves to Firebase evl_leads collection
- EVL calls customer within 2 hours
**Key Decision:** Find vehicle ONLY — no price verification (avoids brokerage regulatory exposure)
**Dependencies:** Firebase evl_leads collection

---

### MY BUYING POWER
**File:** `public/my-buying-power.html`
**URL:** `expressvehiclelocators.com/my-buying-power`
**Built:** July 5, 2026
**Revenue Bucket:** FREE — vetting tool
**What It Does:**
- 4-step free buying power calculator
- Step 1: Vehicle price + new/used selection
- Step 2: Trade-in LTV check (125% lender maximum enforced)
- Step 3: Credit score self-report (Experian Q4 2025 rates — never pulls credit)
- Step 4: Payment calculator — forward (price→payment) + reverse (payment→price)
- Rate vs Rebate comparison table (manufacturer rate vs outside lender math)
- Green result → $49 Find My Vehicle CTA
- Flagged result → honest explanation + 3 paths forward
**Credit Tiers (Experian Q4 2025):**
- Super Prime (781-850): New 5.25% / Used 7.52%
- Prime (661-780): New 7.01% / Used 9.75%
- Near Prime (601-660): New 9.82% / Used 13.91%
- Subprime (501-600): New 13.42% / Used 18.86%
- Deep Subprime (<500): New 21.38% / Used 22.16%
**LTV Rule:** 125% maximum. Drops to 115% for subprime.
**Dependencies:** Standalone — no Firebase required

---

### APPOINTMENT BOOKING
**File:** `public/appointment-booking.html`
**URL:** `expressvehiclelocators.com/appointment-booking`
**Last Updated:** July 5, 2026
**What It Does:**
- Customer books appointment date and time
- Auto-populates name and vehicle from URL params (passed from find-my-vehicle)
- If no URL params → shows name and vehicle input fields
- Date picker (Mon-Fri only, next 30 days)
- Time slots in 30-minute intervals (8am-4:30pm)
- Phone and email fields for SMS/email confirmation
- On submit → saves to Firebase evl_appointments
- Redirects to appointment-confirmation with all data in URL
**Dependencies:** Firebase evl_appointments collection

---

### APPOINTMENT CONFIRMATION
**File:** `public/appointment-confirmation.html`
**URL:** `expressvehiclelocators.com/appointment-confirmation`
**Built:** June-July 2026
**What It Does:**
- Shows confirmed appointment details
- Sends customer confirmation email via EmailJS (tpl_customer[EVL-APPT-CONFIRMATION])
- Sends admin alert email via EmailJS (tpl_admin[EVL-APPT-ADMIN])
- Sends customer SMS via Twilio (non-fatal — doesn't crash if SMS fails)
- Links to Fair Deal Worksheet
- Upsell banner for Advisory bucket ($249)
**EmailJS Config:**
- Service ID: srv***[stored in Vercel env vars]
- Customer template: tpl_customer[EVL-APPT-CONFIRMATION] (EVL-APPT-CONFIRMATION)
- Admin template: tpl_admin[EVL-APPT-ADMIN] (EVL-APPT-ADMIN)
- Public key: iil***[stored in Vercel env vars]
**Dependencies:** Firebase evl_appointments, EmailJS, Twilio

---

### FAIR DEAL WORKSHEET
**File:** `public/fair-deal-worksheet.html`
**URL:** `expressvehiclelocators.com/fair-deal-worksheet`
**Built:** June-July 2026
**Last Updated:** July 5, 2026 (content gate added)
**Revenue Bucket:** Included with Advisory ($249)
**What It Does:**
- 5-section deal intelligence document
- Section 1: Side-by-side comparison (EVL research vs dealer offer)
- Section 2: Deal Confidence Score (0-100)
- Section 3: Savings calculator
- Section 4: Word-for-word negotiation scripts
- Section 5: Finance education (credit tiers, loan terms, F&I products)
- Print and email buttons
- Ready for Appointment button → updates Firebase + redirects to home
**CONTENT GATE:** Requires valid appointmentId in URL — shows paywall if missing
- Paywall sends to: /appointment-booking
**Dependencies:** Firebase evl_appointments (for status update)

---

### CRM (Internal Admin Tool)
**File:** `public/crm.html`
**URL:** `expressvehiclelocators.com/crm`
**Last Updated:** July 5, 2026
**What It Does:**
- EVL staff-facing dashboard with 5 tabs:
  - Leads — view and manage incoming leads
  - Deals — track active deals
  - Appointments — view scheduled appointments
  - Notes — internal notes
  - Check-In — customer arrival workflow
- Check-In tab: search by name → select customer → click Customer Arrived
- On Customer Arrived:
  1. Updates Firebase status to "checked-in" with timestamp
  2. Fires pre-signing SMS nudge to customer via /api/pre-signing-nudge
  3. QR code modal appears on screen (July 5, 2026)
- QR code: personalized URL to /deal-checklist with appointmentId + name + vehicle
- Salesperson shows QR code to customer → customer scans → opens Deal Checklist
**Dependencies:** Firebase evl_appointments, Twilio SMS, /api/pre-signing-nudge

---

### DEAL PROTECTION CHECKLIST
**File:** `public/deal-checklist.html`
**URL:** `expressvehiclelocators.com/deal-checklist`
**Built:** July 4-5, 2026
**Last Updated:** July 5, 2026 (BITOP tab renamed, gate added)
**Revenue Bucket:** Included with $49 Find My Vehicle
**What It Does:**
- 3-tab interactive checklist opened via QR code at dealership
- Tab 1: Before You Arrive — what to bring, trade-in prep, 1-key warning
- Tab 2: EVL Delivery Protection Check — vehicle inspection walkthrough, spare tire check, We-Owe documentation, key count, CPO checklist, dealer delivery form
- Tab 3: Before You Drive Away — all documents, warranty booklets warning, Texas tag situation, service advisor intro, last steps
- Progress bar tracking across all items
- Vehicle-specific tech tips (Bluetooth pairing, nav clear) for 12 brands
- Service Vault upsell at bottom of Tab 2 and Tab 3
- On completion → updates Firebase + redirects to home
**CONTENT GATE:** Requires valid appointmentId in URL — shows paywall if missing
- Paywall sends to: /appointment-booking OR /service-vault
**Auto-populates:** customerName + vehicleInfo from URL (set by QR code)
**Dependencies:** Firebase evl_appointments

---

### SERVICE VAULT
**File:** `public/service-vault.html`
**URL:** `expressvehiclelocators.com/service-vault`
**Built:** July 5, 2026
**Revenue Bucket:** $99/$199/$299 per year
**What It Does:**
- 3-tier subscription pricing page
- Hero with savings stats ($2,400+ avg trade-in savings, $800+ avg service savings)
- 6 benefit cards with dollar value shown for each
- Basic $99: Document archive + maintenance reminders
- Pro $199: + Trade analytics + tire intelligence + coupon finder
- Elite $299: + EVL advisor access + ownership forensics + trade prep
- Request form: name, email, phone, vehicle, tier selection
- On submit → saves to Firebase evl_vault_signups
- EVL advisor contacts customer within 24 hours
- FAQ section (6 questions)
**Note:** Stripe integration pending — currently uses request form + manual follow-up
**Dependencies:** Firebase evl_vault_signups collection

---

### API: PRE-SIGNING NUDGE
**File:** `api/pre-signing-nudge.js`
**URL:** `expressvehiclelocators.com/api/pre-signing-nudge`
**Built:** July 3-4, 2026
**What It Does:**
- Fires when salesperson clicks "Customer Arrived" in CRM
- Sends SMS to customer: "Hi [name], before you sign, review your fair deal worksheet..."
- CommonJS syntax (required for Vercel serverless)
- SMS is non-fatal — if Twilio fails, doesn't crash the check-in
**Twilio Config:**
- FROM: TWILIO_PHONE_NUMBER (Vercel env var)
- TO: customer phone from Firebase appointment record
- Account: AC***[stored in Vercel env vars]
**Dependencies:** Twilio, Firebase evl_appointments

---

### API: SEND APPOINTMENT NOTIFICATIONS
**File:** `api/send-appointment-notifications.js`
**Built:** July 4-5, 2026
**What It Does:**
- Fires when appointment is booked
- Sends confirmation SMS to customer via Twilio
- Sends confirmation email to customer via EmailJS (tpl_customer[EVL-APPT-CONFIRMATION])
- Sends admin alert email to togradyevl@gmail.com via EmailJS (tpl_admin[EVL-APPT-ADMIN])
- SMS is non-fatal — emails fire even if Twilio fails
**Dependencies:** Twilio, EmailJS

---

## TWILIO STATUS (July 5, 2026)

| Item | Status |
|------|--------|
| Account | Paid (upgraded from trial July 4, 2026) |
| Balance | ~$19.99 |
| Active Number | +18444675644 (844 toll-free — messaging DISABLED) |
| Compliance | Registration submitted — awaiting approval |
| New Local Number | Pending 2-business-day registration (check July 7) |
| TWILIO_PHONE_NUMBER in Vercel | Needs updating once new number approved |
| EVL_ADMIN_PHONE in Vercel | Needs updating once new number approved |

---

## FIREBASE COLLECTIONS

| Collection | Purpose |
|------------|---------|
| evl_appointments | Customer appointments — created at booking, updated at check-in |
| evl_leads | Customer leads from find-my-vehicle form |
| evl_vault_signups | Service Vault subscription requests |
| evl_ws_dealers | Wholesale dealer records |
| evl_auctions | WS Exchange auction records |
| evl_bids | WS Exchange bid records |
| evl_mastermind_customers | Retail CRM customer records |
| evl_consumer_calls | Call log records |

---

## VERCEL ENVIRONMENT VARIABLES

| Variable | Purpose | Status |
|----------|---------|--------|
| TWILIO_ACCOUNT_SID | Twilio auth | ✅ Set |
| TWILIO_AUTH_TOKEN | Twilio auth | ✅ Set |
| TWILIO_PHONE_NUMBER | SMS FROM number | ⚠️ Needs update |
| EVL_ADMIN_PHONE | Admin SMS recipient | ⚠️ Needs update |
| GITHUB_TOKEN | GitHub API access | ✅ Set |

---

## FIRESTORE SECURITY RULES (Current — July 5, 2026)

- evl_appointments: `allow read, write: if true` (open for CRM + customer access)
- evl_leads: admin write + public create
- evl_ws_dealers: admin + active dealer read
- evl_mastermind_customers: admin only
- All other collections: admin only or role-based

---

## KEY DESIGN DECISIONS (Permanent Record)

1. **EVL never touches money** — no deposits, no payments held, no title custody
2. **EVL never pulls credit** — customer self-reports from Credit Karma/Experian
3. **Find My Vehicle = find only** — no price verification (brokerage regulatory risk)
4. **SMS is always non-fatal** — emails fire independently of Twilio status
5. **Content gate uses appointmentId** — not login — simple and mobile-friendly
6. **125% LTV maximum** — drops to 115% for subprime credit tier
7. **BITOP is internal term only** — customer-facing language is "EVL Delivery Protection Check"
8. **My Buying Power is always free** — vetting tool that protects EVL from unqualified leads
9. **Reverse funnel pricing** — customer starts at $49 and EVL presents deeper buckets at trigger points
10. **CommonJS required for Vercel** — all API files use require() not import

---

## PENDING BUILDS (Next Session)

- [ ] Twilio number registration (check July 7, 2026 — Tuesday)
- [ ] Update TWILIO_PHONE_NUMBER + EVL_ADMIN_PHONE in Vercel once approved
- [ ] Stripe payment integration for $49 + $249 + $399 buckets
- [ ] End-to-end Phase 1→7 flow test with real customer data
- [ ] Embed My Buying Power tool directly into home page
- [ ] Lead notification system — alert EVL when new lead submits (currently silent)

---

## SESSION LOG — July 14, 2026

**Payment link delivery — fixed:**
- Root cause: `api/send-payment-link.js` was using dead EmailJS (wrong/deprecated template) and always returned `success: true` regardless of actual send result
- Fixed: email now sends via Resend (matching working pattern), response now reflects real per-channel success/failure
- Confirmed live end-to-end: both SMS and email delivery tested and working

**New: automatic welcome CTA message** (`api/send-welcome-message.js`):
- Fires automatically from all 4 customer intake forms: `find-my-vehicle.html`, `lead-intake.html`, `bd-submit.html`, `private-sale.html`
- Sends SMS + email with industry-stat value prop (dealer markup data) + home page link
- Uses general industry stats for now (Edmunds/NADA sourced) — swap in EVL's own performance stats once real volume exists

**Admin notification gap — fixed:**
- `bd-submit.html` and `private-sale.html` previously had NO admin alert at all (only `find-my-vehicle.html` did) — now all 4 forms alert `togradyevl@gmail.com` on submission

**Email consistency standardized across all customer emails:**
- All now include: "Thank you for your inquiry" opener, home page link, Call/Text number (469) 404-3192, and `reply_to: togradyevl@gmail.com` (previously replies would go nowhere, since `from` address is Resend's shared `onboarding@resend.dev`)

**BITOP defined and locked in:** B = Best Business Practice, I = Ideas, T = Thoughts, O = Other, P = Process & Procedures — internal decision framework, never shown in customer-facing copy

**Product decisions made:**
- Customers who already have a vehicle + dealer quote in hand should skip Find My Vehicle and route directly to Advisory — needs an intake qualifier question (not yet built)
- Trade-in evaluation is NOT a standalone bucket — it's bundled inside Advisory ($249)
- Bidding Dealer partners (CarMax/Carvana/SMTV) should NOT be named by brand before payment on `trade-in-exchange.html` — both CarMax and Carvana offer free instant online offers, so naming them upfront risks customers bypassing EVL entirely. Real value prop = simultaneous submission + side-by-side comparison + payoff coordination, not access itself
- Unrealistic customer price targets should be handled with data-backed range comparisons (target vs. realistic range with sourcing), not silence or false promises

**Twilio A2P status:** Campaign approved as of July 14, 2026 — SMS confirmed delivering end-to-end for the first time

**Repo naming — decided, closed:** GitHub repo name (`evl-decode`) traces back to the original VIN decoder build in May 2026, before the platform expanded — it no longer matches what the platform actually does, and doesn't match the Vercel project name (`evl-pro`). Considered renaming to `evl-pro` for consistency, but decided to leave it as-is — purely cosmetic naming mismatch, not a functional issue, not worth the risk/hassle of a rename. Not an open item — do not re-raise unless Tim brings it up.

**Shared footer component built — `public/footer.js`:** one source of truth for the site footer (brand, nav links, Call/Text number, disclaimer), self-contained with its own inline styles so it works regardless of what CSS each page already has. Rolled out to 12 pages (`payment-collection`, `credit-score`, `bd-submit`, `trade-in-exchange`, `private-sale`, `privacy`, `terms`, `appointment-confirm`, `dealer-onboard`, `compare`, plus added to `faq.html` which previously had no footer at all). `leasing.html` kept its own page-specific legal disclaimer (Texas Transportation Code lease facilitator language) rather than being swapped to the generic component, since that language is legally significant to that page specifically — just had the Call/Text number added into its existing footer instead.

**Major bug fixed — 500+ dead-domain references across 27 files:** the decommissioned `evl-decode-two.vercel.app` domain (deleted July 3, 2026) was still hardcoded into nav bars, footers, and internal admin docs across 27 files — not just isolated footer text, but full navigation menus on some pages, meaning real visitors could have been clicking through to a dead site. Fixed via bulk find/replace: all `href="https://evl-decode-two.vercel.app/..."` converted to relative paths (`/...`), the one bare-domain external reference converted to `https://expressvehiclelocators.com`, and internal admin doc text labels updated to match. Verified zero remaining references across all files after the fix.

**CAN-SPAM compliance system built and verified live:** researched current TCPA/CAN-SPAM requirements (2026). Built: `public/unsubscribe.html` (real unsubscribe page, writes to new `evl_email_suppression` Firestore collection), suppression check added to both `send-welcome-message.js` and `send-payment-link.js` (checks Firestore before every send, skips if unsubscribed), physical mailing address added to both email footers (Evest Data Technology, 6860 North Dallas Parkway STE# 200, Plano, TX 75024), Unsubscribe + Terms and Conditions links added to both email templates. Firestore security rule added by Tim for `evl_email_suppression` (`allow read, write: if true`), tested end-to-end — unsubscribe flow confirmed working live.

**TCPA SMS consent — resolved via simplification, not a checkbox system:** rather than building consent-checkbox infrastructure (which requires permanent record-keeping, cross-channel opt-out sync, and versioning if disclosure text ever changes), simplified the welcome SMS to purely informational content ("thank you for your inquiry... team will be in touch") and moved the promotional stats/value-prop pitch to email only. This keeps the SMS under the lower "prior express consent" bar (satisfied by voluntarily giving a phone number when requesting service) rather than the higher "prior express written consent" bar required for marketing texts. Email retains the full pitch since CAN-SPAM's opt-out model doesn't require prior consent.

**Custom Resend sending domain — live (July 15, 2026):** added and verified `expressvehiclelocators.com` as a custom domain in Resend. 3 DNS records added in SiteGround (domain's DNS host, separate from Vercel which hosts the actual site): TXT `resend._domainkey` (DKIM), MX `send` priority 10, TXT `send` (SPF). Domain verified successfully. Both `api/send-welcome-message.js` and `api/send-payment-link.js` now send from `no-reply@expressvehiclelocators.com` instead of the shared `onboarding@resend.dev` testing address — reply_to remains `togradyevl@gmail.com`.

**CRITICAL FIX — Firebase Admin SDK was never initialized anywhere, confirmed and fixed (July 15, 2026):** Discovered while auditing the WS Exchange EmailJS bug that 7 API files (`auto-create-deal.js`, `charge-customer.js`, `escalate-verification.js`, `notify-salesperson.js`, `send-salesperson-link.js`, `send-verification-to-customer.js`, `upload-verification-video.js`) called `admin.firestore()` directly with zero credentials configured anywhere — meaning every one of them would crash the instant they touched Firestore. Fixed by creating `lib/firebaseAdmin.js`, a shared initializer using a new `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable (Tim generated this from Firebase Console → Project Settings → Service Accounts → Generate new private key, added to Vercel env vars). All 7 files updated to use the shared initializer. Also fixed a separate pre-existing syntax error in `notify-salesperson.js` (duplicated/malformed object literal) that meant the file could not even load, let alone run. **Confirmed working end-to-end:** tested via `appointment-booking.html` → `auto-create-deal.js` — the `evl_deals` Firestore collection, which had never once been successfully created before, now exists with a real test document. This is the first confirmed-working write from any of these 7 previously-broken files.

**Still open on the WS Exchange audit:** the EmailJS silent-failure bug itself (as opposed to the Firebase Admin init bug) is still unfixed in these files plus 4 more (`service-vault.html`, `deal-gap.html`, `evl-notif-engine.html`, `ws-exchange.html`) — see EVL-QUEUE.md.

**EmailJS eliminated entirely across the whole codebase (July 15, 2026) — COMPLETE:** Full sweep found EmailJS in 7 files total (not the originally-found 6 — `appointment-confirm.html` had 4 more calls not caught in the first pass). Fixed via 3 new shared Resend-based backend endpoints:
- `api/notify-admin.js` — general-purpose admin alert email (used by `service-vault.html`, `deal-gap.html`)
- `api/send-auction-notification.js` — all 5 live-auction dealer notification types (unitCard, nudge, outbid, finalCall, winner), used by both `evl-notif-engine.html` and `ws-exchange.html` (two separate parallel implementations of the same 6 templates existed — now both route through this one shared endpoint). Also added the 6th type, `unitSold`, which had **never been built** before (previous code had an empty template ID with a comment "create in EmailJS dashboard" — the feature had simply never worked).
- `api/send-appointment-confirmation-emails.js` — the 4-recipient appointment flow (GSM, Salesperson, Customer, Admin) previously in `appointment-confirm.html`

Every email send anywhere in the platform now reports real success/failure via Resend's actual API response, instead of silently claiming success. All dead EmailJS `<script>` library includes removed from all 7 HTML files. Confirmed via full codebase grep: zero remaining `emailjs.send`, `emailjs.init`, or `api.emailjs.com` references anywhere.

**Note on `notify-lead.js`:** still sends from the old `onboarding@resend.dev` shared address rather than the verified custom domain — minor inconsistency, low priority, could be updated to match the other endpoints later.

**WS Exchange side brought to compliance parity with retail (July 15, 2026):** Tim caught that the CAN-SPAM/suppression work only covered the retail intake side. Created `lib/emailCompliance.js` (shared `isEmailSuppressed()` + `complianceFooter()`, one source of truth) and applied it to all real third-party emails: `send-auction-notification.js` (dealers), `send-appointment-confirmation-emails.js` (GSM/Salesperson/Customer — not the Admin portion), `send-verification-to-customer.js` (customer), `send-appointment-notifications.js` (customer — not the Admin portion). Admin-only alerts to Tim deliberately excluded since those aren't third-party commercial email. Shared suppression list decision: same `evl_email_suppression` collection used for both dealers and retail customers (simpler, more conservative — an unsubscribe anywhere is honored everywhere).

**"In Case of Accident" — real feature built and verified working (July 15-16, 2026):** Built into `service-vault.html` as a full 8-drawer accordion (Emergency w/ 911 button and do-not-admit-guilt banner, Towing guidance, Trunk Emergency Kit checklist, Saved Contacts incl. Insurance Agent, Coverage Review checklist, Body Shop Repair Tracking, Incident Dossier with dynamic multi-party/witness rows and Cloudinary photo uploads for DL/insurance cards/damage photos, and Word Tracks & Q&A scripts for calling the dealership/insurance/body shop). Saves/loads by email to new `evl_email_suppression`-adjacent collection `evl_accident_cards`. Text sizing increased throughout for real-world visibility (darkness, low phone battery, stress). **Bug found and fixed:** the Firestore rule Tim pasted for `evl_accident_cards` landed nested inside the `evl_auctions` match block instead of as its own top-level block — meant the rule was scoped to a non-existent sub-collection path and had zero effect on the real collection, causing "missing permissions" errors on every save/load attempt despite the rule appearing to exist. Fixed by moving it to be a sibling block between `evl_auctions` and `evl_ws_dealers`. Confirmed working end-to-end: save and load both tested successfully live.

**Number roles clarified:**
- `+14699912870` — Twilio SYSTEM number, automated SMS only, not for public display
- `(469) 404-3192` — Tim's real, personally-answered second business line — this is the customer-facing "Call or Text" number

**Still open / pending decisions:**
- [ ] Footer phone number rollout — 16 separate HTML files currently duplicate the footer with no shared component; decision needed: patch all 16 now vs. build shared footer component first
- [ ] Custom Resend sending domain (`no-reply@expressvehiclelocators.com`) instead of shared `onboarding@resend.dev` — needs DNS setup
- [ ] Intake qualifier question for "already have a quote" customer routing — not yet built
- [ ] Stripe payment links still needed for Advisory ($249), Full Service ($399), Service Vault tiers

---

## BUCKET 10 — AFTERMARKET UPGRADES (Spec locked July 17, 2026, not yet built)

**Business model:** RepairPal/CarAdvise style (subscription/certification), explicitly NOT Angi/HomeAdvisor style (pay-per-lead auction). Angi flagged as cautionary tale — shared leads sold to 3-8 competing shops, true cost-per-customer $250-$1,200+, 15-20% close rates, real lawsuit history over lead quality.

**Why NOT to copy Angi:** contradicts EVL's trust-first brand. EVL's structural advantage over Angi: referrals are warm (customer already trusts EVL from the vehicle purchase) vs. Angi's cold web-form leads — should convert far above Angi's 15-20%.

**Scope decision — what's IN vs OUT:**
- IN (real white space dealers don't cover): Lift Kits & Suspension, Wheels & Tires, Light Bars/Off-Road Lighting, Bed Accessories
- OUT — Tint / Wraps: most dealers already sell this as a pack item or F&I add-on. Upselling it would directly contradict EVL's own Deal Gap Analysis, which flags "dealer add-ons baked into the listing" as something to question, not something to buy more of.
- OUT — Audio/Electronics: not a priority category per Tim.
- Only surfaces for Truck/SUV customers (ties to existing Trucks/SUVs/Luxury/Electric category cards on home.html) — Luxury/Electric buyers never see this feature.

**Two-sided brand logic (no contradiction):**
- Dealer already installed something (tint, etch guards, wheel locks) → EVL's job is to flag it as a possible markup via Deal Gap Analysis, not sell more of it.
- Dealer doesn't offer something (lift, wheels, light bars) → EVL's job is to connect the customer to a vetted certified shop at fair, transparent pricing.

**Certified Shop Network — vetting bar:**
Higher than a typical tint-shop certification, because lift kits and wheel/tire upgrades can affect factory warranty coverage and insurance. Certification should require: verified installer credentials, proof of liability insurance, and a workmanship warranty that doesn't void the vehicle's factory coverage.

**Customer-facing flow:**
```
TRIGGER: post-delivery, surfaces inside Glovebox/Service Vault
        ↓
STEP 1 — Category Select (Trucks/SUV customers only)
  🔧 Lift Kits & Suspension
  🛞 Wheels & Tires
  💡 Light Bars / Off-Road Lighting
  🛏️ Bed Accessories
        ↓
STEP 2 — Certified Shop Results (2-3 shops max — never a bidding war / shared-lead auction)
  Each card: ✅ EVL Certified badge, shop name + distance, verified rating
  (pulled from shop's own system), warranty terms, "EVL Certified Pricing"
        ↓
STEP 3 — Customer picks a shop
  → EVL logs referral (new Firestore collection: evl_aftermarket_referrals)
  → Customer gets shop's direct contact info to book
```

**Shop-side flow (separate, admin-facing, build order TBD):**
```
Shop applies to join "EVL Certified" network
        ↓
EVL vets: install certs, liability insurance, warranty terms, customer satisfaction data
        ↓
Approved → shop pays monthly certification fee (Stripe subscription)
        ↓
Shop appears in customer-facing directory for their category + hub
```

**Revenue shape:** Referral/commission per closed job (original Bucket 10 scope) PLUS shop-side monthly certification fee (RepairPal layer, added July 17, 2026). Optional future layer: use EVL's aggregated customer volume across certified shops to negotiate real bulk pricing (CarAdvise-style), same synthesis used for the general Service Vault / service-shopping research from July 16, 2026.

**Status:** ✅ Built and tested end-to-end, July 17-18, 2026. Customer directory (`/aftermarket`), shop application (`/aftermarket-apply`), admin approval (`/admin-aftermarket`) all live. ZIP-based hub matching added so results are location-filtered across all 22 canonical hub markets, not just DFW. Admin auth upgraded from PIN-only to real Firebase Auth login (matches admin-leads.html pattern) so Firestore `isAdmin()` rules actually work. Firestore rules for `evl_aftermarket_shops`, `evl_aftermarket_referrals`, `evl_aftermarket_applications` published to Firebase Console.

---

## MAINTENANCE LEDGER (Built July 17-18, 2026)

**What it is:** A drawer inside `service-vault.html`, alongside the existing window sticker and In Case of Accident sections. Three parts:
1. **What's Due** — VIN decode (NHTSA) or Year/Make/Model fallback (VIN is optional, customer is never stuck without one) + current mileage → generic mileage-interval maintenance schedule. Placeholder until a licensed OEM data source (VehicleDatabases.com or DataOne) is subscribed to for exact factory schedules.
2. **Tire Age Check** — customer enters the 4-digit DOT code from the tire sidewall, gets real manufacture date and age, flagged against the 6-10 year safety window. Explicitly independent of tread depth or how long the customer has owned the vehicle — ownership length was never a reliable proxy for tire age, since tires can sit unsold for years before ever being mounted.
3. **Service History Ledger** — customer logs service entries with 3 confidence tiers: self-reported (no proof), receipt upload (Cloudinary), or pre-EVL (happened before the customer started using EVL). A 4th tier, "EVL Certified shop," exists in the code (`CONFIDENCE_LABELS.certified`) but nothing sets it yet — that activates once a certified service-shop network (Aftermarket-style) exists for maintenance categories.

**Identity model:** Same as the existing accident-cards feature on the same page — customer identified by email, not a Firebase Auth login. Matches the existing precedent already in `service-vault.html`.

**Admin mirrored view:** `/admin-service-ledger` — real Firebase Auth login (not PIN), search any customer's ledger by email, same entries and same confidence badges the customer sees, nothing hidden or added on the admin side.

**Status:** ✅ Built and tested end-to-end, July 17-18, 2026. Firestore rule for `evl_service_ledger` published.

---

## NEXT-SESSION TASKS

**1. WordPress legacy page audit (started July 18-19, 2026)**

**How to reconnect (no DNS changes needed):** `expressvehiclelocators.com` now points to Vercel, so `wp-admin` and the SiteGround "auto-login" button both fail — they route through the real domain, which Vercel intercepts. The working path that bypasses this entirely:
SiteGround Site Tools → **Site → MySQL → phpMyAdmin**. This runs on `tools.siteground.com` directly, never touches the actual domain. Database is `dblfsbge2zuuxx` (label: `expressvehiclelocators.com/`), table prefix is `yvl_` (not the WordPress default `wp_`). Page content lives in `yvl_posts`, filtered with `WHERE post_type = 'page'`.
⚠️ If phpMyAdmin auto-fills a query box with an `UPDATE ... WHERE 1` template, do NOT run it — that overwrites every row in the table with placeholder text. Always clear the box and paste a plain `SELECT` first.
For actual visual wp-admin access (not just raw content pulls), the next option to try is SiteGround **Domain → DNS Zone Editor** — add a new A record (e.g. `wpaudit` → `34.174.62.87`), which creates a subdomain pointing straight to the SiteGround server, sidestepping Vercel without touching the main site's DNS at all. Not yet attempted — phpMyAdmin worked first.

**Full page list pulled** — 69 pages total in `yvl_posts` (not 68 as first estimated). Triaged into three buckets:

🟢 **Clearly superseded — safe to leave alone on WP:** 01//HOME (×2), 02//FIND, 03//EXCHANGE, Find Your Vehicle 2, Home Page, Home Page - Template, HOME TEST, Trade-in Evaluation, Privacy Policy (draft), EVL-Admin, EVL Console 2026, EVL Dashboard 2026, 06//Onboarding

🟡 **Low priority, likely generic/duplicate:** Experience, Finance, Financing Assistance Services, How It Works, Services, Success, Thank You, Results, Checkout, Audit-Success, Contact, Dealer Registration Porta

🔴 **High-value — review content before next build, in this order:**
1. **Truck Customization Protocol** (2 copies, IDs 543 & 514) — likely directly relevant to the Aftermarket Network built July 17-18
2. **Vendor Membership** / **Vendor Registration** — possibly a more thought-out shop-application flow than what was built from scratch for Aftermarket
3. **EVL Trade-In: Legal, Documentation, and ID Verification Requirements** — likely real compliance research tied to the Title Eligibility Gate
4. **Incentive Reference Links (Private)** — could feed Deal Gap Analysis rebate/incentive research directly
5. **Real Time Lease Calculus**, **EVL - Lease Match Console** — possible unbuilt lease features
6. **07//WS-CLAUDE - USED CAR TITLE CLERK DIRECTORY** — appears to be prior AI-assisted work, possibly ready-made
7. **Aged Inventory & Market Analytics**, **EVL - Nationwide Scan Engine**, **Vehicle Acquisition Radar** — possible dealer-sourcing tools relevant to WS Exchange's planned national expansion
8. **Electric Charging Stations**, **Vehicle Protection**, **Protective Service Center**, **Paintless Dent Repair (PDR) service** — possible content for Service Vault or future Aftermarket categories
9. **Virtual Test Drive** — the page that originally prompted this whole audit; read actual content before building the Low-tier version from scratch

**Status:** List pulled and triaged. Actual content of the 🔴 list has not yet been reviewed — that's the next-session starting point, beginning with Truck Customization Protocol.

**2. Virtual Test Drive (concept locked July 18, 2026, not yet built)**
Customer video-calls someone at the dealership to remotely walk around/inspect a vehicle before committing — especially valuable given EVL's multi-hub model, where a customer may be shopping a vehicle in a market they can't easily drive to.

Three build-effort tiers discussed:
- **Low** (recommended starting point) — new appointment type reusing 100% of existing appointment + Twilio SMS infrastructure. Salesperson manually starts a FaceTime/Zoom/Google Meet call at the scheduled time; EVL just handles scheduling and reminder texts. No new vendor integration, no new cost.
- **Medium** — EVL auto-generates a real Zoom meeting link at time of booking via Zoom API integration. Requires a new Zoom developer account/OAuth setup.
- **High** — video calling fully embedded inside the EVL platform itself (Twilio Video or similar), no external app needed. Real ongoing per-minute cost, biggest technical lift.

Direction discussed but not yet confirmed as final: start with Low tier to validate demand before investing in Medium or High.

**3. WordPress audit — Incentive Reference Links (Private) content confirmed (July 21, 2026)**
Pulled the actual content of this page (ID 817) via phpMyAdmin. It's just a static list of 16 manufacturer incentive page URLs (Toyota, Ford, Chevrolet, Honda, Nissan, Hyundai, Kia, Jeep, Dodge, Ram, Subaru, Volkswagen, Mazda, Chrysler, GMC, Buick), no researched rebate data, no employer-perks content. Reclassified from 🔴 high-value to 🟡 low-priority/easily-recreated — nothing here needs careful migration. Remaining 🔴 pages from the July 18 audit still need the same treatment (pull actual content before deciding keep/port/discard), starting with Truck Customization Protocol.

**4. Employer-perks auto-buying channel — research only, not yet actioned (July 21, 2026)**
Sparked by a TrueCar/Lifecare lead Tim saw at his dealership (Dow Chemical employee, "Buyer's Bonus up to $2,000"). Confirmed via web research: this is **one single TrueCar-funded program**, white-labeled across at least 8 employee-perks marketplace portals (Lifecare, PerkSpot, Beneplace, Working Advantage, BenefitHub, Perks At Work, Carperks, Corporate Perks). Mechanics confirmed from actual terms and conditions:
- The $2,000 is a cap on two separate insurance-backed reimbursements (20% repair cost up to $500 x2/year, plus deductible reimbursement up to $500 x2/year), underwritten by Voyager Indemnity Insurance Company (an Assurant company)
- TrueCar funds the insurance premium itself as a customer-acquisition cost
- TrueCar's real revenue comes from fees charged to Certified Dealers for access to the buyer pipeline this whole network (including all 8 portals) feeds them
- The 8 portals are pure distribution/branding partners, not separate funders — employers pay the portal company one flat fee for the whole perks catalog, not specifically for the car-buying line item

**Why this matters for EVL, if pursued later:** two possible angles — (a) approach the 8 portal companies to get EVL listed as an alternative to TrueCar, or (b) approach large employers directly to pitch EVL as a better version of what TrueCar already gives their employees. Any EVL-side perk wouldn't need new revenue to fund it — could mirror TrueCar's model and be paid for out of existing EVL service margin (Find My Vehicle, Deal Gap, Trade-In, Finance Rate) as a customer-acquisition/retention cost, not a new business line. **Status: idea logged for future discussion, no action taken.**

**5. WordPress audit — Truck Customization Protocol content confirmed, data harvested (July 21, 2026)**
Pulled content for both copies (IDs 543 & 514). Both are simple "request a custom build" contact forms (customer fills in truck year/make/model, lift type, brand, wheel/tire size, accessories, budget, contact info, submits via `mailto:`) — no vetted-shop matching, no certification, no backend database. **Fully superseded by the Aftermarket Network built July 17-18** — nothing here needs porting as a page. Both copies safe to leave alone on WP or delete later.

Reference data worth keeping for a future Aftermarket price-reference sheet (same pattern as the Maintenance Ledger's admin-only price reference):
- **Real lift kit brand names** (useful for shop vetting/certification criteria): Rough Country, Pro Comp, Fabtech, BDS Suspension, Fox Racing, King Shocks, ICON Vehicle Dynamics
- **Lift height price bands**: Leveling (1-3"): $800-1,500 · Suspension Lift (3-6"): $2,500-4,500 · Long Travel (6-10"): $5,000-8,000 · Extreme Lift (10"+): $8,000-15,000
- **Additional category ideas beyond the current 4** (Lift Kits & Suspension, Wheels & Tires, Light Bars, Bed Accessories): custom bumpers, winch, off-road lighting, performance exhaust, engine tuning, running boards/steps — not yet evaluated for inclusion, flagging for future discussion since some (exhaust, engine tuning) may carry emissions/warranty complexity worth a BITOP pass before adding.

**Audit progress:** Incentive Reference Links ✅ reviewed (low-value) · Truck Customization Protocol ✅ reviewed (superseded, data harvested) · Vendor Membership/Vendor Registration ✅ reviewed (empty plugin shortcodes, no content) · EVL Trade-In Legal/Documentation ✅ reviewed (see below, needs form-number correction) · Next up: Real Time Lease Calculus / EVL - Lease Match Console.

**6. WordPress audit — Vendor Membership / Vendor Registration confirmed empty (July 21, 2026)**
IDs 288 & 289. Both pages contain only a single WCFM Marketplace plugin shortcode each (`[wcfm_vendor_membership]`, `[wcfm_vendor_registration]`) — zero custom content, purely plugin-generated placeholder pages. Nothing to review, port, or preserve. Safe to delete or ignore.

**7. WordPress audit — EVL Trade-In: Legal, Documentation, and ID Verification Requirements confirmed (July 21, 2026)**
ID 1062. This one has real substance — worth handling carefully rather than discarding.

Standard trade-in document checklist (with requirement levels): Vehicle Title (mandatory, must match seller's government ID), Government-Issued ID (mandatory), Vehicle Registration (mandatory), Proof of Insurance (mandatory), Loan Payoff Information (as applicable), Lien Release (as applicable), Maintenance Records (recommended), All Keys and Manuals (recommended).

Special legal scenarios covered — genuinely valuable edge cases not currently handled anywhere on the live platform:
- **Deceased owner, in probate:** Letters of Administration, certified death certificate, vehicle title (or replacement form), Statement of Facts, odometer disclosure if applicable
- **Deceased owner, without probate:** Affidavit for Transfer Without Probate, certified death certificate, vehicle title, plus a required 40-day waiting period after the owner's death
- **Divorce:** both parties must mutually agree and sign the title (content appears to cut off here in the source — may be incomplete)

**⚠️ Critical flag before this goes anywhere customer- or salesperson-facing:** the specific form numbers cited (REG 5, REG 227, REG 256, REG 262) are **California DMV form numbers** — the "REG" prefix is a California-specific naming convention. EVL's launch state is Texas, with TX/TN/CO/WA/MN/NC/OH/MI/NV as the other green-light states. **None of these California form numbers are correct for any state EVL currently operates in.** Texas uses different forms entirely (e.g., Form 130-U for title applications, VTR-262 for heirship affidavits). If this were used as-is with a Texas customer, it would be actively incorrect legal/procedural guidance.

**Verdict:** the overall structure (standard doc checklist + deceased-owner/divorce edge cases) is good and worth building into the trade-in flow eventually — these are real situations that will come up. But the specific form numbers must be re-verified per state before any of this becomes customer-facing or salesperson-facing guidance. Not a "port as-is" — a "good outline, wrong jurisdiction" situation. Flagged for correction, not yet built anywhere.

**8. WordPress audit — Real Time Lease Calculus / EVL - Lease Match Console confirmed, corrected verdict (July 21, 2026)**
IDs 1635 & 1654. Both are styled dark-theme mockups pitching a "pay $495 to unlock the exact matched vehicle" lease concept — but the payment figures are hardcoded static text, sliders don't actually compute anything, both CTA buttons link to a literal placeholder (`INSERT_PAYMENT_LINK_HERE`), and the "live activity ticker" at the bottom is fabricated fake social proof (static text dressed as a real-time feed) — a deceptive pattern worth explicitly avoiding, not just noting.

**Initial assessment was wrong and got corrected in-session:** first pass called this a "worth keeping as a future roadmap concept" since it looked like a novel unbuilt idea. Tim asked directly whether EVL already has a lease calculator — checking the live repo confirmed `leasing.html` already has a **real, working lease math engine**: an actual `calculateLease()` JS function computing residual dollar value, depreciation charge, and finance charge from real inputs (MSRP, cap cost, residual %, money factor, term, tax), plus genuine educational content (money factor markup detection, MF-to-APR conversion, per-brand residual/MF tracking sourced from Edmunds/Leasehackr/MarketCheck) built around an "EVL Lease Intelligence Report" concept.

**Corrected verdict:** these two WP pages are **fully superseded** by something that already exists in a genuinely better state (real math vs. hardcoded fake numbers and a fabricated activity feed) — same category as Truck Customization Protocol. Discard, nothing to port. Lesson for the rest of this audit: check the live site before assessing a WP page's value, not just the page title/content in isolation.

**Audit progress:** 6 of 8 high-value items reviewed. Next up: 07//WS-CLAUDE - USED CAR TITLE CLERK DIRECTORY.

---

*Last updated: July 21, 2026*
*Maintained by: Claude (Anthropic) in partnership with Tim O'Grady, EVL Founder*
