export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const vin = (req.query.vin || "").trim().toUpperCase();
  if (!vin || vin.length !== 17) {
    return res.status(400).json({ error: "Invalid VIN" });
  }

  try {
    // NHTSA — free, no key, reliable
    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
    const response = await fetch(nhtsaUrl);
    if (!response.ok) throw new Error("NHTSA fetch failed");
    const data = await response.json();
    
    if (!data.Results) throw new Error("No results");
    
    // Map NHTSA fields to our format
    const r = {};
    data.Results.forEach(item => {
      if (item.Value && item.Value !== "Not Applicable" && item.Value !== "null") {
        r[item.Variable] = item.Value;
      }
    });

    // Build cylinders string
    const cyls = r["Engine Number of Cylinders"] ? r["Engine Number of Cylinders"] + "-cyl" : "";
    const disp = r["Displacement (L)"] ? parseFloat(r["Displacement (L)"]).toFixed(1) + "L" : "";
    const engineStr = [disp, cyls].filter(Boolean).join(" ");

    const result = {
      year: parseInt(r["Model Year"]) || null,
      make: r["Make"] || "",
      model: r["Model"] || "",
      trim: r["Trim"] || r["Series"] || "",
      body_type: r["Body Class"] || "",
      engine: engineStr,
      engine_size: r["Displacement (L)"] ? parseFloat(r["Displacement (L)"]).toFixed(1) : "",
      transmission: r["Transmission Style"] || "",
      drivetrain: r["Drive Type"] || "",
      fuel_type: r["Fuel Type - Primary"] || "",
      doors: r["Number of Doors"] || "",
      city_mpg: r["City mpg"] || "",
      highway_mpg: r["Highway mpg"] || "",
      msrp: 0,
      build: {
        year: parseInt(r["Model Year"]) || null,
        make: r["Make"] || "",
        model: r["Model"] || "",
        trim: r["Trim"] || r["Series"] || "",
      }
    };

    return res.status(200).json(result);

  } catch (err) {
    // Fallback to MarketCheck
    const API_KEY = "FXGNAHEEcDXs6ZrDowNjf8WcMhj4dhyU";
    try {
      const mcUrl = `https://api.marketcheck.com/v2/decode/car/${vin}/specs?api_key=${API_KEY}`;
      const mcRes = await fetch(mcUrl);
      if (mcRes.ok) {
        const mcData = await mcRes.json();
        if (mcData && !mcData.error) return res.status(200).json(mcData);
      }
    } catch(e) {}
    
    return res.status(500).json({ error: "Decode failed — check VIN and try again" });
  }
}
