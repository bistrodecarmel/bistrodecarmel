import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    metaTitle: z.string(),
    description: z.string(),
    kind: z.enum(['article', 'landing']),
  }),
});

export const collections = { blog };
