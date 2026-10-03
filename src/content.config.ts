import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const post = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/post',
    generateId: ({ entry }) => entry,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),

    canonical: z.url().optional(),

    publishDate: z.date().or(z.string()).optional(),
    draft: z.boolean().optional(),

    excerpt: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
  }),
});

export const collections = {
  post: post,
};
