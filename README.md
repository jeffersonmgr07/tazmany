# Tazmany Web App

Marketplace peruano de ofertas y cupones digitales. Esta primera entrega usa Google Apps Script como backend y servidor, Google Sheets como repositorio inicial, Google Drive para documentos y HTML/CSS/JavaScript para la interfaz.

## Estado de la entrega

Versión `0.1.2` — Fase 1 ejecutable con tema visual “Ahorro amarillo dominante + ámbar”.

- Portal público responsive con selector de ciudad, buscador, categorías, catálogo, detalle de oferta y comercios destacados.
- Dashboard demo de cliente con resumen, cupones y cashback.
- Dashboard demo de comercio con ventas, canjes, campañas y liquidación estimada.
- `setupTazmany()` crea 55 hojas, formatos, advertencias de protección, una carpeta de Drive y datos demo.
- El frontend consume el backend mediante `google.script.run`; nunca accede directamente a Sheets.
- La UI funciona con datos locales de respaldo si se abre `dist/preview.html`.
- El sistema visual usa amarillo `#F2B705` como superficie dominante del hero y para ahorro/acción, ámbar `#D77800` para promociones y navy `#182635` para confianza y contraste.
- El azul marino y coral originales se conservan exclusivamente en el logotipo oficial, sin recolorear la mascota.

No están habilitados todavía: autenticación, pagos, QR, canje, liquidaciones reales, notificaciones ni acciones administrativas. Los botones correspondientes informan el alcance sin alterar datos.

## Arquitectura

```text
Navegador responsive
  └─ HtmlService + parciales HTML
       └─ google.script.run
            └─ Servicios Apps Script
                 ├─ SheetRepository → Google Sheets
                 └─ DriveApp → Google Drive
```

GitHub es la fuente oficial. `clasp` sincroniza únicamente `src/` con un proyecto Apps Script independiente por ambiente.

## Estructura

```text
├── .github/workflows/       CI y despliegue manual
├── assets/brand/            instrucciones para el logo oficial
├── docs/                    arquitectura, bitácora, manuales y ADR
├── src/
│   ├── *.gs                 backend Apps Script
│   ├── index.html           documento principal HtmlService
│   ├── styles.html          sistema visual responsive
│   ├── app.html             portal público
│   ├── components.html      tarjetas y diálogos
│   ├── customer.html        dashboard cliente
│   ├── merchant.html        dashboard comercio
│   ├── admin.html           shell reservado
│   └── scripts.html         interacción del frontend
├── tests/unit/              pruebas con Node.js integrado
├── tools/                   validación y composición de preview
└── dist/preview.html        generado localmente, no se publica
```

## Preparación local

Requisitos: Git, Node.js 20 o superior, una cuenta Google y `clasp`.

```bash
npm install
npm run verify
npm install --global @google/clasp
clasp login
```

`Node.js` se usa solo para desarrollo, pruebas y despliegue. La Web App productiva no depende de un servidor Node.

## Crear el proyecto Apps Script

1. Crea un proyecto independiente en [script.google.com](https://script.google.com/).
2. Copia su Script ID desde **Configuración del proyecto**.
3. Duplica `.clasp.example.json` como `.clasp.json` y reemplaza el Script ID.
4. Ejecuta:

```bash
clasp push
clasp open
```

5. En el editor Apps Script, selecciona `setupTazmany` y pulsa **Ejecutar**.
6. Autoriza Sheets y Drive. La función devuelve la URL del Spreadsheet y guarda sus IDs en Script Properties.
7. Publica `assets/brand/tazmany-logo.png` en una ubicación controlada y agrega esa URL como `TAZMANY_LOGO_URL` en **Configuración del proyecto → Propiedades de la secuencia de comandos**. La copia incluida conserva el archivo original sin modificar.

Propiedades creadas o esperadas:

| Propiedad | Uso | Secreto |
| --- | --- | --- |
| `TAZMANY_SPREADSHEET_ID` | Spreadsheet maestro del ambiente | No, pero no se versiona |
| `TAZMANY_DRIVE_FOLDER_ID` | Carpeta documental | No, pero no se versiona |
| `TAZMANY_ENVIRONMENT` | `development`, `staging` o `production` | No |
| `TAZMANY_LOGO_URL` | Logo controlado opcional | No |
| `MERCADO_PAGO_ACCESS_TOKEN` | Se añadirá en Fase 4 | Sí |

## Desplegar la Web App

1. En Apps Script: **Implementar → Nueva implementación → Aplicación web**.
2. Ejecutar como: **tú, propietario del proyecto**.
3. Acceso para desarrollo: el grupo de pruebas definido por el equipo. Abre a público solo cuando autenticación, políticas y monitoreo estén listos.
4. Prueba las rutas:

```text
.../exec?view=home
.../exec?view=customer
.../exec?view=merchant
```

Para una actualización:

```bash
clasp push
clasp version "Fase 1 - ajuste controlado"
```

Publicar una nueva versión desde el panel de implementaciones conserva el deployment ID cuando se edita la implementación existente.

## Datos demo

`seedDemoData()` es idempotente y usa IDs determinísticos. Incluye dos clientes, cinco comercios, ocho campañas, dos cupones y una liquidación. No contiene contraseñas ni credenciales reales.

## Verificación

```bash
npm run lint
npm test
npm run build:preview
npm run verify
```

Abre `dist/preview.html` para revisar el diseño sin Apps Script. Esta vista usa datos de respaldo y no prueba integración con Sheets.

## Seguridad y límites

- No se guardan secretos en el repositorio ni en el frontend.
- Las APIs públicas devuelven DTOs limitados y mensajes de error no sensibles.
- La Fase 1 no ejecuta operaciones financieras ni canjes.
- Las fechas operativas se guardan en UTC y la visualización usa `America/Lima`.
- El dinero se modela como céntimos enteros.
- Las hojas financieras y de auditoría se marcan con advertencia de protección; los permisos de edición definitivos se configuran por ambiente.
- Google Sheets no es la base definitiva. Ver [criterios de migración](docs/arquitectura/ARQUITECTURA_FASE_1.md).

## Próximo paso recomendado

Fase 2: Google Identity Services, OTP, sesiones propias, perfil de cliente y RBAC backend. No conectar Mercado Pago hasta que identidad, permisos e idempotencia estén probados.
