// Local static preview with Cloudflare-style headers and real 404s. Not a production server.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const prefix=JSON.parse(await fs.readFile(path.join(root,'site.webmanifest'),'utf8')).start_url.replace(/\/$/,'');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
const headerText=await fs.readFile(path.join(root,'_headers'),'utf8');
const csp=headerText.split('\n').find(x=>x.trim().startsWith('Content-Security-Policy:'))?.trim().slice('Content-Security-Policy: '.length);
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');const incoming=decodeURIComponent(url.pathname);
  if(prefix&&!(incoming===prefix||incoming.startsWith(prefix+'/'))){res.writeHead(404);res.end('Not found');return;}
  const requestPath=prefix?incoming.slice(prefix.length)||'/':incoming;
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Method not allowed');return;}
  const aliases={'/services/website-design/':'/services/web-design/','/services/digital-marketing/':'/services/'};
  if(aliases[requestPath]){res.writeHead(301,{Location:prefix+aliases[requestPath]});res.end();return;}
  let resolved=path.resolve(root,'.'+requestPath);
  if((resolved!==root&&!resolved.startsWith(root+path.sep))||requestPath.includes('..')||requestPath.startsWith('/_')){res.writeHead(404);res.end('Not found');return;}
  let stat=await fs.stat(resolved).catch(()=>null);
  if(stat?.isDirectory()){
   if(!requestPath.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search});res.end();return;}
   resolved=path.join(resolved,'index.html');stat=await fs.stat(resolved).catch(()=>null);
  }
  let status=200;
  if(!stat?.isFile()){resolved=path.join(root,'404.html');status=404;}
  const data=await fs.readFile(resolved);
  res.writeHead(status,{'Content-Type':types[path.extname(resolved)]||'application/octet-stream','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()','Content-Security-Policy':csp,'Cache-Control':requestPath.startsWith('/assets/')?'public, max-age=31536000, immutable':'public, max-age=0, must-revalidate'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(400);res.end('Bad request');}
});
const port=Number(process.env.PORT||4173);server.listen(port,'0.0.0.0',()=>console.log(`Static preview listening on port ${port}.`));
