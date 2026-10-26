import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const port = Number(process.env.PORT || 8080);
createServer(async (req, res) => {
  const path = req.url.split('?')[0];
  const files = {'/':'index.html','/index.html':'index.html','/native.js':'native.js'};
  if (!files[path]) { res.writeHead(404); res.end(); return; }
  try {
    const content = await readFile(new URL('../dist/' + files[path], import.meta.url));
    res.setHeader('Content-Type', path === '/native.js' ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8');
    res.end(content);
  } catch { res.writeHead(500); res.end('Execute npm run build.'); }
}).listen(port, '127.0.0.1', () => console.log(`Servidor web iniciado na porta ${port}.`));
