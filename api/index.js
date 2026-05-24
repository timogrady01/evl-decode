import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
