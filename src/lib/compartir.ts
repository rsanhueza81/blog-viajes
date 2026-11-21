// Imagen para la vista previa al compartir un link (WhatsApp, LinkedIn, etc.):
// JPEG de 1200x630, el formato y tamaño que mejor leen todas las apps.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export type ImagenCompartir = { src: string; width: number; height: number };

// `posicion` dice qué parte de la foto conservar al recortar (útil en fotos verticales).
export async function imagenCompartir(src: ImageMetadata, posicion = 'center'): Promise<ImagenCompartir> {
  const img = await getImage({ src, width: 1200, height: 630, fit: 'cover', position: posicion, format: 'jpeg', quality: 80 });
  return { src: img.src, width: 1200, height: 630 };
}
