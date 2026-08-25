# ADR-004 — Frontend público en GitHub Pages con relay controlado

- Estado: aceptado para desarrollo
- Fecha: 2026-08-24
- Versión: 0.3.5

## Contexto

La Web App de Apps Script agrega avisos visuales propios de Google. Tazmany necesita que la interfaz pública se sirva desde GitHub Pages y posteriormente desde un dominio propio, manteniendo Apps Script, Sheets y Drive como backend inicial.

`google.script.run` solo existe en páginas servidas por `HtmlService`. Una página de GitHub no puede utilizarlo. Apps Script tampoco ofrece en `ContentService` el control de cabeceras necesario para diseñar directamente una API CORS completa.

## Decisión

Usar este flujo:

```text
Navegador → GitHub Pages → HTTPS → relay → Apps Script /exec/api → servicios → Sheets/Drive
```

El relay:

- acepta únicamente orígenes configurados;
- responde preflight CORS;
- permite solo acciones explícitas;
- conserva un secreto compartido fuera del navegador y del repositorio;
- reenvía la solicitud a Apps Script;
- no decide RBAC ni consulta Sheets.

Apps Script conserva la fuente de verdad para autenticación, sesiones, permisos, idempotencia y datos.

## Consecuencias

- GitHub Pages puede ser la interfaz real sin el aviso visual de Apps Script.
- Se incorpora un componente mínimo adicional que debe desplegarse, monitorearse y tener ambientes separados.
- El secreto del relay debe rotarse si se sospecha exposición.
- CORS y la allowlist reducen superficie, pero no sustituyen autenticación, RBAC, rate limit ni auditoría.
- Mercado Pago continúa bloqueado hasta completar pruebas del canal.
