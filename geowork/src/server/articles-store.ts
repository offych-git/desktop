import { getStore } from '@netlify/blobs';

export type ArticleRecord={
 id:string;slug:string;title:string;description:string;category:string;
 body_html:string;cover_image:string|null;status:'draft'|'published';
 published_at:string|null;created_at:string;updated_at:string;
};

export const articleStore=()=>getStore({name:'geowork-articles',consistency:'strong'});
const key=(id:string)=>'posts/'+id;
export const articleKey=key;

export async function listArticles():Promise<ArticleRecord[]> {
 const store=articleStore();
 const result=await store.list({prefix:'posts/'});
 if(result.blobs.length>500)throw new Error('CMS has reached its 500-article starter limit; migrate content to PostgreSQL.');
 const posts:ArticleRecord[]=[];
 // Small editorial object store, deliberately not used for transactions or counters.
 for(let start=0;start<result.blobs.length;start+=20) {
  const batch=result.blobs.slice(start,start+20);
  const records=await Promise.all(batch.map(item=>store.get(item.key,{type:'json',consistency:'strong'})));
  for(const record of records) if(record && typeof record==='object') posts.push(record as ArticleRecord);
 }
 return posts;
}
