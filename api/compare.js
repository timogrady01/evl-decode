export const config = { runtime: 'edge' };

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    const body = await req.json();
    const prompt = body.prompt || '';
    const system = body.system || 'You are EVL Vehicle Intelligence. Expert unbiased vehicle advisor. Use ## headers and markdown tables for comparisons.';
    
    const key = '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';
    
    const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await groqResp.json();
    const content = data?.choices?.[0]?.message?.content || '';
    
    return new Response(JSON.stringify({ content }), { status: 200, headers });
    
  } catch(err) {
    return new Response(JSON.stringify({ content: '', error: err.message }), { status: 200, headers });
  }
}
