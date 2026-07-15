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

**Number roles clarified:**
- `+14699912870` — Twilio SYSTEM number, automated SMS only, not for public display
- `(469) 404-3192` — Tim's real, personally-answered second business line — this is the customer-facing "Call or Text" number

**Still open / pending decisions:**
- [ ] Footer phone number rollout — 16 separate HTML files currently duplicate the footer with no shared component; decision needed: patch all 16 now vs. build shared footer component first
- [ ] Custom Resend sending domain (`no-reply@expressvehiclelocators.com`) instead of shared `onboarding@resend.dev` — needs DNS setup
- [ ] Intake qualifier question for "already have a quote" customer routing — not yet built
- [ ] Stripe payment links still needed for Advisory ($249), Full Service ($399), Service Vault tiers

---

*Last updated: July 14, 2026*
*Maintained by: Claude (Anthropic) in partnership with Tim O'Grady, EVL Founder*
