# Entrega incremental Tazmany 0.3.0

Este paquete contiene únicamente archivos nuevos o modificados respecto de la entrega `0.2.1`. Extrae su contenido sobre la raíz del repositorio `tazmany` y permite reemplazar los archivos con el mismo nombre.

## Qué cambia

- Logo oficial transparente y más grande.
- Iconos SVG propios para las categorías; no se usan emojis de categoría.
- Onboarding y revisión de comercios.
- Contrato marco preliminar versionado en Drive.
- Creación, versionado, envío y moderación de campañas.
- Panel de moderación de Tazmany.
- `index.html` estático actualizado para GitHub Pages.

## Aplicar en macOS

Desde la carpeta donde descargaste el ZIP:

```bash
unzip -o Tazmany_GitHub_Fase3_v0.3.0_INCREMENTAL.zip -d ~/Downloads/tazmany
cd ~/Downloads/tazmany
npm install
npm run verify
clasp status
clasp push
clasp open-script
```

El archivo local `~/Downloads/tazmany/.clasp.json` no se reemplaza ni se sube a GitHub.

## Inicializar Apps Script

En el editor de Apps Script ejecuta, en orden:

1. `setupTazmany()`
2. `setupTazmanyPhase2()`
3. `installTazmanyAuthTriggers()`
4. `setupTazmanyPhase3()`
5. `getTazmanyPhase2Diagnostics()`
6. `getTazmanyPhase3Diagnostics()`

Todas son seguras para repetirse. Autoriza Sheets, Drive, Documentos, correo y triggers cuando Google lo solicite.

## Publicación

- GitHub Pages: sube los archivos y confirma **Settings → Pages → Deploy from a branch → main → /(root)**.
- Apps Script: crea o actualiza una implementación de tipo **Aplicación web** y abre la URL `/exec`.

GitHub Pages es una demostración visual. Formularios, autenticación y Sheets funcionan en la Web App de Apps Script.

## Fases

Completadas: 0, 1, 2 y 3. Restan 6: Fases 4 a 9. Mercado Pago comienza en la Fase 4 y no está habilitado en esta entrega.
