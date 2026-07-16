# EVL — Active Queue

This is the running list of things flagged mid-conversation that need to be addressed later — by either Tim or Claude. Unlike `README.md` (the permanent build log of what's been decided/done), this file is meant to be edited constantly: items get added the moment they're flagged, and removed/checked off once resolved.

**Rule:** whenever either of us says "let's capture this for later," "queue this," or flags something that shouldn't get lost — it goes here immediately, not just at end of session.

---

## Open Items

- [ ] **Make my-deal.html's DD365-style timeline real (currently 100% hardcoded mockup).** The visual design from earlier sessions (6-stage timeline: Submitted → In Review → Match Found → Offer Ready → In Process → Delivered, with completed/current/greyscale states matching DD365) was built, but it's disconnected from any real data — always shows the same hardcoded "14%, In Review" regardless of customer. To make it real, needs: (1) a `dealStage` field on the customer's Firestore record, (2) `my-deal.html` reading that real field for the logged-in customer instead of hardcoded HTML, (3) an admin-side way (admin-leads.html or crm.html) for Tim to actually move a customer's stage forward when he engages with them, (4) eventually the DD365 follow-up cadence on top (Day 3 → Day 10 → Day 30, daily once near delivery/"Purple G" equivalent) — this ties directly into the not-yet-built `evl_communications` log (item above), since the cadence needs a record of what's been sent and when. **Additional detail from Tim (July 15):** DD365 also displays the customer's actual vehicle of choice alongside the stage tracker — equipment/features, similar to a window sticker (Monroney label) — not necessarily an exact replica, but the tracker should show the specific vehicle + its equipment, not just an abstract progress bar. Note: full DD365-stage-vs-EVL-stage comparison may have been discussed in more detail in a prior session not fully visible in current context — worth revisiting/confirming exact stage mapping before building if that detail matters. Ready to start whenever — full plan captured here.

- [ ] **Communications log (`evl_communications` collection)** — no permanent record currently exists of emails/texts sent to customers (only ephemeral Vercel server logs). Need a new collection logging every send: customerPhone, customerEmail, leadId, type (sms/email), purpose, content, status, providerMessageId, timestamp. Should be viewable per-customer from `crm.html`.

- [ ] **admin-leads.html vs crm.html consolidation** — two overlapping admin tools both read `evl_leads` independently (crm.html also pulls evl_deals, evl_appointments, evl_notes; admin-leads.html has the Send Payment Link button crm.html lacks). Decided to keep separate for now given solo-operator scale; `crm.html` is the intended long-term home for full customer view (including future comms log). Revisit consolidation later.

- [ ] **Role-Based Access Control (RBAC) — future, not urgent.** Currently NO real per-user authentication exists anywhere in the admin tools (all PINs unified to 1027 during dev, Firestore rules mostly `allow read, write: if true`). DealerSocket-style Manager vs. Salesperson access levels aren't buildable until real auth (actual logins) exists first. Revisit once EVL actually onboards staff or dealer partners needing restricted logins — not needed while solo-operated.

- [ ] **SiteGround DNS Zone Editor shows "Your domain's A record is not pointed to this website"** — noticed while adding Resend DNS records (July 14, 2026). Site is live and working via Vercel right now, so this warning is likely just SiteGround referring to its own hosting (not an actual live issue) — but worth understanding/confirming what this means before ignoring it long-term.

- [ ] **If/when domain DNS fully migrates away from SiteGround** (e.g. to Vercel DNS) as part of finishing the WordPress→Vercel migration: remember to re-add the 3 Resend email verification DNS records (TXT `resend._domainkey`, MX `send`, TXT `send`) at the new DNS host — email verification does not automatically carry over between DNS providers.

- [ ] **"Already have a quote" intake qualifier** — need a question at the start of intake to route customers who already have a vehicle + dealer quote directly to Advisory ($249) instead of Find My Vehicle ($49).

- [ ] **Remaining Stripe payment links** — Advisory ($249), Full Service ($399), Service Vault tiers ($99/$199/$299/yr) still need live payment links created and embedded.

- [ ] **Stripe live mode switch** — still in test/sandbox mode; must switch before real customer payments.

- [ ] **ESS and DDT full inventory/labeling** — still pending from a prior session, not yet done.

- [ ] **notify-lead.js still sends from old `onboarding@resend.dev`** — minor inconsistency, low priority. Every other endpoint now sends from the verified `no-reply@expressvehiclelocators.com` domain; this one file was missed. Quick fix whenever convenient.

---

*Last updated: July 15, 2026*
