# Guía macOS — GitHub, clasp y Apps Script

## 1. Preparar Terminal

Descomprime el ZIP completo de GitHub y entra a su carpeta:

```bash
cd ~/Downloads/tazmany-webapp
node -v
npm install
npm install --global @google/clasp
clasp --version
```

Se requiere Node.js 20 o superior. Si `node` no existe, instala la versión LTS desde <https://nodejs.org/> y vuelve a abrir Terminal.

## 2. Autorizar clasp

1. Activa Google Apps Script API en <https://script.google.com/home/usersettings>.
2. Ejecuta `clasp login`.
3. Confirma la cuenta Google propietaria del proyecto.

No compartas ni subas `.clasprc.json`; contiene la autorización local de clasp.

## 3. Vincular el proyecto

1. Crea un proyecto independiente en <https://script.google.com/>.
2. Abre **Configuración del proyecto** y copia el **Script ID**.
3. En Terminal:

```bash
cp .clasp.example.json .clasp.json
nano .clasp.json
```

Reemplaza el texto provisional:

```json
{
  "scriptId": "TU_SCRIPT_ID",
  "rootDir": "src"
}
```

Guarda con `Control + O`, `Enter`; sal con `Control + X`.

## 4. Verificar y subir

```bash
npm run verify
clasp status
clasp push
clasp open-script
```

`clasp push` carga de una vez todos los `.gs`, `.html` y `appsscript.json` contenidos en `src/`.

## 5. Inicializar Tazmany

Ejecuta desde el editor, en orden:

| Orden | Función | Resultado esperado |
| --- | --- | --- |
| 1 | `setupTazmany()` | Spreadsheet, 60 hojas, Drive, migraciones y seeds |
| 2 | `setupTazmanyPhase2()` | pepper, propiedades y hojas privadas verificadas |
| 3 | `installTazmanyAuthTriggers()` | trigger diario único |
| 4 | `setupTazmanyPhase3()` | comercios, contratos, campañas y carpetas privadas |
| 5 | `getTazmanyPhase2Diagnostics()` | diagnóstico de identidad y correo |
| 6 | `getTazmanyPhase3Diagnostics()` | diagnóstico de comercios y campañas |

Autoriza Sheets, Drive, UrlFetch, MailApp y triggers cuando Google lo solicite.

## 6. Configurar identidad

En **Configuración del proyecto → Propiedades de la secuencia de comandos** añade:

```text
TAZMANY_ENVIRONMENT = development
TAZMANY_GOOGLE_CLIENT_ID = TU_CLIENT_ID_WEB.apps.googleusercontent.com
TAZMANY_GOOGLE_VERIFY_MODE = TOKENINFO
```

El Client ID no es secreto. `TOKENINFO` es solo para desarrollo/staging; producción requiere `RELAY`.

## 7. Publicar

En **Implementar → Nueva implementación → Aplicación web**:

- Ejecutar como: propietario.
- Acceso: usuarios de prueba durante desarrollo.
- Copia la URL terminada en `/exec`.

Después de cambios:

```bash
git pull
npm install
npm run verify
clasp push
clasp version "Tazmany Fase 3 v0.3.0"
clasp deployments
clasp redeploy DEPLOYMENT_ID VERSION_NUMBER "Tazmany Fase 3 v0.3.0"
```

Si prefieres, puedes editar la implementación existente desde Apps Script; conserva el mismo deployment ID.

## 8. Vista visual de GitHub

En GitHub abre **Settings → Pages**, selecciona **Deploy from a branch**, rama **main** y carpeta **/(root)**. GitHub publicará el `index.html` raíz. Este preview no se conecta a Sheets; la autenticación real se prueba en `/exec`.

## Solución rápida de errores

| Error | Revisión |
| --- | --- |
| `User has not enabled the Apps Script API` | activa la API en `script.google.com/home/usersettings` |
| `Script ID is invalid` | revisa `.clasp.json` y que no copiaste el deployment ID |
| Google `unregistered_origin` | agrega el origen HTTPS exacto de la Web App al Client ID web |
| OTP no llega | revisa spam, `MailApp` y el diagnóstico de cuota |
| `AUTH_NOT_CONFIGURED` | ejecuta `setupTazmanyPhase2()` |
| `SESSION_EXPIRED` | borra la sesión desde la interfaz y vuelve a ingresar |
