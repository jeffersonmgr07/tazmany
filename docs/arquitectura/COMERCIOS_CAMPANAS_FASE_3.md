# Arquitectura — Comercios y campañas (Fase 3)

## Alcance

La Fase 3 incorpora el alta de comercios, sucursales, documentos, cuenta bancaria enmascarada, contrato marco preliminar, campañas versionadas y moderación. Mercado Pago, órdenes reales y cupones permanecen fuera de alcance.

## Flujo de comercio

1. Un usuario autenticado guarda un expediente `BORRADOR`.
2. El backend valida RUC, representante, contacto, sucursal y cuenta antes de pasar a `PENDIENTE_VERIFICACION`.
3. Tazmany aprueba u observa mediante un permiso administrativo específico.
4. Un comercio aprobado genera un contrato PDF privado en Drive y registra su aceptación operativa.
5. Al aceptar el contrato, el comercio puede quedar `ACTIVO`.

Los números de documento, RUC y cuenta no se exponen al frontend. Se conservan hashes, últimos dígitos o valores enmascarados según su propósito.

## Flujo de campaña

1. El comercio activo guarda `BORRADOR` con opción, stock, fechas, sedes, incluidos y restricciones.
2. Cada guardado genera una fila en `CAMPAIGN_VERSIONS`.
3. Para enviar a revisión se exige contrato aceptado y validación completa.
4. Un moderador aprueba, solicita cambios, rechaza o pausa con auditoría.
5. La aprobación enlaza `published_version_id`; una versión publicada no se edita silenciosamente.

## Controles

- Autorización backend por RBAC.
- Idempotencia en altas, guardados, contratos y decisiones.
- `LockService` dentro de la capa idempotente.
- Dinero en céntimos enteros y fechas UTC.
- Documentos en Drive y solo IDs/hashes en Sheets.
- Datos financieros, privados y contratos protegidos con advertencia.

## Pendiente profesional

El texto contractual, KYC, tratamiento de datos, comisiones e implicancias tributarias están marcados como pendientes de validación legal, tributaria y contable antes de producción.
