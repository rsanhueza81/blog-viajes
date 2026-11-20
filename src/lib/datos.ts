import { getCollection, type CollectionEntry } from 'astro:content';

export type Rincon = CollectionEntry<'rincones'>;
export type Viaje = CollectionEntry<'viajes'>;
export type RinconConViaje = { rincon: Rincon; viaje: Viaje };

/** URL interna respetando la base del sitio (GitHub Pages vive en /<repo>/). */
export function url(ruta = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const limpia = ruta.replace(/^\/+/, '').replace(/\/?$/, '/');
  return limpia === '/' ? `${base}/` : `${base}/${limpia}`;
}

/** Slug del rincón: rincones/<viaje>/<rincon>/index.md -> <rincon> */
export function slugRincon(r: Rincon): string {
  const partes = r.id.split('/').filter((p) => p !== 'index');
  return partes[partes.length - 1];
}

export const urlRincon = (r: Rincon) => url(`${r.data.viaje.id}/${slugRincon(r)}`);
export const urlViaje = (v: Viaje | string) => url(`viajes/${typeof v === 'string' ? v : v.id}`);

const fmt = (o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-CL', { ...o, timeZone: 'UTC' });
const fmtLarga = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
const fmtMes = fmt({ month: 'long', year: 'numeric' });

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const fecha = (d: Date) => fmtLarga.format(d);
export const mesAno = (d: Date) => fmtMes.format(d);

export function rangoViaje(v: Viaje): string {
  const { inicio, fin } = v.data;
  if (!fin) return mayuscula(mesAno(inicio));
  const mismoMes =
    inicio.getUTCFullYear() === fin.getUTCFullYear() && inicio.getUTCMonth() === fin.getUTCMonth();
  return mayuscula(mismoMes ? mesAno(inicio) : `${mesAno(inicio)} a ${mesAno(fin)}`);
}

/** "Islandia, julio de 2026": país del rincón (o del viaje) y mes. */
export function lugarYMes({ rincon, viaje }: RinconConViaje): string {
  const pais = rincon.data.pais ?? viaje.data.pais;
  const mes = mesAno(rincon.data.fecha);
  return pais ? `${pais}, ${mes}` : mayuscula(mes);
}

/** Rincones publicados con su viaje, del más nuevo al más antiguo. */
export async function rinconesPublicados(): Promise<RinconConViaje[]> {
  const [todos, viajes] = await Promise.all([
    getCollection('rincones', (r) => import.meta.env.DEV || !r.data.borrador),
    getCollection('viajes'),
  ]);
  const porId = new Map(viajes.map((v) => [v.id, v]));
  return todos
    .map((rincon) => ({ rincon, viaje: porId.get(rincon.data.viaje.id)! }))
    .sort((a, b) => b.rincon.data.fecha.valueOf() - a.rincon.data.fecha.valueOf());
}

/** Viajes con sus rincones en orden cronológico; el viaje más reciente primero. */
export async function viajesConRincones(): Promise<{ viaje: Viaje; rincones: RinconConViaje[] }[]> {
  const [viajes, todos] = await Promise.all([getCollection('viajes'), rinconesPublicados()]);
  return viajes
    .map((viaje) => ({
      viaje,
      rincones: todos
        .filter((r) => r.viaje.id === viaje.id)
        .sort((a, b) => a.rincon.data.fecha.valueOf() - b.rincon.data.fecha.valueOf()),
    }))
    .filter((v) => v.rincones.length > 0)
    .sort((a, b) => b.viaje.data.inicio.valueOf() - a.viaje.data.inicio.valueOf());
}

export const cuantos = (n: number) => (n === 1 ? '1 rincón' : `${n} rincones`);
