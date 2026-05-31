export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const TOKEN = process.env.GITHUB_TOKEN;
    const getRes = await fetch('https://api.github.com/repos/timogrady01/evl-decode/contents/data/submissions.json', {
      headers: { 'Authorization': `token ${TOKEN}` }
    });
    if (!getRes.ok) return res.status(200).json({ submissions: [] });
    const fileData = await getRes.json();
    let data = {};
    try { data = JSON.parse(Buffer.from(fileData.content, 'base64').toString()); } catch(e){}
    const submissions = Object.values(data).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    return res.status(200).json({ submissions, total: submissions.length });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}