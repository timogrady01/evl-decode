export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const vin = (req.query.vin || "").trim().toUpperCase();
  if (!vin || vin.length !== 17) {
    return res.status(400).json({ error: "Invalid VIN" });
  }

  const API_KEY = "FXGNAHEEcDXs6ZrDowNjf8WcMhj4dhyU";
  
  // Try NeoVIN first (richer data), fall back to basic specs
  const urls = [
    `https://api.marketcheck.com/v2/decode/car/neovin/${vin}/specs?api_key=${API_KEY}`,
    `https://api.marketcheck.com/v2/decode/car/${vin}/specs?api_key=${API_KEY}`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      if (data && !data.error) {
        return res.status(200).json(data);
      }
    } catch (err) {
      continue;
    }
  }
  
  return res.status(500).json({ error: "Decode failed — check VIN and try again" });
}
