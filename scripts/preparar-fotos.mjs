// Prepara fotos para el blog: endereza según la orientación de la cámara,
// achica a máximo 2400 px, guarda como JPEG y BORRA los metadatos
// (incluida la ubicación GPS que traen las fotos del celular).
//
// Uso: node scripts/preparar-fotos.mjs <carpeta-destino> <foto1> [foto2 ...]
// Ej.:  node scripts/preparar-fotos.mjs src/content/rincones/islandia/sur-de-islandia ~/fotos/IMG_1234.HEIC
//
// El nombre de salida se toma del archivo original (en minúsculas, sin espacios).
// Para elegir el nombre: ruta/original.jpg=nombre-nuevo

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const [destino, ...fotos] = process.argv.slice(2);
if (!destino || fotos.length === 0) {
  console.error('Uso: node scripts/preparar-fotos.mjs <carpeta-destino> <foto1> [foto2 ...]');
  process.exit(1);
}

await mkdir(destino, { recursive: true });

const limpiar = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

for (const arg of fotos) {
  const [origen, nombre] = arg.split('=');
  const base = nombre ? limpiar(nombre) : limpiar(path.parse(origen).name);
  const salida = path.join(destino, `${base}.jpg`);
  const info = await sharp(origen)
    .rotate() // aplica la orientación EXIF y luego la descarta
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(salida); // sharp no copia metadatos salvo que se pida
  console.log(`${salida}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
}
