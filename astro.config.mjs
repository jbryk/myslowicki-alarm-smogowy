import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build
export default defineConfig({
  site: 'https://myslowicki-alarm-smogowy.pl',
  output: 'hybrid',
  adapter: vercel(),
});
