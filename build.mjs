// パパ丸山さん用ページを鍵で暗号化して GitHub Pages 用に書き出す
// 使い方: node build.mjs   （鍵は .key。URL末尾 #k=鍵 で自動表示）
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';
const PW = readFileSync(new URL('.key', import.meta.url), 'utf8').trim();
const SRC = '/Users/morikawa/Desktop/Uracy法人化_パパ丸山/kickoff.html';
const URL_ = 'https://mm738966m-boop.github.io/uracy-share/';
const b64 = u8 => Buffer.from(u8).toString('base64');
const salt = crypto.getRandomValues(new Uint8Array(16));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(PW), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
let html = readFileSync(SRC, 'utf8')
  .replace(/<title>.*?<\/title>/s, '')
  .replace(/<meta name="claude:[^>]*>/, '')
  .replace(/<link [^>]*fonts\.g[^>]*>/g, '');
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(html)));
const data = new Uint8Array(12 + ct.length); data.set(iv); data.set(ct, 12);
const shell = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>Uracyを会社にするなら</title>
<meta name="description" content="パパ丸山さんとのZoomの前に読んでおいてほしい資料です（森川より）">
<meta property="og:title" content="Uracyを会社にするなら">
<meta property="og:description" content="パパ丸山さんとのZoomの前に読んでおいてほしい資料です（森川より）">
<meta property="og:url" content="${URL_}">
<meta property="og:image" content="${URL_}img/mascot_invite.webp">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@700;900&family=Noto+Sans+JP:wght@500;700&display=swap" rel="stylesheet">
<style>
html,body{margin:0}
#gate{min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px 20px;box-sizing:border-box;background:#EEF6F7;font-family:"Zen Maru Gothic","Hiragino Maru Gothic ProN",sans-serif}
#gate .in{width:100%;max-width:420px;background:#fff;border:1px solid #D5E4E6;border-radius:22px;padding:28px 24px;text-align:center;box-sizing:border-box}
#gate img{width:120px;height:auto}
#gate h1{font-size:24px;color:#0A5A62;margin:6px 0}
#gate p{margin:0;font-size:17px;color:#4A6468;line-height:1.75}
</style>
</head>
<body>
<div id="gate"><div class="in">
  <img src="img/mascot_invite.webp" alt="" width="120" height="120">
  <h1>Uracyを会社にするなら</h1>
  <p id="msg">ひらいています…</p>
</div></div>
<div id="page" hidden></div>
<script>
const SALT="${b64(salt)}",DATA="${b64(data)}";
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function open_(pw){try{
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(SALT),iterations:250000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['decrypt']);
  const d=b64(DATA);const buf=await crypto.subtle.decrypt({name:'AES-GCM',iv:d.slice(0,12)},key,d.slice(12));
  const page=document.getElementById('page');page.innerHTML=new TextDecoder().decode(buf);
  document.getElementById('gate').remove();page.hidden=false;
  for(const old of page.querySelectorAll('script')){const sc=document.createElement('script');sc.textContent=old.textContent;old.replaceWith(sc)}
  try{sessionStorage.setItem('k',pw)}catch(e){}
}catch(e){document.getElementById('msg').innerHTML='ひらけませんでした。<br>LINEでお送りしたリンクを、そのままタップしてください。'}}
(function(){const m=location.hash.match(/[#&]k=([A-Za-z0-9]+)/);
  if(m){history.replaceState(null,'',location.pathname+location.search);open_(m[1]);return}
  let k=null;try{k=sessionStorage.getItem('k')}catch(e){}
  if(k)open_(k);else document.getElementById('msg').innerHTML='LINEでお送りしたリンクを、<br>そのままタップしてください。';})();
</script>
</body>
</html>
`;
writeFileSync(new URL('index.html', import.meta.url), shell);
console.log('wrote index.html', shell.length);
