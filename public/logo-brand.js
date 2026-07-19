// EVL Shared Logo/Brand Component
// One source of truth for the nav bar logo — edit this file only.
// Every page includes this via: <script src="/logo-brand.js"></script>
// It writes into a placeholder element: <div id="evl-brand"></div>

document.write(`
<style>
  .evl-brand-link{display:flex;align-items:center;gap:10px;text-decoration:none;}
  .evl-brand-icon{height:60px;width:auto;display:block;}
  .evl-brand-text{font-family:"Barlow Condensed",sans-serif;font-size:24px;font-weight:900;color:#fff;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;}
  .evl-brand-text span{color:#2B84FE;}
  @media(max-width:700px){.evl-brand-icon{height:32px;}.evl-brand-text{font-size:18px;}}
</style>
<a href="/home.html" class="evl-brand-link">
  <img src="/images/logo-icon-blue.png" alt="Express Vehicle Locators logo" class="evl-brand-icon">
  <span class="evl-brand-text">Express <span>Vehicle</span> Locators</span>
</a>
`);
