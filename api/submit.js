export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    const vin = (body.vin || '').toUpperCase().trim();
    if (!vin || vin.length !== 17) return res.status(400).json({ error: 'Valid 17-digit VIN required' });

    const TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'timogrady01/evl-decode';
    const FILE = 'data/submissions.json';

    // Get current file
    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
      headers: { 'Authorization': `token ${TOKEN}` }
    });
    const fileData = await getRes.json();
    let submissions = {};
    try { submissions = JSON.parse(Buffer.from(fileData.content, 'base64').toString()); } catch(e){}

    // Add submission
    submissions[vin] = {
      vin,
      year: body.year, make: body.make, model: body.model, trim: body.trim,
      mileage: body.mileage, condition: body.condition, zip: body.zip,
      features: body.features || [],
      customNotes: body.customNotes || '',
      contact: { name: body.name, email: body.email, phone: body.phone },
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Save back
    const saveRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
      method: 'PUT',
      headers: { 'Authorization': `token ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `New submission: ${vin}`,
        content: Buffer.from(JSON.stringify(submissions, null, 2)).toString('base64'),
        sha: fileData.sha
      })
    });

    if (!saveRes.ok) throw new Error('Failed to save submission');
    return res.status(200).json({ success: true, vin });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}