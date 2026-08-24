# ADR-003 — Identidad, sesiones y RBAC

**Estado:** aceptada para Fase 2  
**Fecha:** 2026-08-24

## Decisión

Tazmany usará Google Identity Services y OTP por correo como proveedores de identidad, pero emitirá sesiones propias con tokens opacos. Roles y permisos se validarán en Apps Script para cada API protegida.

## Motivos

- El ID token de Google dura poco y no reemplaza la sesión de la aplicación.
- OTP ofrece alternativa sin contraseña almacenada.
- Separar identidad, sesión y autorización facilita revocación, auditoría y migración futura.
- El `sub` de Google es estable; el correo puede cambiar.

## Producción

El endpoint `tokeninfo` queda limitado a desarrollo/staging. Producción utilizará un relay mínimo HTTPS que valide firma y claims con una biblioteca oficial. Sin relay, el backend devuelve un error controlado y no crea sesión Google.

## Consecuencias

- Se agregan hojas de identidad, OTP, datos privados y aceptaciones.
- El cliente debe conservar un token local y enviarlo a cada función protegida.
- Cerrar una sesión no revoca la cuenta Google; solo el acceso Tazmany.
- Mercado Pago no se inicia hasta aprobar pruebas de identidad, RBAC e idempotencia.

