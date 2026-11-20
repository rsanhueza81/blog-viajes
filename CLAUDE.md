# Rincones: blog de viajes de Roberto

Sitio estático en Astro, publicado en GitHub Pages con GitHub Actions
(`.github/workflows/deploy.yml`). Cada push a `main` publica el sitio en
https://rinconesderoberto.cl en un par de minutos.

Todo el contenido y la interfaz están en español de Chile.

## Cómo está armado

Diseño "Galería": fondo oscuro, fotos grandes, títulos en Archivo ancho.

- Un **viaje** agrupa varios rincones (ej. el viaje "Islandia" tiene los rincones
  "Sur de Islandia" y "Triángulo Dorado"). Es un archivo en `src/content/viajes/<id-viaje>.md`.
- Un **rincón** es una entrada del blog y vive en su propia carpeta junto a sus fotos:
  `src/content/rincones/<id-viaje>/<id-rincon>/index.md`. La URL queda `/<id-viaje>/<id-rincon>/`.
- La portada muestra todos los rincones en un mosaico (el más reciente, grande) y abajo los viajes.
- Dentro de un viaje, el orden de los rincones sale de la `fecha` de cada uno.
- Nombre, bajada y autor del blog: `src/config.ts`.
- Dominio y ruta base: `astro.config.mjs` (`SITE` y `BASE`).

## Agregar un viaje nuevo

```md
---
titulo: Islandia
pais: Islandia            # opcional; se muestra en cada rincón
inicio: 2025-07-01
fin: 2025-07-15           # opcional
descripcion: Una línea sobre el viaje.   # opcional
---
```

## Agregar un rincón

1. Preparar las fotos SIEMPRE con el script, nunca subir las originales del celular:
   `node scripts/preparar-fotos.mjs src/content/rincones/<viaje>/<rincon> foto1.jpg foto2.jpg ...`
   Endereza, achica a 2400 px y borra los metadatos, incluida la ubicación GPS.
   El repo es público, así que esto no es opcional.
   Si vienen en HEIC (iPhone), sharp no las lee: convertirlas antes a JPEG con
   `pip install pillow-heif` y Pillow, y después pasarlas por el script.
2. Crear `index.md` en esa carpeta:

```md
---
nombre: Sur de Islandia           # va en letras grandes
fecha: 2025-07-03
viaje: islandia              # id del archivo en src/content/viajes
pais: Islandia                    # opcional, solo si es distinto al del viaje
resumen: Una o dos frases para buscadores y redes.
portada: ./portada.jpg
portadaAlt: Descripción breve de la foto principal
fotos:                            # se arman solas según sean horizontales o verticales
  - src: ./cascada.jpg
    pie: Pie de foto opcional
borrador: false                   # true = no se publica
---

El primer párrafo sale más grande: que diga qué es el rincón y por qué vale la pena.
Después, el texto en markdown. Se pueden usar ## subtítulos, > citas y listas.
```

3. Revisar con `npm run build` que compile sin errores.
4. Commit en español describiendo la entrada (ej. "Agrega rincón Sur de Islandia al viaje Islandia")
   y push a `main`.

## Reglas

- El texto de los rincones es de Roberto: ordenar y corregir está bien, inventar experiencias no.
  Si falta algo (fecha, lugar), preguntar.
- No agregar dependencias ni cambiar el diseño sin que lo pida.
- El viaje y los rincones de ejemplo (`ejemplo-costa-central`) se borran cuando llegue el primer
  viaje real.
