# EVL — Active Queue

This is the running list of things flagged mid-conversation that need to be addressed later — by either Tim or Claude. Unlike `README.md` (the permanent build log of what's been decided/done), this file is meant to be edited constantly: items get added the moment they're flagged, and removed/checked off once resolved.

**Rule:** whenever either of us says "let's capture this for later," "queue this," or flags something that shouldn't get lost — it goes here immediately, not just at end of session.

---

## Open Items

- [ ] **HIGH PRIORITY \u2014 WS Exchange side has the same silent-failure EmailJS bug as retail side had.** Confirmed in: `api/send-verification-to-customer.js`, `api/send-appointment-notifications.js` (both always return `success: true` regardless of actual EmailJS result, same pattern as the original `send-payment-link.js` bug). Plus 4 files calling EmailJS directly from the browser: `service-vault.html`, `deal-gap.html`, `evl-notif-engine.html`, `ws-exchange.html`. This affects live auction notifications (outbid alerts, final call, winner notification per the 6 active EmailJS templates: EVL-UNIT-CARD, EVL-HOURLY-NUDGE, EVL-OUTBID, EVL-FINAL-CALL, EVL-WINNER, EVL-UNIT-SOLD) \u2014 a dealer missing a real-time bid alert due to a silent failure is a real lost deal, more time-sensitive than the retail-side equivalent. Needs full audit + fix (same Resend-based pattern already proven working), ideally before real dealer auction volume increases.- [ ] **Communications log (`evl_communications` collection)** — no permanent record currently exists of emails/texts sent to customers (only ephemeral Vercel server logs). Need a new collection logging every send: customerPhone, customerEmail, leadId, type (sms/email), purpose, content, status, providerMessageId, timestamp. Should be viewable per-customer from `crm.html`.

- [ ] **admin-leads.html vs crm.html consolidation** — two overlapping admin tools both read `evl_leads` independently (crm.html also pulls evl_deals, evl_appointments, evl_notes; admin-leads.html has the Send Payment Link button crm.html lacks). Decided to keep separate for now given solo-operator scale; `crm.html` is the intended long-term home for full customer view (including future comms log). Revisit consolidation later.

- [ ] **Role-Based Access Control (RBAC) — future, not urgent.** Currently NO real per-user authentication exists anywhere in the admin tools (all PINs unified to 1027 during dev, Firestore rules mostly `allow read, write: if true`). DealerSocket-style Manager vs. Salesperson access levels aren't buildable until real auth (actual logins) exists first. Revisit once EVL actually onboards staff or dealer partners needing restricted logins \u2014 not needed while solo-operated.- [ ] **SiteGround DNS Zone Editor shows "Your domain's A record is not pointed to this website"** — noticed while adding Resend DNS records (July 14, 2026). Site is live and working via Vercel right now, so this warning is likely just SiteGround referring to its own hosting (not an actual live issue) — but worth understanding/confirming what this means before ignoring it long-term.

- [ ] **If/when domain DNS fully migrates away from SiteGround** (e.g. to Vercel DNS) as part of finishing the WordPress→Vercel migration: remember to re-add the 3 Resend email verification DNS records (TXT `resend._domainkey`, MX `send`, TXT `send`) at the new DNS host — email verification does not automatically carry over between DNS providers.

- [ ] **"Already have a quote" intake qualifier** — need a question at the start of intake to route customers who already have a vehicle + dealer quote directly to Advisory ($249) instead of Find My Vehicle ($49).

- [ ] **Remaining Stripe payment links** — Advisory ($249), Full Service ($399), Service Vault tiers ($99/$199/$299/yr) still need live payment links created and embedded.

- [ ] **Stripe live mode switch** — still in test/sandbox mode; must switch before real customer payments.

- [ ] **ESS and DDT full inventory/labeling** — still pending from a prior session, not yet done.

---

*Last updated: July 15, 2026*
