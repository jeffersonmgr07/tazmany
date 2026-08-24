# Diccionario de datos — Fase 2

El esquema en `src/Setup.gs` contiene 59 hojas. Esta fase añade las siguientes entidades:

| Hoja | Datos | Regla |
| --- | --- | --- |
| `AUTH_IDENTITIES` | proveedor, hash de `sub`, usuario y correo verificado | `GOOGLE + hash(sub)` identifica la cuenta externa |
| `OTP_CHALLENGES` | correo, hash del código, intentos, expiración y consumo | nunca guarda el código plano |
| `USER_SESSIONS` | usuario, hash del token, dispositivo, expiración y revocación | nunca guarda el token plano |
| `CUSTOMER_PRIVATE_DATA` | celular, fecha de verificación, hash y últimos cuatro del documento | acceso humano mínimo |
| `CUSTOMER_PROFILES` | nombres y valores enmascarados | DTO seguro para la UI |
| `USER_CITY_PREFERENCES` | ciudades y principal | una principal activa por usuario |
| `TERMS_ACCEPTANCES` | versiones, consentimiento y evidencia | historial inmutable por versión |
| `IDEMPOTENCY_KEYS` | scope, hashes, estado y respuesta no sensible | evita efectos duplicados |

## Estados relevantes

- OTP: `ACTIVE`, `CONSUMED`, `EXPIRED`, `BLOCKED`, `FAILED`.
- Sesión: `ACTIVE`, `REVOKED`, `EXPIRED`.
- Idempotencia: `PROCESSING`, `COMPLETED`, `FAILED`, `EXPIRED`.
- Aceptación: `ACCEPTED`.

## Privacidad

El número documental completo no se persiste: se conserva hash con pepper y últimos cuatro caracteres. El celular se conserva en la hoja privada para una futura verificación SMS; su copia en el perfil y usuario permanece enmascarada.
