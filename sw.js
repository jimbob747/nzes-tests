/* NZES Test Recorder – offline shell. Page: network first, falls back to the saved copy. Libraries: saved copy first. Database calls are never cached here. */
const C='nzes-shell-v1';
const LIBS=['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
self.addEventListener('install',e=>{ self.skipWaiting();
  e.waitUntil(caches.open(C).then(c=>Promise.all(['./','manifest.webmanifest','icon.svg',...LIBS].map(u=>c.add(u).catch(()=>{}))))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('nzes-shell-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
const LIBHOST=/(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  if(LIBHOST.test(u.hostname)){ e.respondWith(caches.open(C).then(async c=>{ const hit=await c.match(r); if(hit) return hit; const res=await fetch(r); if(res&&(res.ok||res.type==='opaque')) c.put(r,res.clone()); return res; })); return; }
  if(u.origin!==self.location.origin) return;
  e.respondWith(caches.open(C).then(async c=>{
    const net=fetch(r).then(res=>{ if(res&&res.ok) c.put(r,res.clone()); return res; });
    const slow=new Promise(res=>setTimeout(async()=>res(await c.match(r,{ignoreSearch:true})),4000));
    try{ const first=await Promise.race([net,slow]); if(first) return first; return await net; }
    catch(_){ const hit=await c.match(r,{ignoreSearch:true}); if(hit) return hit; throw _; } }));
});
