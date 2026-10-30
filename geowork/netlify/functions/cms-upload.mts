import type {Config} from '@netlify/functions';
import {getStore} from '@netlify/blobs';
import {randomUUID} from 'node:crypto';
import {isAuthenticated,sameOrigin,json,noAuth} from '../../src/server/cms-auth.mts';

const types:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'};
export default async function(req:Request) {
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(!isAuthenticated(req))return noAuth();
 if(!sameOrigin(req))return json({error:'Invalid origin'},403);
 const size=Number(req.headers.get('content-length')||'0');
 if(size>4_500_000)return json({error:'Maximum image size is 4 MB.'},413);
 try {
  const form=await req.formData();
  const file=form.get('file');
  if(!(file instanceof File)||!(file.type in types)||file.size>4_000_000||file.size<1) return json({error:'Upload JPG, PNG, WEBP or GIF under 4 MB.'},400);
  const id=randomUUID();
  const bytes=await file.arrayBuffer();
  const signature=new Uint8Array(bytes.slice(0,16));
  const type=file.type;
  const starts=(...nums:number[])=>nums.every((n,i)=>signature[i]===n);
  const valid=(type==='image/jpeg'&&starts(0xff,0xd8,0xff))||
    (type==='image/png'&&starts(137,80,78,71,13,10,26,10))||
    (type==='image/gif'&&starts(71,73,70,56))||
    (type==='image/webp'&&String.fromCharCode(...signature.slice(0,4))==='RIFF'&&String.fromCharCode(...signature.slice(8,12))==='WEBP');
  if(!valid)return json({error:'Image contents do not match image type.'},400);
  const store=getStore({name:'geowork-media',consistency:'strong'});
  await store.set(id,new Blob([bytes],{type}),{metadata:{type,createdAt:Date.now()}});
  return json({url:'/media/'+id},201);
 }catch(err){console.error('GeoWork media upload',err);return json({error:'File storage unavailable.'},503);}
}
export const config:Config={path:'/api/cms/upload'};
