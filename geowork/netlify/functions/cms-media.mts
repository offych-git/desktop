import type {Config,Context} from '@netlify/functions';
import {getStore} from '@netlify/blobs';

export default async function(req:Request,ctx:Context) {
 if(req.method!=='GET'&&req.method!=='HEAD')return new Response('Method not allowed',{status:405});
 const id=ctx.params.id;
 if(!id||!/^[0-9a-f-]{36}$/.test(id))return new Response('Not found',{status:404});
 const store=getStore({name:'geowork-media',consistency:'strong'});
 try{
  const item=await store.getWithMetadata(id,{type:'arrayBuffer'});
  if(!item||!item.data)return new Response('Not found',{status:404});
  const type=String(item.metadata?.type||'application/octet-stream');
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(type))return new Response('Not found',{status:404});
  return new Response(req.method==='HEAD'?null:item.data,{status:200,headers:{'content-type':type,'cache-control':'public,max-age=3600','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; sandbox"}});
 }catch{return new Response('Unavailable',{status:503});}
}
export const config:Config={path:'/media/:id'};
