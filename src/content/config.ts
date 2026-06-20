import { defineCollection, z } from 'astro:content';

const aktualnosci = defineCollection({
  type: 'content',
  schema: z.object({
    tytul: z.string(),
    data: z.coerce.date(),
    opis: z.string().optional(),
    autor: z.string().default('Mysłowicki Alarm Smogowy'),
  }),
});

export const collections = { aktualnosci };
