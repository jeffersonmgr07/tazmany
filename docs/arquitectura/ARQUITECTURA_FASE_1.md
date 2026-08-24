# Arquitectura — Fase 1

## Decisión base

Tazmany usa un proyecto Apps Script independiente. `doGet(e)` compone parciales mediante HtmlService y el frontend llama funciones permitidas mediante `google.script.run`. Sheets y Drive nunca se exponen al navegador.

## Capas

| Capa | Archivos | Responsabilidad |
| --- | --- | --- |
| Entrada web | `Main.gs`, `Router.gs` | servir vistas y encapsular respuestas API |
| Dominio de Fase 1 | `CampaignService.gs`, `CustomerService.gs`, `MerchantService.gs` | construir modelos de lectura para cada experiencia |
| Seguridad/validación | `Security.gs`, `Validation.gs` | bloqueo reutilizable, IDs seguros, sanitización |
| Contrato de datos | `DataRepository.gs` | interfaz estable para desacoplar servicios y persistencia |
| Persistencia | `SheetRepository.gs`, `DriveRepository.gs` | lecturas por lote, upsert por ID y acceso documental |
| Provisionamiento | `Setup.gs`, `Seed.gs` | esquema idempotente y datos demo |
| UI | parciales `.html` | portal público y dashboards responsive |

## Contratos de lectura

- `apiGetPublicBootstrap()` devuelve ciudades, categorías, ofertas y comercios destacados.
- `apiGetOfferDetails(campaignId)` valida un ID seguro y devuelve condiciones públicas.
- `apiGetCustomerDashboard()` y `apiGetMerchantDashboard()` son datos demo de Fase 1. No aceptan un `userId` desde el navegador.

## Límites operativos y migración

Medir antes de producción: tiempo p95 de lectura, tiempo p95 de checkout/canje, ejecuciones concurrentes, celdas por archivo, escrituras diarias y fallos por cuota. Iniciar plan de migración SQL cuando cualquiera se sostenga por dos semanas:

- búsquedas públicas p95 mayores a 1.5 s con caché;
- checkout o prevalidación de canje p95 mayor a 2 s;
- más de 25 operaciones críticas concurrentes en hora punta;
- más de 2 millones de celdas activas en el archivo operativo;
- más de 20,000 eventos append-only diarios;
- consumo superior al 70% de una cuota crítica;
- necesidad de consultas relacionales o conciliación que exija múltiples pasadas completas.

Antes del umbral, particionar eventos append-only por periodo y mantener el DTO de servicios separado del formato físico de Sheets.

## Riesgos de Fase 1

- El logo oficial está incluido sin modificar; Apps Script necesita una URL controlada configurada para mostrarlo en producción.
- Las imágenes demo usan URLs externas y deben migrarse a activos controlados.
- Los dashboards no aplican identidad real hasta Fase 2.
- Las protecciones de setup son advertencias para evitar bloquear al propietario durante desarrollo; producción debe asignar editores mínimos.
