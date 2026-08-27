# Entrega incremental Tazmany 0.3.9

Incluye únicamente archivos nuevos o modificados respecto de la versión 0.3.8.

## Resultado

- Portal público sin avisos de demo, desarrollo, fases ni arquitectura interna.
- Bloque público de captación de comercios retirado temporalmente.
- Navegación móvil pública sin acceso directo a Comercio.
- Dashboards con textos orientados al usuario.
- Suscripción pública sin confirmaciones falsas cuando el servicio aún no está conectado.
- Pagos, checkout y cobros del Club bloqueados.
- Compuerta final `getTazmanyPhase39Diagnostics()`.
- 23 pruebas automatizadas.

## Actualización rápida por Terminal

```bash
cd ~/Downloads/tazmany
unzip -o ~/Downloads/Tazmany_Cierre_Fase3_9_v0.3.9_INCREMENTAL.zip -d .
node tools/validate-project.mjs
node --test tests/unit/*.test.mjs
clasp push
```

Actualiza la implementación Web App existente como una nueva versión; conserva el mismo deployment y la URL `/exec`.

No ejecutes `setupTazmany()` ni setups de fases anteriores. Esta entrega no crea ni modifica hojas.

## Archivos de Apps Script nuevos o modificados

- `Config.gs`
- `app.html`
- `components.html`
- `merchant.html`
- `admin.html`
- `discovery.html`
- `phase3.html`
- `auth.html`
- `styles.html`
- `scripts.html`
- `FrontendApiGateway.gs`
- `Phase39Setup.gs` (nuevo)

## Cierre del puente público

Sigue `docs/despliegue/GUIA_GITHUB_RELAY_APPS_SCRIPT.md` para configurar Google Identity, el secreto compartido, Cloudflare Worker y el `index.html` conectado.

## Diagnóstico final

Ejecuta en Apps Script:

```javascript
getTazmanyPhase39Diagnostics()
```

Resultado requerido antes de empezar la Fase 4:

```text
phase3ClosureOk: true
readyForPhase4: true
paymentsEnabled: false
```

Si `phase3ClosureOk` es `true` y `readyForPhase4` es `false`, el código y la interfaz están cerrados, pero todavía falta alguna propiedad de Google Identity o del puente seguro indicada en `issues`.
