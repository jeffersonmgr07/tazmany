# Arquitectura — Puente GitHub Pages (Fase 3.5)

## Componentes

| Componente | Responsabilidad |
| --- | --- |
| `index.html` | interfaz pública generada desde los parciales de `src/` |
| `scripts.html` | selecciona transporte local `google.script.run` o remoto HTTPS |
| `worker/tazmany-api-relay.js` | CORS, origen, tamaño y allowlist de acciones |
| `FrontendApiGateway.gs` | valida secreto/origen y despacha únicamente funciones públicas autorizadas |
| servicios `.gs` | validación, identidad, RBAC, idempotencia y reglas de negocio |
| Sheets/Drive | persistencia privada, nunca accesible desde el navegador |

## Controles

1. El navegador conoce la URL pública del relay, pero nunca el secreto compartido.
2. El Worker solo acepta `POST /api` y `OPTIONS /api` desde orígenes exactos configurados.
3. El Worker y Apps Script mantienen la misma allowlist explícita.
4. Apps Script compara el secreto en tiempo constante y vuelve a comprobar el origen.
5. Las funciones protegidas siguen exigiendo una sesión Tazmany válida y permisos backend.
6. Las escrituras continúan usando llaves de idempotencia.
7. Las respuestas no se almacenan en caché en el relay.

## No implementado

- Mercado Pago, pagos reales, Webhooks y conciliación.
- Rate limiting de infraestructura administrado desde Cloudflare.
- Cookies HttpOnly; la sesión actual continúa en almacenamiento del navegador durante el MVP.
- Dominio final y configuración de producción.

Estos puntos se revisan antes o durante la Fase 4.
