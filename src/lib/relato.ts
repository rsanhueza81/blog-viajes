// Arma el relato de un rincón: reparte las fotos entre los párrafos del texto,
// con tamaños distintos, para que no queden todas a lo ancho al final.
import type { ImageMetadata } from 'astro';

export type Foto = { src: ImageMetadata; pie?: string; lugar?: string; lugarN?: number };
export type TipoGrupo = 'ancha' | 'lado' | 'columna' | 'par';
export type Grupo = { tipo: TipoGrupo; fotos: { foto: Foto; n: number }[] };
export type Tramo = { html: string; grupo?: Grupo };

/** Separa el HTML del texto en bloques de primer nivel (párrafos, subtítulos, listas, citas). */
export function dividirBloques(html: string): string[] {
  const bloques: string[] = [];
  let i = 0;
  while (i < html.length) {
    while (i < html.length && /\s/.test(html[i])) i++;
    if (i >= html.length) break;
    if (html[i] !== '<') {
      const j = html.indexOf('<', i);
      const fin = j === -1 ? html.length : j;
      bloques.push(html.slice(i, fin));
      i = fin;
      continue;
    }
    const m = /^<([a-zA-Z0-9]+)/.exec(html.slice(i));
    if (!m) {
      bloques.push(html.slice(i));
      break;
    }
    const tag = m[1].toLowerCase();
    if (['hr', 'img', 'br'].includes(tag)) {
      const fin = html.indexOf('>', i) + 1;
      bloques.push(html.slice(i, fin));
      i = fin;
      continue;
    }
    const re = new RegExp(`<(/?)${tag}(?=[\\s>/])[^>]*>`, 'gi');
    re.lastIndex = i;
    let profundidad = 0;
    let fin = -1;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(html))) {
      profundidad += mm[1] === '/' ? -1 : 1;
      if (profundidad === 0) {
        fin = re.lastIndex;
        break;
      }
    }
    if (fin === -1) {
      bloques.push(html.slice(i));
      break;
    }
    bloques.push(html.slice(i, fin));
    i = fin;
  }
  return bloques;
}

const esVertical = (f: Foto) => f.src.height > f.src.width;
const esTitulo = (b: string) => /^<h[1-6][\s>]/i.test(b);

/** Agrupa las fotos: dos verticales seguidas van de a par; una vertical sola va al lado del texto;
 *  las horizontales rotan entre ancha, al lado del texto y del ancho de la columna. */
export function agruparFotos(fotos: Foto[]): Grupo[] {
  const grupos: Grupo[] = [];
  const ciclo: TipoGrupo[] = ['ancha', 'lado', 'columna'];
  let h = 0;
  for (let i = 0; i < fotos.length; ) {
    const f = fotos[i];
    const sig = fotos[i + 1];
    if (esVertical(f) && sig && esVertical(sig)) {
      grupos.push({ tipo: 'par', fotos: [{ foto: f, n: i }, { foto: sig, n: i + 1 }] });
      i += 2;
    } else if (esVertical(f)) {
      grupos.push({ tipo: 'lado', fotos: [{ foto: f, n: i }] });
      i += 1;
    } else {
      grupos.push({ tipo: ciclo[h++ % ciclo.length], fotos: [{ foto: f, n: i }] });
      i += 1;
    }
  }
  return grupos;
}

/** Reparte los grupos de fotos de forma pareja a lo largo del texto. */
export function armarTramos(html: string, fotos: Foto[]): Tramo[] {
  const bloques = dividirBloques(html);
  const grupos = agruparFotos(fotos);
  if (grupos.length === 0) return [{ html: bloques.join('\n') }];

  const B = bloques.length;
  const G = grupos.length;
  // Dónde corta cada tramo (índice del primer bloque del tramo siguiente).
  const cortes: number[] = [];
  let anterior = 0;
  for (let g = 0; g < G; g++) {
    let corte = Math.round(((g + 1) * B) / (G + 1));
    // Un subtítulo no puede quedar solo al final de un tramo.
    while (corte > anterior + 1 && esTitulo(bloques[corte - 1])) corte--;
    corte = Math.max(corte, Math.min(anterior + 1, B));
    cortes.push(corte);
    anterior = corte;
  }

  const tramos: Tramo[] = [];
  let desde = 0;
  grupos.forEach((grupo, g) => {
    const hasta = cortes[g];
    tramos.push({ html: bloques.slice(desde, hasta).join('\n'), grupo });
    desde = Math.max(desde, hasta);
  });
  if (desde < B) tramos.push({ html: bloques.slice(desde).join('\n') });
  return tramos;
}
