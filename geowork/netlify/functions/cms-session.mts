import type { Config } from '@netlify/functions';
import { verifyLogin,issueCookie,clearCookie,isAuthenticated,sameOrigin,json } from '../../src/server/cms-auth.mts';

export default async function(req:Request) {
  if (req.method==='GET')return json({authenticated:isAuthenticated(req)});
  if (req.method==='DELETE') {
    if(!sameOrigin(req))return json({error:'Invalid request origin'},403);
    return json({ok:true},200,{'set-cookie':clearCookie()});
  }
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  if(!sameOrigin(req))return json({error:'Invalid request origin'},403);
  if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required'},415);
  let values:{email?:string;password?:string};
  try { values=await req.json(); }catch{return json({error:'Invalid JSON'},400);}
  if(typeof values.email!=='string'||typeof values.password!=='string')return json({error:'Email and password required'},400);
  if(!verifyLogin(values.email,values.password))return json({error:'Wrong email or password, or CMS not configured'},401);
  return json({ok:true},200,{'set-cookie':issueCookie()});
}

export const config: Config={
  path:'/api/cms/session',
  rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:12}
};
