import { getCollection, type CollectionEntry } from 'astro:content';
import { getDatabase } from '@netlify/database';

export type BlogPost={
 slug:string;title:string;description:string;date:Date;category:string;readTime:number;
 content:{source:'local';post:CollectionEntry<'blog'>}|{source:'cms';html:string};
 coverImage?:{url:string;alt:string};
};

type CMSRow={
 slug:string;title:string;description:string;category:string;body_html:string;
 cover_image:string|null;published_at:Date|string|null;
};

export async function getBlogPosts():Promise<BlogPost[]>{
 const local:BlogPost[]=(await getCollection('blog',({data})=>!data.draft)).map(post=>({
  slug:post.id,title:post.data.title,description:post.data.description,date:post.data.date,
  category:post.data.category,readTime:post.data.readTime,
  content:{source:'local' as const,post}
 }));
 let remote:BlogPost[]=[];
 try{
  const db=getDatabase();
  const rows=await db.sql<CMSRow>`SELECT slug,title,description,category,body_html,cover_image,published_at
   FROM geowork_articles WHERE status='published' ORDER BY published_at DESC LIMIT 500`;
  remote=rows.map(row=>{
   const words=row.body_html.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length;
   return {
    slug:row.slug,title:row.title,description:row.description,
    date:new Date(row.published_at||new Date()),category:row.category,readTime:Math.max(1,Math.ceil(words/210)),
    coverImage:row.cover_image?{url:row.cover_image,alt:row.title}:undefined,
    content:{source:'cms' as const,html:row.body_html}
   };
  });
 }catch(error){
  // The marketing website retains its three local articles until a Netlify DB
  // has been provisioned; the separate admin API surfaces setup errors.
  console.error('GeoWork articles database unavailable',error);
 }
 const owned=new Set(remote.map(post=>post.slug));
 return [...remote,...local.filter(post=>!owned.has(post.slug))]
  .sort((a,b)=>b.date.getTime()-a.date.getTime());
}
