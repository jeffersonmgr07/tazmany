# Tazmany Web App

Marketplace peruano de ofertas y cupones digitales construido con GitHub, Google Apps Script, Google Sheets, Google Drive y HTML/CSS/JavaScript.

## Estado

Versión `0.3.0` — Fase 3: incorporación de comercios, contratos preliminares, campañas versionadas, moderación backend e identidad visual oficial.

### Real en la Web App de Apps Script

- Portal público y dashboards responsive con la identidad “Ahorro amarillo + ámbar + navy”.
- Inicio de sesión por código OTP enviado con `MailApp`.
- Sesiones propias: el navegador recibe el token una sola vez y Sheets guarda solo su hash.
- Perfil de cliente, ciudades, consentimiento de marketing separado y aceptaciones legales versionadas.
- RBAC verificado en backend para los paneles de cliente y comercio.
- Idempotencia para solicitudes OTP, verificación y guardado de perfil.
- Google Identity Services en desarrollo/staging cuando se configura el Client ID.
- Expediente de comercio con estados, RUC validado, sucursales, cuenta enmascarada y datos sensibles hasheados.
- Contrato marco PDF versionado en Drive con hash y evidencia de aceptación operativa.
- Creación de campañas, opciones, stock, vigencias, sedes y versiones inmutables.
- Moderación con permisos separados para comercios y campañas, motivos y auditoría.
- Logotipo oficial transparente de Tazmany e iconografía SVG propia para categorías.

### Visual o simulado

- GitHub Pages publica una vista visual navegable con catálogo, paneles de cliente/comercio y moderación demo. No tiene acceso a Sheets ni ejecuta autenticación.
- Datos de órdenes, cupones, cashback y liquidaciones siguen siendo ficticios.

### Pendiente o bloqueado

- La verificación de Google mediante `tokeninfo` está permitida solo en desarrollo/staging. Producción exige configurar un relay que valide criptográficamente el ID token con una biblioteca oficial de Google.
- El celular se registra, pero queda `phoneVerified: false` hasta integrar un proveedor SMS.
- Mercado Pago, compras, QR, canjes y operaciones financieras permanecen desactivados.

## Arquitectura

```text
GitHub (fuente oficial)
  ├─ GitHub Pages → index.html estático en la raíz
  └─ clasp → src/ → proyecto Apps Script independiente
                    ├─ HtmlService
                    ├─ google.script.run
                    ├─ servicios + RBAC + idempotencia
                    ├─ Google Sheets
                    └─ Google Drive / MailApp
```

El navegador nunca lee ni escribe Sheets directamente. Cada ambiente debe tener su propio proyecto Apps Script, Spreadsheet, carpeta Drive y deployment ID.

## Estructura principal

```text
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
├── index.html            vista visual para GitHub Pages
├── assets/brand/
├── docs/
├── src/
│   ├── *Service.gs
│   ├── Setup.gs
│   ├── Phase2Setup.gs
│   ├── Phase3Setup.gs
│   ├── MerchantOnboardingService.gs
│   ├── CampaignWorkflowService.gs
│   ├── ContractService.gs
│   ├── ModerationService.gs
│   ├── appsscript.json
│   ├── index.html
│   ├── auth.html
│   ├── category-icons.html
│   ├── phase3.html
│   ├── styles.html
│   └── scripts.html
├── tests/unit/
├── tools/
└── dist/                  generado; no versionado
```

## Vista visual en GitHub Pages

1. Sube `index.html` a la raíz del repositorio, al mismo nivel que `README.md`.
2. Abre **Settings → Pages**.
3. En **Build and deployment → Source**, elige **Deploy from a branch**.
4. Selecciona la rama **main** y la carpeta **/(root)**; luego pulsa **Save**.
5. Espera la publicación y abre la URL mostrada por GitHub Pages.

