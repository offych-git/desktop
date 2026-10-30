import type { Config } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { isAuthenticated,sameOrigin,json,noAuth } from '../../src/server/cms-auth.mts';
import { validateArticle } from '../../src/server/cms-content.mts';

type ArticleRecord={id:string;slug:string;title:string;description:string;category:string;body_html:string;cover_image:string|null;status:'draft'|'published';published_at:string|null;created_at:string;updated_at:string};
export default async function(req:Request) {
 if(!isAuthenticated(req))return noAuth();
 try {
  const db=getDatabase();
  const {searchParams}=new URL(req.url);
  if(req.method==='GET'){
   const id=searchParams.get('id');
   if(id){
    if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:'Invalid id'},400);
    const results=await db.sql<ArticleRecord>`SELECT * FROM geowork_articles WHERE id=${id} LIMIT 1`;
    return results[0]?json({article:results[0]}):json({error:'Article not found'},404);
   }
   const articles=await db.sql<ArticleRecord>`SELECT * FROM geowork_articles ORDER BY updated_at DESC LIMIT 500`;
   return json({articles});
  }
  if(!['POST','PUT','DELETE'].includes(req.method))return json({error:'Method not allowed'},405);
  if(!sameOrigin(req))return json({error:'Invalid request origin'},403);
  if(req.method==='DELETE'){
   const id=searchParams.get('id')||'';
   if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:'Invalid id'},400);
   const removed=await db.sql<ArticleRecord>`DELETE FROM geowork_articles WHERE id=${id} RETURNING id`;
   return json({deleted:removed.length===1},removed.length?200:404);
  }
  if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required'},415);
  const input=await req.json();
  let data;
  try {data=validateArticle(input);}catch(e){return json({error:(e as Error).message},400);}
  if(req.method==='POST'){
   const rows=await db.sql<ArticleRecord>`INSERT INTO geowork_articles
    (slug,title,description,category,body_html,cover_image,status,published_at)
    VALUES (${data.slug},${data.title},${data.description},${data.category},${data.body_html},${data.cover_image},${data.status},
      CASE WHEN ${data.status}='published' THEN now() ELSE NULL END)
    RETURNING *`;
   return json({article:rows[0]},201);
  }
  const id=typeof input?.id==='string'?input.id:'';
  const previousUpdate=typeof input?.updated_at==='string'?input.updated_at:'';
  if(!/^[0-9a-f-]{36}$/i.test(id)||!previousUpdate)return json({error:'Missing id or revision; reload article.'},400);
  const rows=await db.sql<ArticleRecord>`UPDATE geowork_articles SET
    slug=${data.slug},title=${data.title},description=${data.description},category=${data.category},
    body_html=${data.body_html},cover_image=${data.cover_image}, status=${data.status},
    published_at=CASE WHEN ${data.status}='published' AND published_at IS NULL THEN now()
      WHEN ${data.status}='draft' THEN NULL ELSE published_at END,
    updated_at=now()
    WHERE id=${id} AND updated_at=${previousUpdate}::timestamptz
    RETURNING *`;
  if(!rows.length)return json({error:'Article was changed in another tab; reload before saving.'},409);
  return json({article:rows[0]});
 }catch(e) {
  const err=e as {code?:string;message?:string};
  if(err?.code==='23505')return json({error:'An article with this URL slug already exists.'},409);
  console.error('GeoWork CMS article operation failed',err?.code,err?.message);
  return json({error:'CMS database is unavailable or not initialized. Check the Netlify database and deployment.'},503);
 }
}
export const config:Config={path:'/api/cms/posts'};
