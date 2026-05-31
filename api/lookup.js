export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const vin = (req.query.vin || '').toUpperCase().trim();
  if (!vin || vin.length !== 17) return res.status(400).json({ error: 'Valid VIN required' });

  try {
    const TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'timogrady01/evl-decode';
    const FILE = 'data/submissions.json';

    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
      headers: { 'Authorization': `token ${TOKEN}` }
    });

    if (!getRes.ok) return res.status(200).json({ found: false });

    const fileData = await getRes.json();
    let submissions = {};
    try { submissions = JSON.parse(Buffer.from(fileData.content, 'base64').toString()); } catch(e){}

    const submission = submissions[vin];
    if (!submission) return res.status(200).json({ found: false, vin });

    return res.status(200).json({ found: true, submission });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}