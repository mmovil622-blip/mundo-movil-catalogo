# Mundo Móvil · Catálogo V6.3

Versión premium con **Multimarca + iPhone conectados a Google Sheets**.

## Cambios de V6.3
- Corrige la lectura de precios USD de iPhone: ya no concatena los decimales (por ejemplo, `611.24` deja de verse como `61124`).
- Los valores USD se muestran redondeados y limpios: `USD 611`.
- La ficha de equipos ahora separa claramente:
  - **Promo efectivo**
  - **Transferencia**
  - **Precio de lista**
  - **Promo 6 cuotas sin interés**, calculada sobre el precio de lista.
- En iPhone, el precio de lista también muestra una referencia equivalente en USD cuando puede derivarse de la cotización usada en la planilla.
- Se mantienen las conexiones automáticas a las hojas públicas de Multimarca e iPhone y el filtro `Activo = Sí`.

## Publicación
Reemplazar en GitHub **index.html, app.js, styles.css y README.md** por los de esta versión.

**No borrar la carpeta `assets`**: ahí están logos y fotos ya cargadas.
