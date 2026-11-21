# Rincones: blog de viajes de Roberto

Sitio estático en Astro, publicado en GitHub Pages con GitHub Actions
(`.github/workflows/deploy.yml`). Cada push a `main` publica el sitio en
https://rinconesderoberto.cl en un par de minutos.

Todo el contenido y la interfaz están en español de Chile.

## Cómo está armado

Diseño "Galería": fotos grandes, títulos en Archivo ancho y texto de lectura en Newsreader.
Dos temas de color (variables en `src/styles/global.css`, prop `tema` de `Base.astro`):
**Pizarra** (azul grisáceo oscuro, acento ámbar) en la portada y Sobre mí; **Arena** (beige
tostado, texto oscuro, acento rojizo) en las páginas de rincones y de viajes. El mosaico se adapta
a la cantidad de rincones para no dejar huecos (`src/components/Mosaico.astro`). En la portada,
bajo el título, van los años del primer al último viaje.

- Un **viaje** agrupa varios rincones (ej. el viaje "Islandia" tiene los rincones
  "Sur de Islandia" y "Triángulo Dorado"). Es un archivo en `src/content/viajes/<id-viaje>.md`.
- Un **rincón** es una entrada del blog y vive en su propia carpeta junto a sus fotos:
  `src/content/rincones/<id-viaje>/<id-rincon>/index.md`. La URL queda `/<id-viaje>/<id-rincon>/`.
- La portada muestra todos los rincones en un mosaico (el más reciente, grande) y abajo los viajes.
  En "Por viaje", cada viaje muestra las portadas de sus 4 rincones más recientes (el más nuevo
  primero). Si tiene menos de 4, quedan huecos: Roberto no quiere rellenarlos con otras fotos.
- Dentro de un viaje, el orden de los rincones sale de la `fecha` de cada uno.
- En cada rincón, la portada va arriba (dentro de los márgenes, no de borde a borde) y las `fotos`
  se reparten solas a lo largo del texto (`src/lib/relato.ts`): dos verticales seguidas van de a
  par, una vertical sola va al lado del texto, y las horizontales rotan entre ancha (más que el
  texto, sin llegar a los bordes), al lado del texto y del ancho de la columna. El orden de la
  lista `fotos` es el orden en que aparecen.
- Cada rincón puede tener `lugares`: los puntos específicos del recorrido (ej. Seljalandsfoss,
  Vík). Con ellos se arma la sección "El recorrido": un mapa con puntos numerados en ese orden,
  unidos por la ruta, al final del rincón, y una lista al lado con link "Ver en Google Maps" por lugar
  (`src/components/Mapa.astro`). El mapa es de OpenStreetMap, gratis y sin cuentas, teñido con CSS
  según el tema; se carga recién cuando el lector llega a él. Las fotos (y la portada, con `portadaLugar`)
  pueden decir en qué `lugar` se sacaron: el pie muestra el número y el nombre, y al tocar el punto
  en el mapa aparece esa foto. Si un rincón no tiene `lugares`, no hay mapa.
- Vista previa al compartir links (WhatsApp, etc.): cada página lleva una imagen JPEG de 1200x630
  generada con `src/lib/compartir.ts` (en un rincón, su portada). Estadísticas de visitas: Cloudflare
  Web Analytics, con el token en `src/config.ts`.
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
portadaLugar: Seljalandsfoss      # opcional, uno de los nombres de `lugares`
lugares:                          # opcional; en el orden del recorrido, arman el mapa
  - nombre: Seljalandsfoss
    coordenadas: [63.6156, -19.9886]   # [latitud, longitud]
  - nombre: Skógafoss
    coordenadas: [63.5321, -19.5114]
fotos:                            # se intercalan solas en el texto (ver arriba)
  - src: ./02-skogafoss.jpg
    lugar: Skógafoss              # opcional, uno de los nombres de `lugares`
    pie: Pie de foto opcional
borrador: false                   # true = no se publica
---

El primer párrafo sale más grande: que diga qué es el rincón y por qué vale la pena.
Después, el texto en markdown. Se pueden usar ## subtítulos, > citas y listas.
```

3. Revisar con `npm run build` que compile sin errores. Si una foto dice un `lugar` que no está en
   `lugares`, el build falla y dice cuál.
4. Mostrarle a Roberto la maqueta (ver "Cómo trabaja Roberto un rincón") y esperar su ok.
5. Commit en español describiendo la entrada (ej. "Agrega rincón Sur de Islandia al viaje Islandia")
   y push a `main`.

## Cómo trabaja Roberto un rincón (acordado)

Sus viajes ya los hizo: trae fotos y recuerdos, no escribe en vivo.

1. Entrega las fotos de cada rincón numeradas y con el lugar en el nombre del archivo, con dos
   dígitos para que se ordenen bien: `01 Seljalandsfoss.jpg`, `02 Skógafoss.jpg`. Idealmente desde
   una carpeta del computador (calidad completa y con ubicación GPS).
2. Con eso se arman los `lugares` y el mapa. Coordenadas: primero las de la foto original
   (`python3 scripts/leer-ubicacion.py fotos...`), si no las tiene, las del lugar conocido. Solo
   lugares públicos (atracciones, pueblos, miradores), nunca alojamientos ni casas. Se le muestra
   el mapa para que confirme que cada punto está bien antes de seguir.
3. Se le hacen dos o tres preguntas cortas por foto (qué hacía ahí, qué recuerda, algún dato útil).
4. Al final, después de las preguntas por foto, se le pregunta por cuatro secciones optativas.
   Cada una se incluye solo si tiene contenido; si responde "no" o "nada", esa sección no va
   (nunca se rellena ni se inventa):
   - **Una anécdota**: ¿pasó algo divertido o alguna anécdota?
   - **Para comer y tomar**: ¿algún plato o licor típico que valga la pena comentar? ¿Tiene foto?
     (si la hay, se agrega a `fotos`).
   - **Lo que quedó pendiente**: ¿algo que faltó hacer?
   - **¿Volvería?**: una reflexión corta de si volvería a este lugar y por qué.
   Van al final del texto del rincón, en ese orden, cada una como subtítulo `##`.
5. Con sus respuestas se arma un texto preliminar con sus palabras; él lo corrige y complementa.
6. Revisión final con maqueta, SIEMPRE antes de publicar: se le manda la vista previa del rincón
   completo en formato celular (390 px de ancho, página entera, con las fotos cargadas), más la de
   computador y la portada. Se publica solo cuando él da el ok explícito ("publica"). Si pide
   cambios, se corrige y se le muestra la maqueta de nuevo. Nunca publicar directo.

## Reglas

- El texto de los rincones es de Roberto: ordenar y corregir está bien, inventar experiencias no.
  Si falta algo (fecha, lugar), preguntar.
- No agregar dependencias ni cambiar el diseño sin que lo pida.
- El viaje y los rincones de ejemplo (`ejemplo-costa-central`) se borran cuando llegue el primer
  viaje real.
