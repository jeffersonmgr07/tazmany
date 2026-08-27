# Guía — Cierre 0.3.11: tazmany.com conectado a Apps Script

## 1. Actualizar Apps Script

```bash
cd ~/Downloads/tazmany
npm run verify
clasp push
```

Actualiza la implementación existente como una **Nueva versión** y conserva la URL terminada en `/exec`.

No ejecutes funciones `setup` de fases anteriores: esta actualización no modifica el esquema de Sheets.

## 2. Configurar el ambiente de pruebas

En Apps Script abre **Configuración del proyecto → Propiedades de la secuencia de comandos** y configura:

```text
TAZMANY_ENVIRONMENT = staging
TAZMANY_GOOGLE_CLIENT_ID = TU_CLIENT_ID.apps.googleusercontent.com
TAZMANY_GOOGLE_VERIFY_MODE = TOKENINFO
TAZMANY_ALLOWED_FRONTEND_ORIGINS = https://tazmany.com,https://www.tazmany.com,https://jeffersonmgr07.github.io
```

`TOKENINFO` se usa únicamente durante desarrollo y sandbox. Antes del lanzamiento público con pagos debe sustituirse por la verificación de producción configurada en el backend.

## 3. Crear el secreto compartido

En Terminal:

```bash
openssl rand -hex 32
```

Copia el resultado. No lo guardes en GitHub.

En Apps Script abre **Configuración del proyecto → Propiedades de la secuencia de comandos** y agrega:

```text
TAZMANY_API_RELAY_SECRET = resultado generado
TAZMANY_ALLOWED_FRONTEND_ORIGINS = https://tazmany.com,https://www.tazmany.com,https://jeffersonmgr07.github.io
```

Ejecuta:

1. `setupTazmanyFrontendBridge()`
2. `getTazmanyFrontendBridgeDiagnostics()`

El diagnóstico debe devolver `ok: true` y nunca muestra el secreto.

## 4. Desplegar el relay

`wrangler.toml` ya contiene la URL `/exec` de la implementación vigente. Comprueba que siga abriendo Tazmany antes de desplegar.

```bash
npx wrangler login
npx wrangler secret put APPS_SCRIPT_RELAY_SECRET
npx wrangler deploy
```

Cuando Wrangler solicite el valor, pega el mismo secreto generado para Apps Script. Nunca lo escribas en `wrangler.toml`, GitHub ni el código.

Copia la dirección del Worker, por ejemplo:

```text
https://tazmany-api-relay.TU_SUBDOMINIO.workers.dev
```

Comprueba:

```text
https://tazmany-api-relay.TU_SUBDOMINIO.workers.dev/health
```

## 5. Generar el index conectado

```bash
cd ~/Downloads/tazmany
TAZMANY_API_BASE_URL="https://tazmany-api-relay.TU_SUBDOMINIO.workers.dev" npm run build:github
```

Esto actualiza `index.html`. La URL del Worker es pública y puede estar en HTML; el secreto no.

## 6. Publicar GitHub Pages

```bash
git add .
git commit -m "Cerrar interfaz publica y prepagos Tazmany 0.3.9"
git push origin main
```

Abre `https://tazmany.com/` y fuerza recarga con `Command + Shift + R`.

## 7. Google Identity

En la credencial OAuth Web agrega como origen autorizado:

```text
https://tazmany.com
https://www.tazmany.com
```

Conserva temporalmente `https://jeffersonmgr07.github.io` como origen de respaldo. Los orígenes no contienen rutas ni `/` final.

Copia el Client ID del tipo **Aplicación web** y guárdalo en la propiedad `TAZMANY_GOOGLE_CLIENT_ID`. El secreto OAuth no se utiliza en el navegador ni debe subirse al repositorio.

## 8. Diagnóstico final

En Apps Script ejecuta:

```javascript
getTazmanyPhase39Diagnostics()
```

La Fase 3 queda cerrada cuando devuelve:

```text
phase3ClosureOk: true
readyForPhase4: true
paymentsEnabled: false
```

## 9. Criterios de aceptación

- El catálogo llega desde Sheets.
- OTP llega a un correo real y crea/restaura sesión.
- Cliente no accede a comercio ajeno ni administración.
- Una llave de idempotencia repetida no duplica registros.
- El navegador no contiene `TAZMANY_API_RELAY_SECRET`.
- Pagos y canjes continúan desactivados.
