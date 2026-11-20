// Lugares de un rincón: numeración para el mapa y las fotos, y links a Google Maps.
import type { Rincon } from './datos';

export type Lugar = { n: number; nombre: string; lat: number; lon: number; google: string };

export const urlGoogleMaps = (lat: number, lon: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lon}`;

/** Lugares numerados en el orden del recorrido. Falla el build si una foto apunta a un lugar
 *  que no existe, para que el error se vea antes de publicar. */
export function lugaresDe(rincon: Rincon): { lugares: Lugar[]; numero: (nombre?: string) => number | undefined } {
  const lugares = rincon.data.lugares.map((l, i) => ({
    n: i + 1,
    nombre: l.nombre,
    lat: l.coordenadas[0],
    lon: l.coordenadas[1],
    google: urlGoogleMaps(l.coordenadas[0], l.coordenadas[1]),
  }));
  const porNombre = new Map(lugares.map((l) => [l.nombre, l.n]));
  const revisar = (nombre: string | undefined, donde: string) => {
    if (nombre && !porNombre.has(nombre)) {
      throw new Error(
        `En el rincón "${rincon.data.nombre}", ${donde} dice lugar "${nombre}", pero ese nombre no está en "lugares".`
      );
    }
  };
  revisar(rincon.data.portadaLugar, 'la portada');
  rincon.data.fotos.forEach((f, i) => revisar(f.lugar, `la foto ${i + 1}`));
  return { lugares, numero: (nombre) => (nombre ? porNombre.get(nombre) : undefined) };
}
