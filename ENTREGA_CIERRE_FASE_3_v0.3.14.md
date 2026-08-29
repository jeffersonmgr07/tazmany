# Tazmany 0.3.14 — Cierre de Fase 3

## Resultado

La Fase 3 queda lista para cierre después de desplegar esta versión y aprobar su diagnóstico.

## Cambios

- Nombres y apellidos sugeridos desde Google Identity cuando están disponibles.
- Documento solicitado por separado porque Google no proporciona DNI, CE ni pasaporte.
- WhatsApp internacional con selector de país y código de llamada.
- Perú `+51` predeterminado, pero reemplazable por cualquier país.
- Persistencia segura del teléfono E.164 y del ISO del país.
- Migración controlada de `CUSTOMER_PRIVATE_DATA`.

## Funciones de Apps Script

```javascript
setupTazmanyPhase314()
```

```javascript
getTazmanyPhase314Diagnostics()
```

El diagnóstico final debe mostrar `ok: true`, `phase: "3-CLOSED"` y `paymentsRemainDisabled: true`.

## Siguiente etapa

Fase 4 en sandbox: órdenes, reserva temporal de inventario, Mercado Pago y generación idempotente de cupones. No se procesará dinero real al iniciar.
