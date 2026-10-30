import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    date: z.coerce.date(),
    category: z.string(),
    readTime: z.number().int().positive(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
