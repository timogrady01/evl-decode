export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const vin = (req.query.vin || "").trim().toUpperCase();
  if (!vin || vin.length !== 17) {
    return res.status(400).json({ error: "Invalid VIN" });
  }

  const API_KEY = "B15ZgwOllF2pSbOTaxeNmq8mV9VpoELj";
  const API_SECRET = "JulWyRpLrjj6gVPj";
  
  // Try with api_key only first (standard endpoint)
  const url = `https://api.marketcheck.com/v2/decode/car/${vin}/specs?api_key=${API_KEY}&api_secret=${API_SECRET}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch(e) {
      return res.status(200).send(text);
    }
  } catch (err) {
    return res.status(500).json({ error: "Fetch failed", detail: err.message });
  }
}