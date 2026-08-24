# ADR-001 — Apps Script y Sheets como stack inicial

**Estado:** Aceptado para MVP  
**Fecha:** 2026-08-24

## Contexto

Tazmany requiere una primera versión de bajo costo, desplegable con Google Workspace y mantenida desde GitHub.

## Decisión

Usar Apps Script independiente, HtmlService, `google.script.run`, Sheets y Drive. Separar DTOs y repositorio para no acoplar la UI al formato de las hojas.

## Consecuencias

- Menor infraestructura inicial y operación centralizada.
- Cuotas, concurrencia y volumen limitados.
- Necesidad de bloqueos, idempotencia, caché, archivado y monitoreo.
- Migración SQL obligatoria antes de que los umbrales operativos afecten checkout o canje.
