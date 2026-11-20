import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Un viaje agrupa varios rincones. Ej.: el viaje "Islandia" tiene los rincones
// "Sur de Islandia" y "Triángulo Dorado".
const viajes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/viajes' }),
  schema: z.object({
    titulo: z.string(),
    pais: z.string().optional(),
    inicio: z.coerce.date(),
    fin: z.coerce.date().optional(),
    descripcion: z.string().optional(),
  }),
});

// Cada rincón vive en su propia carpeta: rincones/<viaje>/<rincon>/index.md
// con sus fotos al lado.
const rincones = defineCollection({
  loader: glob({ pattern: '*/*/index.md', base: './src/content/rincones' }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      fecha: z.coerce.date(),
      viaje: reference('viajes'),
      // Si el rincón está en otro país que el resto del viaje.
      pais: z.string().optional(),
      resumen: z.string(),
      portada: image(),
      portadaAlt: z.string().default(''),
      fotos: z
        .array(z.object({ src: image(), pie: z.string().optional() }))
        .default([]),
      borrador: z.boolean().default(false),
    }),
});

export const collections = { viajes, rincones };
