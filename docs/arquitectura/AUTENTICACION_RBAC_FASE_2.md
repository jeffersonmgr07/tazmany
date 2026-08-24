# Arquitectura de autenticación y RBAC — Fase 2

## Alcance

La fase incorpora identidad Google, OTP por correo, sesiones propias, perfil de cliente, RBAC e idempotencia. Mercado Pago continúa desactivado.

## Flujos

### Google

1. Google Identity Services genera un ID token con nonce.
2. El frontend envía token y nonce mediante `google.script.run`.
3. Apps Script valida audiencia, emisor, expiración, correo verificado, nonce y `sub`.
4. Un hash con pepper de `sub` identifica la cuenta; el correo no funciona como clave primaria.
5. Se crea una sesión Tazmany independiente del tiempo de vida del ID token.

`TOKENINFO` se admite solo en development/staging. En producción, `GoogleIdentityService.gs` bloquea el flujo salvo que `RELAY` verifique la firma con una biblioteca oficial.

### OTP

1. Se valida y normaliza el correo.
2. Rate limit: un envío por minuto y máximo cinco solicitudes por hora/correo.
3. Se crea código de seis dígitos; Sheets guarda solo hash con pepper.
4. El código vence en diez minutos y permite cinco intentos.
5. Al consumirlo se crea una sesión propia y se audita el ingreso.

### Sesión

- El navegador conserva el token opaco.
- `USER_SESSIONS` guarda solamente `token_hash`.
- El backend valida estado de sesión, vencimiento, cuenta, roles y permiso en cada API protegida.
- Revocaciones y vencimientos son lógicos; no se borra el historial.

### Perfil

- `CUSTOMER_PROFILES` contiene datos mostrables enmascarados.
- `CUSTOMER_PRIVATE_DATA` contiene celular, hash documental y últimos cuatro caracteres; se protege y se restringe.
- `TERMS_ACCEPTANCES` registra versiones, fecha y evidencia mínima.
- Cambiar de celular invalida una verificación telefónica previa.

## RBAC inicial

| Dominio | Roles principales | Control |
| --- | --- | --- |
| Cliente | `CUSTOMER` | perfil, dashboard y sesiones propias |
| Comercio | propietario, admin, campañas, sucursal, caja, finanzas lectura | permisos mínimos por acción |
| Tazmany | superadmin, admin, comercial, KYC, moderación, finanzas, soporte, reclamos, auditor | permisos administrativos segmentados |

Un `MERCHANT_USER` activo vincula al usuario con el comercio. Un usuario sin vínculo no recibe datos del dashboard aunque manipule la ruta.

## Idempotencia

`IDEMPOTENCY_KEYS` guarda `scope`, hash de llave, hash de solicitud, estado y respuesta no sensible. Repetir la misma llave y cuerpo devuelve el resultado previo; reutilizarla con otro cuerpo genera conflicto.

Respuestas con token se guardan temporalmente solo en `CacheService` por dos minutos. El registro durable conserva únicamente IDs no sensibles.

## Riesgos y límites

- Sheets no es un almacén de identidad ilimitado; medir latencia y volumen.
- Un token en `localStorage` exige mantener XSS bajo control y escapar toda salida dinámica.
- MailApp tiene cuotas diarias; el diagnóstico las expone sin enviar correos.
- Verificación de teléfono real sigue pendiente de proveedor SMS.
- Las protecciones `warningOnly` ayudan a evitar errores humanos, pero los permisos de Drive/Sheets deben restringirse por ambiente.
