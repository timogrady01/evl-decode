# EVL — Active Queue

This is the running list of things flagged mid-conversation that need to be addressed later — by either Tim or Claude. Unlike `README.md` (the permanent build log of what's been decided/done), this file is meant to be edited constantly: items get added the moment they're flagged, and removed/checked off once resolved.

**Rule:** whenever either of us says "let's capture this for later," "queue this," or flags something that shouldn't get lost — it goes here immediately, not just at end of session.

---

## Open Items

- [ ] **SiteGround DNS Zone Editor shows "Your domain's A record is not pointed to this website"** — noticed while adding Resend DNS records (July 14, 2026). Site is live and working via Vercel right now, so this warning is likely just SiteGround referring to its own hosting (not an actual live issue) — but worth understanding/confirming what this means before ignoring it long-term.

- [ ] **If/when domain DNS fully migrates away from SiteGround** (e.g. to Vercel DNS) as part of finishing the WordPress→Vercel migration: remember to re-add the 3 Resend email verification DNS records (TXT `resend._domainkey`, MX `send`, TXT `send`) at the new DNS host — email verification does not automatically carry over between DNS providers.

- [ ] **"Already have a quote" intake qualifier** — need a question at the start of intake to route customers who already have a vehicle + dealer quote directly to Advisory ($249) instead of Find My Vehicle ($49).

- [ ] **Remaining Stripe payment links** — Advisory ($249), Full Service ($399), Service Vault tiers ($99/$199/$299/yr) still need live payment links created and embedded.

- [ ] **Stripe live mode switch** — still in test/sandbox mode; must switch before real customer payments.

- [ ] **ESS and DDT full inventory/labeling** — still pending from a prior session, not yet done.

---

*Last updated: July 15, 2026*
