# Capacitación — identidad y permisos

## Conceptos

- **OTP:** código temporal enviado al correo; nunca debe compartirse.
- **Sesión:** acceso revocable de un dispositivo; no es la sesión de Google.
- **RBAC:** cada rol recibe solo las acciones necesarias.
- **Idempotencia:** repetir una solicitud no repite su efecto.

## Atención al cliente

- Si el código no llega, confirmar correo, revisar spam y verificar la cuota de MailApp.
- Si venció, solicitar uno nuevo; no ampliar manualmente el registro.
- Nunca pedir al cliente su OTP ni su token de sesión.
- Una cuenta suspendida debe pasar por soporte; no crear otra fila con el mismo correo.

## Equipo técnico

- Revisar `getTazmanyPhase2Diagnostics()` antes de cada despliegue.
- Mantener `TOKENINFO` fuera de producción.
- Rotar el pepper solo con un procedimiento que invalide todas las sesiones y OTP activos.
- No copiar `TAZMANY_AUTH_PEPPER` ni secretos a GitHub, HTML, logs o Sheets visibles.

