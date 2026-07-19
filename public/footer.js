// EVL Shared Footer Component
// One source of truth for the site footer — edit this file only.
// Every page includes this via: <script src="/footer.js"></script>

document.write(`
<style>
  footer{text-align:center;padding:48px 20px 32px;border-top:1px solid rgba(255,255,255,.08);}
  .footer-brand{font-size:22px;font-weight:900;letter-spacing:2px;margin-bottom:16px;color:#fff;font-family:var(--font,sans-serif);}
  .footer-brand span{color:var(--blue,#2B84FE);}
  .footer-links{display:flex;justify-content:center;gap:24px;margin-bottom:16px;flex-wrap:wrap;}
  .footer-links a{color:#ffffff;text-decoration:none;font-size:18px;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-family:var(--body,sans-serif);}
  .footer-contact{font-size:18px;color:#C8D0DC;font-family:var(--body,sans-serif);font-weight:700;margin-bottom:10px;}
  .footer-disclaimer{font-size:18px;color:#ffffff;font-family:var(--body,sans-serif);font-weight:600;}
</style>
<footer>
  <div class="footer-brand">EXPRESS <span>VEHICLE</span> LOCATORS</div>
  <div class="footer-links">
    <a href="/home">Home</a><a href="/find">Find My Car</a>
    <a href="/leasing">Leasing</a><a href="/contact">Contact</a>
  </div>
  <div class="footer-contact">Call or Text: (469) 404-3192</div>
  <div class="footer-disclaimer">AI specs for informational use only. EVL is a vehicle advisory platform — not a dealer.</div>
</footer>
`);
