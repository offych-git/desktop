import { getCollection, type CollectionEntry } from 'astro:content';
import { createClient } from '@sanity/client';
import type { PortableTextBlock } from '@portabletext/types';

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: Date;
  category: string;
  readTime: number;
  content: { source: 'local'; post: CollectionEntry<'blog'> } | { source: 'sanity'; blocks: PortableTextBlock[] };
  coverImage?: { url: string; alt: string };
};

type SanityPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: number;
  body?: PortableTextBlock[];
  coverImage?: { url: string; alt: string };
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  const local = (await getCollection('blog', ({ data }) => !data.draft)).map((post) => ({
    slug: post.id,
    title: post.data.title,
    description: post.data.description,
    date: post.data.date,
    category: post.data.category,
    readTime: post.data.readTime,
    content: { source: 'local' as const, post },
  }));
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) return local.sort((a,b) => b.date.valueOf()-a.date.valueOf());
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
  const client = createClient({ projectId, dataset, apiVersion:'2026-10-01', useCdn:false, perspective:'published' });
  const remote = await client.fetch<SanityPost[]>(`*[_type == "post" && defined(slug.current) && draft != true && !(_id in path("drafts.**"))] | order(date desc) {
    "slug": slug.current, title, description, date, category, readTime, body,
    "coverImage": select(defined(coverImage.asset) => { "url": coverImage.asset->url, "alt": coverImage.alt })
  }`);
  const mapped: BlogPost[] = remote.filter(p=>p.slug&&p.date).map(p=>({
    slug:p.slug, title:p.title, description:p.description, date:new Date(p.date),
    category:p.category??'AI Search', readTime:p.readTime??5, content:{source:'sanity' as const,blocks:p.body??[]},
    coverImage:p.coverImage?.url&&p.coverImage.alt ? p.coverImage : undefined
  }));
  const sanSlug=new Set(mapped.map(p=>p.slug));
  return [...mapped,...local.filter(p=>!sanSlug.has(p.slug))].sort((a,b)=>b.date.valueOf()-a.date.valueOf());
}
