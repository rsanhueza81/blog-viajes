// @ts-check
import { defineConfig } from 'astro/config';

// Dónde vive el sitio publicado.
// Con GitHub Pages: https://<usuario>.github.io/<repo>/
// Si algún día usas dominio propio, cambia SITE por el dominio y BASE por '/'.
const SITE = 'https://rsanhueza81.github.io';
const BASE = '/blog-viajes';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
});