El `index.html` raíz ya contiene los parciales visuales compilados y usa el logotipo existente en `assets/brand/tazmany-logo.png`. Es una vista pública y estática: no accede a Sheets ni ejecuta autenticación. La Web App funcional continúa desplegándose desde `src/` con clasp.

Si el repositorio todavía contiene `.github/workflows/pages.yml`, elimínalo una sola vez al cambiar a **Deploy from a branch**. Los workflows `ci.yml` y `deploy.yml` se conservan.

## Entregas incrementales a GitHub

A partir de `0.2.1`, cada avance manual se entrega como actualización incremental:

- el ZIP incluye solamente archivos nuevos o modificados;
- cada archivo conserva su ruta exacta dentro del repositorio;
- los assets sin cambios no se repiten;
- las eliminaciones se indican expresamente en la entrega;
- un paquete completo se genera solo al solicitarlo o al cerrar un hito.

Cuando cambie la interfaz, el `index.html` raíz se incluirá entre los modificados para que GitHub Pages muestre la versión más reciente.

## Subir todos los archivos a Apps Script desde macOS

Requisitos: Node.js 20 o superior, Git y una cuenta Google.

```bash
cd ~/Downloads/tazmany-webapp
node -v
npm install
npm install --global @google/clasp
clasp login
```

Activa **Google Apps Script API** en <https://script.google.com/home/usersettings>. Luego crea un proyecto independiente en <https://script.google.com/>, copia su **Script ID** y ejecuta:

```bash
cp .clasp.example.json .clasp.json
nano .clasp.json
```

Contenido local de `.clasp.json`:

```json
{
  "scriptId": "PEGA_AQUI_EL_SCRIPT_ID",
  "rootDir": "src"
}
```

Guarda en `nano` con `Control + O`, `Enter` y sal con `Control + X`. Después:

```bash
npm run verify
clasp status
clasp push
clasp open-script
```

`.clasp.json` y `.clasprc.json` están ignorados por Git y no deben subirse.

## Funciones que debes ejecutar

En el editor de Apps Script, ejecuta en este orden y acepta los permisos solicitados:

1. `setupTazmany()` — crea o actualiza el Spreadsheet, las 60 hojas, Drive, migraciones y datos demo.
2. `setupTazmanyPhase2()` — confirma las hojas de autenticación y genera el pepper secreto y valores seguros por defecto. Es idempotente.
3. `installTazmanyAuthTriggers()` — instala una limpieza lógica diaria de sesiones, OTP e idempotencias vencidas.
4. `setupTazmanyPhase3()` — aplica las estructuras de comercios, documentos, campañas, contratos y carpetas privadas.
5. `getTazmanyPhase2Diagnostics()` — comprueba configuración, modo de Google y cuota restante de correo.
6. `getTazmanyPhase3Diagnostics()` — resume comercios, campañas, contratos y problemas pendientes.

`seedDemoData()` ya es llamado por `setupTazmany()`. Solo ejecútalo aparte si deseas reponer datos ficticios determinísticos.

## Propiedades de la secuencia de comandos

En **Configuración del proyecto → Propiedades de la secuencia de comandos**:

| Propiedad | Valor de desarrollo | Secreto |
| --- | --- | --- |
| `TAZMANY_ENVIRONMENT` | `development` | No |
| `TAZMANY_LOGO_URL` | URL HTTPS del logo oficial; opcional si se conserva el valor público inicial | No |
| `TAZMANY_GOOGLE_CLIENT_ID` | Client ID web de Google | No |
| `TAZMANY_GOOGLE_VERIFY_MODE` | `TOKENINFO` solo en dev/staging | No |
| `TAZMANY_GOOGLE_VERIFY_URL` | URL HTTPS del relay para producción | No |
| `TAZMANY_GOOGLE_VERIFY_RELAY_SECRET` | secreto compartido del relay | Sí |
| `TAZMANY_AUTH_PEPPER` | generado por setup | Sí |
| `TAZMANY_SESSION_TTL_HOURS` | `168` | No |
| `TAZMANY_OTP_TTL_MINUTES` | `10` | No |
| `TAZMANY_OTP_MAX_ATTEMPTS` | `5` | No |
| `TAZMANY_TERMS_VERSION` | `2026-08-24` | No |
| `TAZMANY_PRIVACY_VERSION` | `2026-08-24` | No |

