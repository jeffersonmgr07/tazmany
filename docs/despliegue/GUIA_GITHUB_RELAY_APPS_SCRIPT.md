# Guía — GitHub Pages conectado a Apps Script

## 1. Actualizar Apps Script

```bash
cd ~/Downloads/tazmany
npm run verify
clasp push
```

Actualiza la implementación existente como una **Nueva versión** y conserva la URL terminada en `/exec`.

## 2. Crear el secreto compartido

En Terminal:

```bash
openssl rand -hex 32
```

Copia el resultado. No lo guardes en GitHub.

En Apps Script abre **Configuración del proyecto → Propiedades de la secuencia de comandos** y agrega:

```text
TAZMANY_API_RELAY_SECRET = resultado generado
TAZMANY_ALLOWED_FRONTEND_ORIGINS = https://jeffersonmgr07.github.io
```

Ejecuta:

1. `setupTazmanyFrontendBridge()`
2. `getTazmanyFrontendBridgeDiagnostics()`

El diagnóstico debe devolver `ok: true` y nunca muestra el secreto.

## 3. Desplegar el relay

Edita `wrangler.toml` y reemplaza `APPS_SCRIPT_URL` por la URL `/exec` vigente.

```bash
npm install --global wrangler
wrangler login
wrangler deploy
wrangler secret put APPS_SCRIPT_RELAY_SECRET
```

Cuando Wrangler solicite el valor, pega el mismo secreto generado. Ejecuta nuevamente:

```bash
wrangler deploy
```

Copia la dirección del Worker, por ejemplo:

```text
https://tazmany-api-relay.TU_SUBDOMINIO.workers.dev
```

Comprueba:

```text
https://tazmany-api-relay.TU_SUBDOMINIO.workers.dev/health
```

## 4. Generar el index conectado

```bash
cd ~/Downloads/tazmany
TAZMANY_API_BASE_URL="https://tazmany-api-relay.TU_SUBDOMINIO.workers.dev" npm run build:github
```

Esto actualiza `index.html`. La URL del Worker es pública y puede estar en HTML; el secreto no.

## 5. Publicar GitHub Pages

```bash
git add .
git commit -m "Conectar GitHub Pages con backend Tazmany 0.3.5"
git push origin main
```

Abre `https://jeffersonmgr07.github.io/tazmany/` y fuerza recarga con `Command + Shift + R`.

## 6. Google Identity

En la credencial OAuth Web agrega como origen autorizado:

```text
https://jeffersonmgr07.github.io
```

No agregues `/tazmany/` porque un origen no contiene rutas.

## 7. Criterios de aceptación

- El catálogo llega desde Sheets.
- OTP llega a un correo real y crea/restaura sesión.
- Cliente no accede a comercio ajeno ni administración.
- Una llave de idempotencia repetida no duplica registros.
- El navegador no contiene `TAZMANY_API_RELAY_SECRET`.
- Pagos y canjes continúan desactivados.
