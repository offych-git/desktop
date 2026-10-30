import type { APIRoute } from 'astro';
import { getBlogPosts } from '../lib/blog';
export const prerender=false;
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const GET:APIRoute=async()=>{
 const posts=await getBlogPosts();
 const urls=posts.map(post=>'<url><loc>'+esc('https://geowork.us/blog/'+post.slug)+'</loc><lastmod>'+post.date.toISOString().slice(0,10)+'</lastmod></url>').join('');
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls+'</urlset>',{
  headers:{'content-type':'application/xml; charset=utf-8','cache-control':'public,max-age=300'}
 });
};
