import type { Config } from '@netlify/functions';
import { randomUUID } from 'node:crypto';
import { isAuthenticated,sameOrigin,json,noAuth } from '../../src/server/cms-auth.mts';
import { validateArticle } from '../../src/server/cms-content.mts';
import { listArticles,articleStore,articleKey,type ArticleRecord } from '../../src/server/articles-store.ts';

const validId=(x:string)=>/^[a-f0-9-]{36}$/.test(x);
export default async function(req:Request) {
 if(!isAuthenticated(req))return noAuth();
 try{
  const store=articleStore();
  const {searchParams}=new URL(req.url);
  if(req.method==='GET'){
   const id=searchParams.get('id');
   if(id){
    if(!validId(id))return json({error:'Invalid id'},400);
    const article=await store.get(articleKey(id),{type:'json',consistency:'strong'}) as ArticleRecord|null;
    return article?json({article}):json({error:'Article not found'},404);
   }
   const articles=(await listArticles()).sort((a,b)=>b.updated_at.localeCompare(a.updated_at));
   return json({articles});
  }
  if(!['POST','PUT','DELETE'].includes(req.method))return json({error:'Method not allowed'},405);
  if(!sameOrigin(req))return json({error:'Invalid request origin'},403);
  if(req.method==='DELETE'){
   const id=searchParams.get('id')||'';
   if(!validId(id))return json({error:'Invalid id'},400);
   const existing=await store.get(articleKey(id),{type:'json',consistency:'strong'});
   if(!existing)return json({error:'Article not found'},404);
   await store.delete(articleKey(id));
   return json({deleted:true});
  }
  if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required'},415);
  let input:Record<string,unknown>;
  try{input=await req.json();}catch{return json({error:'Invalid JSON'},400);}
  let data;
  try{data=validateArticle(input);}catch(e){return json({error:(e as Error).message},400);}
  if(req.method==='POST'){
   const existing=await listArticles();
   if(existing.some(p=>p.slug===data.slug))return json({error:'This article URL is already used.'},409);
   const now=new Date().toISOString();
   const record:ArticleRecord={
     ...data,id:randomUUID(),created_at:now,updated_at:now,
     published_at:data.status==='published'?now:null
   };
   const result=await store.setJSON(articleKey(record.id),record,{onlyIfNew:true});
   if(!result.modified)return json({error:'Could not create article. Retry.'},409);
   return json({article:record},201);
  }
  const id=typeof input.id==='string'?input.id:'';
  const revision=typeof input.updated_at==='string'?input.updated_at:'';
  if(!validId(id)||!revision)return json({error:'Missing article ID or revision.'},400);
  const entry=await store.getWithMetadata(articleKey(id),{type:'json',consistency:'strong'});
  if(!entry||!entry.data)return json({error:'Article not found'},404);
  const old=entry.data as ArticleRecord;
  if(old.updated_at!==revision)return json({error:'Article was edited elsewhere. Reload before saving.'},409);
  if(old.slug!==data.slug)return json({error:'Article URL cannot be changed after creation. Create a new post instead.'},400);
  const now=new Date().toISOString();
  const record:ArticleRecord={
   ...data,id,created_at:old.created_at,updated_at:now,
   published_at:data.status==='published'?(old.published_at||now):null
  };
  const saved=await store.setJSON(articleKey(id),record,{onlyIfMatch:entry.etag});
  if(!saved.modified)return json({error:'Article changed in another session. Reload before saving.'},409);
  return json({article:record});
 }catch(err){
  console.error('GeoWork article storage error',err);
  return json({error:'Article storage unavailable. Check Netlify Blobs and site deployment.'},503);
 }
}
export const config:Config={path:'/api/cms/posts'};
