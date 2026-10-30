import { getCollection, type CollectionEntry } from 'astro:content';
import { listArticles } from '../server/articles-store';
export type BlogPost={
 slug:string;title:string;description:string;date:Date;category:string;readTime:number;
 content:{source:'local';post:CollectionEntry<'blog'>}|{source:'cms';html:string};
 coverImage?:{url:string;alt:string};
};
export async function getBlogPosts():Promise<BlogPost[]>{
 const local:BlogPost[]=(await getCollection('blog',({data})=>!data.draft)).map(post=>({
  slug:post.id,title:post.data.title,description:post.data.description,
  date:post.data.date,category:post.data.category,readTime:post.data.readTime,
  content:{source:'local' as const,post}
 }));
 let remote:BlogPost[]=[];
 try{
  const rows=await listArticles();
  remote=rows.filter(row=>row.status==='published').map(row=>{
   const words=row.body_html.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length;
   return {
    slug:row.slug,title:row.title,description:row.description,
    date:new Date(row.published_at||row.created_at),category:row.category,
    readTime:Math.max(1,Math.ceil(words/210)),
    coverImage:row.cover_image?{url:row.cover_image,alt:row.title}:undefined,
    content:{source:'cms' as const,html:row.body_html}
   };
  });
 }catch(error){
  console.error('GeoWork content store unavailable; serving local sample articles only.',error);
 }
 const owned=new Set(remote.map(post=>post.slug));
 return [...remote,...local.filter(post=>!owned.has(post.slug))]
  .sort((a,b)=>b.date.getTime()-a.date.getTime());
}
