# Diccionario de datos — Fase 1

El esquema completo vive en `src/Setup.gs` como `TAZMANY_SCHEMA`. Se crean 54 hojas funcionales del prompt más `SCHEMA_MIGRATIONS`, para un total de 55.

## Entidades activas en la UI

| Entidad | Clave | Uso actual |
| --- | --- | --- |
| `CITIES` | `id` | selector de ciudad |
| `CATEGORIES` | `id` | navegación y filtros |
| `MERCHANTS` | `id` | marca, reputación y comercio propietario |
| `BRANCHES` | `id` | sedes del detalle |
| `CAMPAIGNS` | `id` | catálogo y métricas |
| `CAMPAIGN_OPTIONS` | `id` | opción principal demo |
| `USERS` | `id` | directorio ficticio, aún sin login |
| `CUSTOMER_PROFILES` | `id` | perfil ficticio del cliente |
| `ORDERS` | `id` | resumen demo de compras |
| `COUPONS` | `id` | estados demo disponibles/redimidos |
| `CASHBACK_LEDGER` | `id` | movimiento disponible demo |
| `SETTLEMENTS` | `id` | próximo pago estimado demo |

## Convenciones

- `*_cents`: entero en céntimos de sol.
- `*_basis_points`: puntos básicos; 1500 equivale a 15%.
- `*_json`: JSON serializado y validado por el servicio.
- `created_at`, `updated_at`: ISO UTC.
- `status`: baja lógica/estado de flujo.
- `version`: versión optimista o del registro cuando aplique.
