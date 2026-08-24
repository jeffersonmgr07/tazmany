# Diccionario de datos — Fase 3

## Nuevas estructuras principales

| Hoja | Propósito | Regla importante |
| --- | --- | --- |
| `MERCHANT_PRIVATE_DATA` | Hashes y últimos dígitos de RUC/documento; teléfono normalizado | Acceso humano mínimo |
| `MERCHANT_STATUS_HISTORY` | Cambios de estado del comercio | Historial, no borrado físico |
| `MERCHANT_DOCUMENTS` | Metadatos y hash de archivos en Drive | El binario no vive en Sheets |
| `MERCHANT_BANK_ACCOUNTS` | Cuenta/CCI enmascarados y hashes | Cambio con espera de 72 horas |
| `CAMPAIGN_VERSIONS` | Instantánea de cada borrador/envío/aprobación | Conserva condiciones históricas |
| `CAMPAIGN_OPTIONS` | Precios y stock por opción | Importes en céntimos |
| `CAMPAIGN_BRANCHES` | Sedes participantes | Valida pertenencia al comercio |
| `CONTRACTS` | Versión, archivo y hash del contrato | PDF privado en Drive |
| `CONTRACT_ACCEPTANCES` | Usuario, fecha y evidencia | Evidencia operativa, no afirmación de firma regulada |

## Estados

- Comercio: `BORRADOR`, `PENDIENTE_VERIFICACION`, `OBSERVADO`, `APROBADO`, `ACTIVO`, `SUSPENDIDO`, `EN_REVISION`, `DADO_DE_BAJA`.
- Campaña: `BORRADOR`, `ENVIADA_A_REVISION`, `CAMBIOS_SOLICITADOS`, `APROBADA`, `PROGRAMADA`, `ACTIVA`, `PAUSADA`, `AGOTADA`, `FINALIZADA`, `RECHAZADA`, `ARCHIVADA`.
- Contrato: `ISSUED`, `ACCEPTED`, `ARCHIVED`.

`migration-003` identifica este cambio de esquema. `setupTazmany()` y `setupTazmanyPhase3()` son idempotentes.
