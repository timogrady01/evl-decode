// Checks whether a customer's desired vehicle type + budget is actually viable
// by searching real, currently-listed inventory via MarketCheck's Active
// Inventory Search API. This is the "no charge until viable match" guardrail -
// runs BEFORE Find My Vehicle payment, not after.
//
// Query params: make, model, maxPrice, zip, radius (miles, default 250)
// Returns: { viable, matchCount, sampleListings, marketStats (if not viable) }

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const make = (req.query.make || "").trim();
  const model = (req.query.model || "").trim();
  const maxPrice = parseInt(req.query.maxPrice, 10);
  const zip = (req.query.zip || "").trim();
  const radius = parseInt(req.query.radius, 10) || 250;

  if (!make || !model || !maxPrice || !zip) {
    return res.status(400).json({ error: "make, model, maxPrice, and zip are all required" });
  }

  const API_KEY = "B15Zgw0IlF2pSbOTaxeNmq8mV9VpoELj";
  // Small buffer above stated budget - a listing $200 over isn't a real mismatch
  const priceBuffer = Math.round(maxPrice * 1.05);

  const searchUrl = `https://api.marketcheck.com/v2/search/car/active` +
    `?api_key=${API_KEY}` +
    `&make=${encodeURIComponent(make)}` +
    `&model=${encodeURIComponent(model)}` +
    `&price_range=0-${priceBuffer}` +
    `&zip=${encodeURIComponent(zip)}` +
    `&radius=${radius}` +
    `&rows=5` +
    `&stats=price`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "MarketCheck error", detail: errText });
    }
    const data = await response.json();
    const matchCount = data.num_found || 0;
    const viable = matchCount > 0;

    const result = {
      viable,
      matchCount,
      sampleListings: viable ? (data.listings || []).slice(0, 5).map(l => ({
        vin: l.vin, year: l.build?.year, make: l.build?.make, model: l.build?.model,
        trim: l.build?.trim, price: l.price, miles: l.miles,
        city: l.dealer?.city, state: l.dealer?.state, distance: l.dist
      })) : []
    };

    if (!viable) {
      // Not viable at this budget - search again WITHOUT the price cap to get real market stats
      const statsUrl = `https://api.marketcheck.com/v2/search/car/active` +
        `?api_key=${API_KEY}` +
        `&make=${encodeURIComponent(make)}` +
        `&model=${encodeURIComponent(model)}` +
        `&zip=${encodeURIComponent(zip)}` +
        `&radius=${radius}` +
        `&rows=1` +
        `&stats=price`;

      const statsResp = await fetch(statsUrl);
      if (statsResp.ok) {
        const statsData = await statsResp.json();
        result.marketStats = {
          totalListingsFound: statsData.num_found || 0,
          avgPrice: statsData.stats?.price?.mean ? Math.round(statsData.stats.price.mean) : null,
          minPrice: statsData.stats?.price?.min || null,
          maxPrice: statsData.stats?.price?.max || null
        };
      }
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Fetch failed", detail: err.message });
  }
}
