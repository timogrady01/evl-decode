// EVL Shared Logo/Brand Component
// One source of truth for the nav bar brand — edit this file only.
// Every page includes this via: <script src="/logo-brand.js"></script>
// Nav bar is text-only by design: the full icon+car mark is reserved for
// spacious placements (homepage hero, letterhead, print, merch) where it
// has room to be seen clearly. Cramped nav space is not one of those places.

document.write(`
<style>
  .evl-brand-link{display:flex;align-items:center;text-decoration:none;}
  .evl-brand-text{font-family:"Barlow Condensed",sans-serif;font-size:24px;font-weight:900;color:#fff;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;}
  .evl-brand-text span{color:#2B84FE;}
  @media(max-width:700px){.evl-brand-text{font-size:18px;}}
</style>
<a href="/home.html" class="evl-brand-link">
  <span class="evl-brand-text">Express <span>Vehicle</span> Locators</span>
</a>
`);
