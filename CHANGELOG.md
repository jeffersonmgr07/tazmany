# Changelog

## 0.3.5 — 2026-08-24

- Se añadió un gateway explícito para comunicar GitHub Pages con Apps Script sin exponer Sheets.
- Se incorporó un relay Cloudflare Worker con CORS de origen exacto, allowlist de acciones y secreto compartido almacenado fuera del repositorio.
- El cliente web ahora selecciona `google.script.run` o el transporte HTTPS remoto según el ambiente.
- Se añadieron diagnóstico del puente, configuración de orígenes y pruebas automatizadas del relay.
- Se documentó que los nueve usuarios seed son registros ficticios y no credenciales OTP utilizables.
- Mercado Pago continúa bloqueado hasta aprobar identidad, RBAC e idempotencia desde GitHub Pages.

## 0.3.0 — 2026-08-24

- Se añadió el scope `script.scriptapp` requerido para instalar y consultar triggers desde `installTazmanyAuthTriggers()`.
- Se incorporó el logotipo oficial transparente y se aumentó su presencia en el encabezado y footer.
- Se sustituyeron los emojis de categorías por un sistema SVG original y reutilizable.
- Se implementó onboarding de comercios con estados, validación, sucursales, documentos y cuenta enmascarada.
- Se implementaron contratos PDF versionados en Drive con hash y aceptación operativa auditable.
- Se implementó creación, envío, versionado y moderación de campañas con RBAC e idempotencia.
- Se añadió el panel administrativo de moderación y datos demo pendientes de revisión.
- Se amplió el esquema a 60 hojas y se añadió `setupTazmanyPhase3()`.

## 0.2.1 — 2026-08-24

- Se añadió un `index.html` estático real en la raíz para GitHub Pages.
- Se cambió la guía visual a **Deploy from a branch → main → /(root)**.
- El generador produce el index raíz y mantiene el artefacto local de `dist/`.
- Se incorporó la validación del index compilado y de la ruta del logotipo existente.
- Se adoptó el formato de entregas incrementales con solo archivos nuevos o modificados.

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
