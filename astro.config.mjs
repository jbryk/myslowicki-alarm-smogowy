import { defineConfig } from 'astro/config';

// https://astro.build
export default defineConfig({
  site: 'https://myslowicki-alarm-smogowy.pl',
  output: 'static',
  build: { format: 'directory' },
});
