export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({error:'no'}); return; }
  try {
    const { prompt, system } = req.body;
    const key = process.env.ANTHROPIC_API_KEY || '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';
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Authorization':'Bearer '+key},
      body: JSON.stringify({model:'llama3-70b-8192',messages:[{role:'system',content:system||'You are EVL Vehicle Intelligence. Expert vehicle advisor. Use ## headers and tables.'},{role:'user',content:prompt}],max_tokens:2000})
    });
    const d = await r.json();
    const content = d.choices?.[0]?.message?.content || '';
    res.status(200).json({content});
  } catch(e) {
    res.status(500).json({content:'',error:e.message});
  }
}
