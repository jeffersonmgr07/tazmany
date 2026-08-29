# Tazmany Fase 4.0 — órdenes y reservas sin cobro

Versión: `0.4.0`

## Alcance

- Corrección de soles y céntimos.
- Precio Club destacado primero: 3 % de cashback.
- Precio público: 1 % de cashback.
- Promoción Club: S/ 4.90 el primer mes y S/ 9.90 desde el segundo.
- Favicon oficial y responsive móvil/tablet/escritorio.
- Indicador de actividad para autenticación y protección contra clics repetidos.
- Caché pública y precarga del panel del cliente.
- Órdenes idempotentes y reserva de inventario durante 10 minutos.
- Cancelación y expiración con liberación de inventario.

## Bloqueos deliberados

- `paymentsEnabled: false`.
- `checkoutEnabled: false`.
- `clubBillingEnabled: false`.
- No se generan cupones ni se acredita cashback hasta confirmar el pago.

## Instalación

1. Descomprimir el incremento sobre el repositorio.
2. Ejecutar las pruebas.
3. Ejecutar `clasp push`.
4. Ejecutar `setupTazmanyPhase4()` una vez.
5. Ejecutar `getTazmanyPhase4Diagnostics()` y confirmar `ok: true`.
6. Crear una nueva versión de Apps Script y actualizar la implementación activa.
7. Desplegar el Worker actualizado.
8. Reconstruir el index conectado y publicar GitHub Pages.

El siguiente incremento de Fase 4 incorporará Mercado Pago en sandbox, webhooks idempotentes, confirmación de órdenes y generación de cupones después del pago aprobado.
