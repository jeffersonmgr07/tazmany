# Entrega incremental Tazmany 0.3.8

Incluye únicamente los archivos nuevos o modificados respecto de la versión 0.3.7.

## Objetivo

Aplicar el último logotipo oficial de Tazmany en GitHub Pages y en la Web App de Apps Script, preservando exactamente el archivo entregado y evitando que la caché muestre el logo anterior.

## Archivos incluidos

- `assets/brand/tazmany-logo.png`: último logo oficial, sin modificaciones.
- `assets/brand/README.md`: hash de integridad actualizado.
- `src/Config.gs`: versión 0.3.8 y URL pública del logo con control de caché.
- `tools/build-preview.mjs`: versionado del logo en la vista de GitHub Pages.
- `index.html`: vista estática reconstruida.
- `package.json` y `package-lock.json`: versión 0.3.8.
- `README.md` y `CHANGELOG.md`: estado de entrega.

## Instalación

1. Descomprime el ZIP en la raíz del repositorio Tazmany.
2. Ejecuta `npm run verify`.
3. Sube los archivos a GitHub para publicar el nuevo activo y el `index.html`.
4. Ejecuta `clasp push` para actualizar `src/Config.gs`.
5. Crea una nueva versión de la implementación Web App existente.
6. Abre la URL `/exec` y realiza una recarga forzada.

No ejecutes funciones `setup`: esta actualización no modifica Google Sheets.

## Estado del proyecto

Las Fases 0, 1, 2 y 3 están desarrolladas. La versión 0.3.8 cierra el ajuste visual de la Fase 3. Antes de empezar la Fase 4 debe aprobarse `getTazmanyPrePaymentReadinessDiagnostics()` y completarse la configuración de Google Identity y del relay seguro.

La siguiente fase funcional es la Fase 4: órdenes, reserva temporal de stock, Mercado Pago en sandbox y generación idempotente de cupones.
