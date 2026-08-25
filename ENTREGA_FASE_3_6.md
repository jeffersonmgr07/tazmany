# Entrega incremental Tazmany 0.3.6

Este paquete contiene únicamente archivos nuevos o modificados respecto de 0.3.5.

## Aplicación

1. Descomprime el ZIP dentro de la raíz de tu repositorio `tazmany`.
2. En Terminal entra a esa carpeta.
3. Ejecuta `node tools/validate-project.mjs`.
4. Ejecuta `node --test tests/unit/*.test.mjs`.
5. Ejecuta `node tools/build-preview.mjs` para regenerar el `index.html` de GitHub Pages.
6. Publica GitHub con `git add`, `git commit` y `git push`.
7. Sube Apps Script con `clasp push`.
8. En el editor de Apps Script ejecuta `setupTazmanyPhase36()`.
9. Ejecuta `getTazmanyPhase36Diagnostics()`; debe devolver `ok: true` y `paymentsEnabled: false`.
10. Crea una versión y actualiza la implementación Web App.

## Qué es real

- Selección anónima de ciudad en el navegador.
- Registro de suscriptores en Sheets cuando el relay o `google.script.run` está conectado.
- Consentimiento, idempotencia, deduplicación por hash y auditoría.
- Doble precio persistente en campañas.

## Qué sigue simulado o bloqueado

- GitHub Pages sin relay guarda la prueba de suscripción solo en el navegador.
- No se envían campañas masivas todavía.
- Club Tazmany no acepta pagos ni activa membresías.
- Mercado Pago, cupones y canjes siguen fuera de alcance hasta la Fase 4.
