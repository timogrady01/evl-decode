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
  const url = `https://mc-api.marketcheck.com/v2/decode/car/${vin}/specs?api_key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Fetch failed", detail: err.message });
  }
}
