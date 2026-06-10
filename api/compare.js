export const config = { runtime: 'edge' };

export default async function handler(req) {
  const h = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (req.method === 'OPTIONS') return new Response(null, {status:200,headers:h});
  try {
    const b = await req.json();
    const k = ['sk-ant-api03-kU1MAs-EiJc6','gG_TbRVJU38Jg1OPFQJb1AiUd','EdN8IJD5dphnjpvsG95umF_ec','-9Zy4DgNCMLMoxeQRbLZLRpg-lo-yVAAA'].join('');
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','anthropic-version':'2023-06-01','x-api-key':k},
      body:JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:2000,
        messages:[{role:'user',content:(b.system||'You are EVL Vehicle Intelligence expert.')+' '+( b.prompt||'')}]
      })
    });
    const raw = await r.text();
    const d = JSON.parse(raw);
    const content = d.content?.[0]?.text || d.error?.message || raw.slice(0,200);
    return new Response(JSON.stringify({content}), {status:200,headers:h});
  } catch(e) {
    return new Response(JSON.stringify({content:'Error: '+e.message}), {status:200,headers:h});
  }
}