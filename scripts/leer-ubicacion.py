"""Lee la ubicación GPS de fotos ORIGINALES, para ubicar los lugares de un rincón en el mapa.

Uso: python3 scripts/leer-ubicacion.py foto1.jpg foto2.heic ...

Imprime latitud y longitud con 4 decimales (unos 10 metros). La ubicación se usa solo para
poner los puntos de `lugares` en el mapa. Nunca subir las fotos originales al repo: se publican
pasadas por scripts/preparar-fotos.mjs, que les borra estos datos.
Para fotos HEIC: pip install pillow-heif --break-system-packages
"""
import sys

from PIL import Image

try:
    from pillow_heif import register_heif_opener

    register_heif_opener()
except ImportError:
    pass


def a_grados(valor, ref):
    g, m, s = (float(x) for x in valor)
    d = g + m / 60 + s / 3600
    return -d if ref in ("S", "W") else d


for ruta in sys.argv[1:]:
    try:
        gps = Image.open(ruta).getexif().get_ifd(0x8825)
        lat = a_grados(gps[2], gps[1])
        lon = a_grados(gps[4], gps[3])
        print(f"{ruta}\t[{lat:.4f}, {lon:.4f}]")
    except Exception:
        print(f"{ruta}\tsin ubicación")