Los IDs de Spreadsheet y Drive son creados automáticamente. Nunca copies el pepper ni el secreto del relay al repositorio.

## Configurar Google Identity Services

1. En Google Cloud crea/configura la pantalla de consentimiento OAuth.
2. Crea una credencial **OAuth client ID → Web application**.
3. Añade los orígenes HTTPS que realmente sirven la Web App. Comienza con `https://script.google.com`; si Google reporta `unregistered_origin`, agrega también el origen exacto `https://…script.googleusercontent.com` mostrado por el navegador, sin ruta ni `/exec`.
4. Copia el Client ID en `TAZMANY_GOOGLE_CLIENT_ID`.
5. Mantén `TAZMANY_GOOGLE_VERIFY_MODE=TOKENINFO` únicamente en development/staging.

La identidad persistente usa el claim `sub`, no el correo. El backend valida audiencia, emisor, expiración, correo verificado y nonce. Cuentas Google con correo externo a Gmail/Workspace deben completar OTP adicional.

## Desplegar la Web App

Primera publicación:

1. En Apps Script abre **Implementar → Nueva implementación → Aplicación web**.
2. Ejecutar como: **propietario del proyecto**.
3. Para desarrollo, habilita solo las personas de prueba necesarias. Abre acceso general cuando el checklist de producción esté aprobado.
4. Prueba `.../exec?view=home`, inicia sesión y luego abre cliente/comercio desde el menú.

Actualizaciones posteriores:

```bash
clasp push
clasp version "Tazmany Fase 3 v0.3.0"
clasp deployments
clasp redeploy DEPLOYMENT_ID VERSION_NUMBER "Tazmany Fase 3 v0.3.0"
```

La guía ampliada está en [`docs/despliegue/GUIA_MACOS_CLASP_APPS_SCRIPT.md`](docs/despliegue/GUIA_MACOS_CLASP_APPS_SCRIPT.md).

## Idempotencia

Idempotencia significa que repetir la misma solicitud no duplica el efecto. Tazmany guarda un hash de una llave única y del contenido solicitado:

- dos clics para pedir OTP producen un solo desafío;
- repetir una verificación no crea varias sesiones;
- reenviar el guardado de perfil no duplica aceptaciones;
- repetir el alta del comercio, guardado de campaña, contrato o decisión de moderación no duplica el efecto;
- en fases futuras, un webhook repetido no podrá crear dos pagos o dos cupones.

Si la misma llave llega con datos diferentes, el backend la rechaza como conflicto.

## Verificación local

```bash
npm run lint
npm test
npm run build:preview
npm run verify
```

Abre `index.html` para revisar exactamente la vista que publica GitHub Pages. `dist/index.html` sigue disponible como artefacto local. La autenticación se prueba en la URL `/exec` de Apps Script.

## Seguridad relevante

- Solo se almacenan hashes de sesión, OTP, documento e idempotencia.
- Las hojas privadas y de auditoría reciben protección de advertencia y deben tener acceso humano mínimo.
- OTP vence en 10 minutos, permite 5 intentos y aplica límites temporales.
- RBAC se decide en backend; ocultar un botón nunca reemplaza la autorización.
- Las fechas se guardan en UTC y se muestran en `America/Lima`.
- Mercado Pago sigue fuera del código de esta fase. Se habilitará en la Fase 4 después de probar identidad, permisos e idempotencia en el ambiente de desarrollo.

## Progreso de fases

- Completadas: Fases 0, 1, 2 y 3.
- Siguiente: Fase 4 — Mercado Pago, órdenes, confirmación independiente y cupones.
- Restantes después de esta entrega: 6 fases, de la 4 a la 9.
