# Entrega incremental Tazmany 0.3.5

Esta entrega agrega la transición para usar GitHub Pages como interfaz conectada y mantiene Apps Script como backend. Incluye únicamente archivos nuevos o modificados respecto de `0.3.0`.

## Estado

- Fases funcionales completadas: 0, 1, 2 y 3.
- Incremento técnico completado: 3.5.
- Siguiente fase: 4.
- Restan seis fases funcionales: 4 a 9.

## Usuarios demo

Existen nueve registros ficticios: cinco de Tazmany, dos clientes y dos propietarios de comercio. No son buzones ni contraseñas de prueba. Para probar OTP debe usarse un correo real controlado.

## Aplicación

```bash
unzip -o Tazmany_GitHub_Fase3_5_v0.3.5_INCREMENTAL.zip -d ~/Downloads/tazmany
cd ~/Downloads/tazmany
npm run verify
clasp push
```

Después sigue `docs/despliegue/GUIA_GITHUB_RELAY_APPS_SCRIPT.md`.

## Bloqueo financiero

No contiene Access Token de Mercado Pago ni procesa pagos. La Fase 4 se habilita después de probar el puente con identidad, sesiones, RBAC e idempotencia.
