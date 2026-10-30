import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const COOKIE='gw_admin_session';
const env=(key:string)=>(typeof Netlify!=='undefined' ? Netlify.env.get(key):undefined)||process.env[key]||'';

function signature(text:string) {
  const secret=env('CMS_SESSION_SECRET');
  if (secret.length < 32) throw new Error('CMS_SESSION_SECRET must be at least 32 characters');
  return createHmac('sha256',secret).update(text).digest('hex');
}
function safeEqual(a:string,b:string) {
  const x=Buffer.from(a), y=Buffer.from(b);
  return x.length===y.length && timingSafeEqual(x,y);
}
function isConfigured() {
  return Boolean(env('CMS_ADMIN_EMAIL')&&env('CMS_ADMIN_PASSWORD_HASH')&&env('CMS_SESSION_SECRET').length>=32);
}
export function verifyLogin(email:string,password:string) {
  if (!isConfigured()||!safeEqual(email.trim().toLowerCase(),env('CMS_ADMIN_EMAIL').trim().toLowerCase())) return false;
  const [algo,salt,hash]=env('CMS_ADMIN_PASSWORD_HASH').split(':');
  if (algo!=='scrypt'||!salt||!/^[0-9a-f]{128}$/i.test(hash||'')||password.length>512) return false;
  const actual=scryptSync(password,salt,64).toString('hex');
  return safeEqual(actual,hash);
}
export function issueCookie() {
  const expiry=Date.now()+12*60*60*1000;
  const token='v1.'+expiry+'.'+randomBytes(12).toString('hex');
  return cookie(token+'.'+signature(token),12*60*60);
}
function cookie(value:string,seconds:number) {
  return COOKIE+'='+encodeURIComponent(value)+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+seconds;
}
export function clearCookie() { return cookie('',0); }
export function isAuthenticated(req:Request) {
  if (!isConfigured()) return false;
  const pair=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));
  if(!pair) return false;
  try {
    const value=decodeURIComponent(pair.slice(COOKIE.length+1));
    const sections=value.split('.');
    if(sections.length!==4 || sections[0]!=='v1')return false;
    const expiry=Number(sections[1]);
    if(!Number.isFinite(expiry)||expiry<Date.now()||expiry>Date.now()+12*60*60*1000)return false;
    return safeEqual(signature(sections.slice(0,3).join('.')),sections[3]);
  } catch {return false;}
}
export function sameOrigin(req:Request) {
  const origin=req.headers.get('origin');
  if(!origin) return false;
  try { return new URL(origin).origin===new URL(req.url).origin; }catch{return false;}
}
export function json(data:unknown,status=200,headers?:HeadersInit) {
  return Response.json(data,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff',...headers}});
}
export function noAuth() {return json({error:'Sign in to the GeoWork editor.'},401);}
