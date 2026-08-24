# Changelog

## 0.2.0 — 2026-08-24

- Se implementó Google Identity Services con nonce y validación servidor-a-servidor para desarrollo/staging.
- Se implementó OTP real por correo con hash, caducidad, límite de intentos y rate limit.
- Se añadieron sesiones propias con token opaco, hash persistido, revocación y limpieza lógica.
- Se añadió RBAC backend para dashboards de cliente y comercio.
- Se añadió perfil de cliente, datos privados protegidos, ciudades y aceptaciones versionadas.
- Se creó el servicio de idempotencia y se aplicó a identidad y perfil.
- Se añadió un workflow de GitHub Pages para publicar el index visual compuesto.
- Se documentó el flujo completo de macOS, clasp, setup, diagnóstico y despliegue.

## 0.1.2 — 2026-08-24

- Se corrigió la aplicación visual del tema para que el amarillo sea realmente dominante.
- El hero dejó el fondo crema/coral y ahora usa amarillo, amarillo claro y ámbar.
- El CTA principal del hero usa navy para obtener contraste sobre el fondo amarillo.
- Las categorías activas y la suscripción adoptaron el nuevo sistema amarillo/navy.
- Se añadió una vista previa versionada para evitar que el navegador reutilice el preview anterior en caché.
- El logotipo anterior permanece temporalmente sin alterar mientras se prepara su nueva versión en un flujo separado.

## 0.1.1 — 2026-08-24

- Se adoptó la dirección visual “Ahorro amarillo + ámbar”.
- Se aplicó la nueva paleta al index y a los dashboards de cliente y comercio.
- Se separaron los colores funcionales de la interfaz de los colores inmutables del logotipo oficial.
- Se reforzó el contraste de CTA, descuentos, navegación, estados y foco visible.
- Se actualizó el encabezado visual de las hojas creadas por `setupTazmany()`.
- Se añadió una prueba automatizada para proteger los tokens del tema y los colores del wordmark.

## 0.1.0 — 2026-08-24

- Se creó la fundación Apps Script + Google Sheets de Tazmany.
- Se añadió `setupTazmany()` idempotente y datos demo de Lima.
- Se implementó el portal público responsive con catálogo y detalle de oferta.
- Se implementaron dashboards demo de cliente y comercio.
- Se añadió validación local, pruebas de dinero/comisiones y vista previa estática.
- Se inició la documentación técnica, manuales y capacitación por rol.
