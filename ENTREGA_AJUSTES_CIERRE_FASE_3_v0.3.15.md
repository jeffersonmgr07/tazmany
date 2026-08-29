# Tazmany 0.3.15 — Ajustes finales del cierre de Fase 3

## Resultado

La Fase 3 permanece cerrada. Este incremento mejora el estado de carga, compacta WhatsApp y actualiza el precio planificado del Club sin habilitar cobros.

## Cambios visibles

- Modal centrado con indicador circular para conectar con Google, enviar o validar OTP, cargar el perfil y guardar información.
- Selector compacto de código internacional de WhatsApp con Perú `+51` predeterminado.
- Club Tazmany: S/ 4.90 el primer mes y S/ 9.90 al mes desde el segundo.

## Funciones de Apps Script

```javascript
setupTazmanyPhase315()
```

```javascript
getTazmanyPhase315Diagnostics()
```

El diagnóstico debe mostrar `ok: true`, `phase: "3-CLOSED"`, los precios 490/990 en céntimos y los cobros desactivados.

## Siguiente etapa

Fase 4 en sandbox: órdenes, reserva temporal de inventario, Mercado Pago y generación idempotente de cupones. No se procesará dinero real al iniciar.
