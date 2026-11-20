// @ts-check
import { defineConfig } from 'astro/config';

// Dónde vive el sitio publicado.
// Con GitHub Pages: https://<usuario>.github.io/<repo>/
// Con dominio propio: SITE es el dominio y BASE es '/'.
const SITE = 'https://rinconesderoberto.cl';
const BASE = '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  // El CSS es chico: va dentro de cada página para que no bloquee la primera pintura.
  build: { inlineStylesheets: 'always' },
});
