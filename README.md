# Tazmany Web App

Marketplace peruano de ofertas y cupones digitales construido con GitHub, Google Apps Script, Google Sheets, Google Drive y HTML/CSS/JavaScript.

## Estado

Versión `0.3.5` — Fase 3.5: publicación del frontend desde GitHub Pages mediante un relay seguro hacia Apps Script. Mercado Pago continúa bloqueado.

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
- Gateway de acciones con lista permitida, validación de origen y secreto compartido entre relay y Apps Script.
- Cliente web capaz de usar `google.script.run` dentro de Apps Script o la API remota cuando GitHub Pages tiene configurado el relay.

### Visual o simulado

- GitHub Pages permanece como vista visual mientras `TAZMANY_API_BASE_URL` esté vacío. Después de desplegar y configurar el relay, se convierte en la interfaz conectada sin alojar secretos.
- Datos de órdenes, cupones, cashback y liquidaciones siguen siendo ficticios.

### Pendiente o bloqueado

- La verificación de Google mediante `tokeninfo` está permitida solo en desarrollo/staging. Producción exige configurar un relay que valide criptográficamente el ID token con una biblioteca oficial de Google.
- El celular se registra, pero queda `phoneVerified: false` hasta integrar un proveedor SMS.
- Mercado Pago, compras, QR, canjes y operaciones financieras permanecen desactivados.
- El relay debe desplegarse y superar las pruebas de OTP, sesiones, RBAC e idempotencia antes de iniciar la Fase 4.

## Arquitectura

```text
GitHub (fuente oficial)
  ├─ GitHub Pages → index.html público
  │                  └─ HTTPS → relay con CORS/origen/secreto
  │                               └─ POST /exec/api
  └─ clasp → src/ → proyecto Apps Script independiente
                    ├─ HtmlService
                    ├─ google.script.run
                    ├─ gateway de API para el relay
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
│   ├── FrontendApiGateway.gs
│   ├── FrontendBridgeSetup.gs
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
├── worker/tazmany-api-relay.js
├── wrangler.toml
└── dist/                  generado; no versionado
```

## Vista visual en GitHub Pages

1. Sube `index.html` a la raíz del repositorio, al mismo nivel que `README.md`.
2. Abre **Settings → Pages**.
3. En **Build and deployment → Source**, elige **Deploy from a branch**.
4. Selecciona la rama **main** y la carpeta **/(root)**; luego pulsa **Save**.
5. Espera la publicación y abre la URL mostrada por GitHub Pages.

El `index.html` raíz contiene los parciales compilados y usa el logotipo de `assets/brand/tazmany-logo.png`. Sin una URL de relay continúa como vista demo. Para convertirlo en la interfaz conectada sigue [`docs/despliegue/GUIA_GITHUB_RELAY_APPS_SCRIPT.md`](docs/despliegue/GUIA_GITHUB_RELAY_APPS_SCRIPT.md).

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
7. `setupTazmanyFrontendBridge()` — registra el origen inicial de GitHub Pages y verifica la configuración del puente.
8. `getTazmanyFrontendBridgeDiagnostics()` — comprueba que el secreto y los orígenes estén configurados sin revelar el secreto.

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
| `TAZMANY_API_RELAY_SECRET` | secreto aleatorio de 64 caracteres compartido exclusivamente con el Worker | Sí |
| `TAZMANY_ALLOWED_FRONTEND_ORIGINS` | `https://jeffersonmgr07.github.io` durante desarrollo | No |
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
3. Añade los orígenes HTTPS que realmente sirven la interfaz. Para GitHub Pages agrega `https://jeffersonmgr07.github.io`, sin `/tazmany/`. Conserva los orígenes de Apps Script únicamente mientras pruebes también la Web App `/exec`.
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
clasp version "Tazmany Fase 3.5 v0.3.5"
clasp deployments
clasp redeploy DEPLOYMENT_ID VERSION_NUMBER "Tazmany Fase 3.5 v0.3.5"
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

Abre `index.html` para revisar la vista de GitHub Pages. Sin `TAZMANY_API_BASE_URL` funciona como demo. Con el relay configurado, OTP, sesiones y paneles se prueban desde GitHub Pages sin el aviso visual de Apps Script.

## Seguridad relevante

- Solo se almacenan hashes de sesión, OTP, documento e idempotencia.
- Las hojas privadas y de auditoría reciben protección de advertencia y deben tener acceso humano mínimo.
- OTP vence en 10 minutos, permite 5 intentos y aplica límites temporales.
- RBAC se decide en backend; ocultar un botón nunca reemplaza la autorización.
- Las fechas se guardan en UTC y se muestran en `America/Lima`.
- Mercado Pago sigue fuera del código de esta fase. Se habilitará en la Fase 4 después de probar identidad, permisos e idempotencia en el ambiente de desarrollo.

## Progreso de fases

- Completadas: Fases 0, 1, 2 y 3; además, incremento técnico 3.5 para publicación desde GitHub Pages.
- Siguiente: Fase 4 — Mercado Pago, órdenes, confirmación independiente y cupones.
- Restantes después de esta entrega: 6 fases, de la 4 a la 9.

## Usuarios y operaciones demo

`setupTazmany()` llama automáticamente a `seedDemoData()` y crea nueve registros ficticios en `USERS`:

- 1 superadministrador, 1 administrador, 1 finanzas, 1 soporte y 1 moderador;
- 2 clientes;
- 2 propietarios de comercio.

También crea seis comercios, campañas en diferentes estados, cuatro órdenes, cuatro pagos y cuatro cupones de demostración. Los correos `@demo.tazmany.pe` son registros de interfaz y no reciben OTP. Para probar un acceso real utiliza un correo propio: el primer OTP o ingreso Google crea una cuenta cliente real; los roles administrativos o comerciales deben asignarse de forma controlada en desarrollo.
