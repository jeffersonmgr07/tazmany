# Changelog

## 0.4.0 — 2026-08-29

- Se inició la Fase 4 con órdenes idempotentes y reservas de inventario de 10 minutos, sin habilitar cobros.
- Se corrigió el formateo monetario: los valores almacenados en céntimos se dividen entre 100 antes de presentarse en soles.
- Las tarjetas muestran primero el precio Club con 3 % de cashback y luego el precio público con 1 %.
- Se incorporó una pieza promocional para Club Tazmany: S/ 4.90 el primer mes y S/ 9.90 desde el segundo.
- Se añadió favicon del isotipo, viewport responsive y ajustes específicos para móvil, tablet y escritorio.
- El acceso con Google bloquea solicitudes repetidas y mantiene visible el modal de actividad mientras termina la autenticación.
- El catálogo público usa caché segura en el navegador y el panel del cliente añade precarga y caché breve para reducir esperas.
- Se añadieron `OrderService.gs`, `Phase4Setup.gs`, rutas explícitas del gateway y acciones permitidas en el relay.
- Mercado Pago, cupones, cobro del Club y acreditación de cashback permanecen desactivados.

## 0.3.15 — 2026-08-29

- Se añadió un modal de carga con indicador circular para Google, OTP, carga y guardado del perfil.
- El selector internacional de WhatsApp se hizo compacto y muestra bandera más código de llamada.
- Club Tazmany cambió a S/ 4.90 el primer mes y S/ 9.90 mensuales desde el segundo.
- Se incorporó `setupTazmanyPhase315()` para actualizar `CLUB_PLANS`, limpiar la caché pública y validar la configuración.
- La Fase 3 permanece cerrada y los cobros continúan desactivados.

## 0.3.14 — 2026-08-29

- Se cerró técnicamente la Fase 3 después de conectar dominio, GitHub, Cloudflare, Apps Script, Google Identity y OTP.
- Google completa nombres y apellidos vacíos a partir de `given_name` y `family_name`, sin sobrescribir un perfil existente.
- El formulario reemplazó “Celular peruano” por un WhatsApp internacional con Perú `+51` predeterminado.
- Se añadieron más de 240 países y territorios con sus códigos de llamada.
- Los números se guardan en formato E.164 y el país queda registrado en `CUSTOMER_PRIVATE_DATA.phone_country_iso`.
- Se añadió la migración y el diagnóstico `setupTazmanyPhase314()`.
- Mercado Pago, órdenes y cupones siguen desactivados hasta la Fase 4.

## 0.3.13 — 2026-08-29

- El relay de Cloudflare ahora publica al `/exec` de Apps Script sin añadir la ruta reservada `/api`.
- Apps Script acepta las solicitudes autenticadas del relay en la raíz de la Web App.
- Se corrigió el carácter de la URL activa de Apps Script (`K5TlZe`, con `l` minúscula).
- Se añadió una prueba automática que impide volver a publicar contra `/exec/api`.

## 0.3.12 — 2026-08-27

- `tazmany.com` queda como única interfaz web: Apps Script conserva el API y redirige su acceso visual al dominio oficial.
- El build de GitHub exige una URL HTTPS de relay y las validaciones ya no pueden reemplazar el index conectado por una vista desconectada.
- El modal de acceso incorpora el isotipo oficial y el wordmark con `ny` amarillo/ámbar.
- Se añadió `setupTazmanyPhase312()` para limpiar la caché pública y comprobar Google, orígenes y secreto del relay.
- Se mantuvieron pagos, Club facturado y canjes desactivados.

## 0.3.11 — 2026-08-27

- Se estableció `https://tazmany.com` como dominio canónico del portal, la política de privacidad, los términos y el logo oficial.
- Se añadió el archivo `CNAME` para conservar el dominio personalizado en GitHub Pages.
- Apps Script y Cloudflare permiten el dominio principal, `www` y temporalmente el origen técnico de GitHub.
- Las pruebas bloquean la reaparición de enlaces legales visibles con el dominio anterior.
- Se mantuvieron `staging`, `TOKENINFO` y todos los cobros desactivados.

## 0.3.10 — 2026-08-27

- Se publicaron páginas independientes de Política de Privacidad y Términos y condiciones para el cierre de Google Identity en staging.
- La política describe los datos básicos recibidos de Google, finalidades, proveedores tecnológicos, comunicaciones y derechos ARCO.
- El correo público provisional de soporte y privacidad es `tazmani.store@gmail.com`.
- Los enlaces legales, de devoluciones, ayuda y derechos ARCO del portal dejaron de ser marcadores vacíos.
- Se mantuvieron bloqueados los pagos y la facturación del Club; no se modificó el esquema de Google Sheets.

## 0.3.9 — 2026-08-27

- Se retiraron de la interfaz pública los avisos de demo, desarrollo, fases, Sheets, backend, GitHub Pages y relay.
- Se eliminó temporalmente el bloque público de captación de comercios y el acceso directo a Comercio de la navegación móvil.
- Los dashboards conservan sus funciones, pero ahora muestran textos orientados a usuarios en lugar de notas del desarrollo.
- La vista pública desconectada dejó de simular una suscripción exitosa.
- Se incorporó `getTazmanyPhase39Diagnostics()` como compuerta final antes de iniciar la Fase 4.
- Se añadieron pruebas automáticas para bloquear textos internos y mantener pagos y facturación del Club desactivados.
- El relay y la configuración de despliegue se actualizaron a la versión 0.3.9.

## 0.3.8 — 2026-08-27

- Se incorporó sin modificaciones el último logotipo oficial transparente de Tazmany, con isotipo circular a la izquierda y logotipo a la derecha, sin eslogan.
- Se actualizó el hash de integridad del activo oficial.
- Se añadió versionado de caché a la URL del logo para que GitHub Pages y Apps Script muestren inmediatamente la nueva identidad.
- Se mantuvo intacto el alcance funcional de la Fase 3.7: esta actualización no habilita pagos, cupones ni canjes.

## 0.3.7 — 2026-08-25

- Se corrigió la detección de entorno: una Web App servida por Apps Script ya no se marca como vista previa estática.
- El formulario de suscripción vuelve a ejecutar `apiSubscribeToOffers` mediante `google.script.run` y persiste en `MARKETING_SUBSCRIBERS`.
- Se reintrodujo `FrontendBridgeSetup.gs` en la entrega incremental para evitar instalaciones incompletas entre 0.3.5 y 0.3.6.
- Los diagnósticos de Fase 3.6 y del puente ahora escriben el resultado completo en el registro de ejecución.
- Se añadió `getTazmanyPrePaymentReadinessDiagnostics()` como puerta de seguridad previa a Mercado Pago.

## 0.3.6 — 2026-08-25

- Selector accesible de país y ciudad para visitantes sin cuenta.
- Sugerencia geográfica voluntaria y confirmada; no se cambia la ciudad silenciosamente.
- Suscripción gratuita por correo con consentimiento, idempotencia y auditoría.
- Nuevas entidades `COUNTRIES`, `MARKETING_SUBSCRIBERS`, `MARKETING_EVENTS`, `CLUB_PLANS` y `CLUB_MEMBERSHIPS`.
- Precios público y Club en campañas, opciones, catálogo, tarjetas y detalle.
- Club Tazmany visible en modo `COMING_SOON`, sin cobros ni Mercado Pago.
- Categorías móviles refinadas con iconos SVG propios y estilo Tazmany.
- Nuevo setup incremental `setupTazmanyPhase36()` y diagnóstico asociado.

## 0.3.5 — 2026-08-24

- Se añadió un gateway explícito para comunicar GitHub Pages con Apps Script sin exponer Sheets.
- Se incorporó un relay Cloudflare Worker con CORS de origen exacto, allowlist de acciones y secreto compartido almacenado fuera del repositorio.
- El cliente web ahora selecciona `google.script.run` o el transporte HTTPS remoto según el ambiente.
- Se añadieron diagnóstico del puente, configuración de orígenes y pruebas automatizadas del relay.
- Se documentó que los nueve usuarios seed son registros ficticios y no credenciales OTP utilizables.
- Mercado Pago continúa bloqueado hasta aprobar identidad, RBAC e idempotencia desde GitHub Pages.

## 0.3.0 — 2026-08-24

- Se añadió el scope `script.scriptapp` requerido para instalar y consultar triggers desde `installTazmanyAuthTriggers()`.
- Se incorporó el logotipo oficial transparente y se aumentó su presencia en el encabezado y footer.
- Se sustituyeron los emojis de categorías por un sistema SVG original y reutilizable.
- Se implementó onboarding de comercios con estados, validación, sucursales, documentos y cuenta enmascarada.
- Se implementaron contratos PDF versionados en Drive con hash y aceptación operativa auditable.
- Se implementó creación, envío, versionado y moderación de campañas con RBAC e idempotencia.
- Se añadió el panel administrativo de moderación y datos demo pendientes de revisión.
- Se amplió el esquema a 60 hojas y se añadió `setupTazmanyPhase3()`.

## 0.2.1 — 2026-08-24

- Se añadió un `index.html` estático real en la raíz para GitHub Pages.
- Se cambió la guía visual a **Deploy from a branch → main → /(root)**.
- El generador produce el index raíz y mantiene el artefacto local de `dist/`.
- Se incorporó la validación del index compilado y de la ruta del logotipo existente.
- Se adoptó el formato de entregas incrementales con solo archivos nuevos o modificados.

## 0.2.0 — 2026-08-24

- Se implementó Google Identity Services con nonce y validación servidor-a-servidor para desarrollo/staging.
- Se implementó OTP real por correo con hash, caducidad, límite de intentos y rate limit.
- Se añadieron sesiones propias con token opaco, hash persistido, revocación y limpieza lógica.
- Se añadió RBAC backend para dashboards de cliente y comercio.
- Se añadió perfil de cliente, datos privados protegidos, ciudades y aceptaciones versionadas.
- Se creó el servicio de idempotencia y se aplicó a identidad y perfil.
- Se añadió un workflow de GitHub Pages para publicar el index visual compuesto.
- Se documentó el flujo completo de macOS, clasp, setup, diagnóstico y despliegue.

## 0.1.2 — 2026-08-24

- Se corrigió la aplicación visual del tema para que el amarillo sea realmente dominante.
- El hero dejó el fondo crema/coral y ahora usa amarillo, amarillo claro y ámbar.
- El CTA principal del hero usa navy para obtener contraste sobre el fondo amarillo.
- Las categorías activas y la suscripción adoptaron el nuevo sistema amarillo/navy.
- Se añadió una vista previa versionada para evitar que el navegador reutilice el preview anterior en caché.
- El logotipo anterior permanece temporalmente sin alterar mientras se prepara su nueva versión en un flujo separado.

## 0.1.1 — 2026-08-24

- Se adoptó la dirección visual “Ahorro amarillo + ámbar”.
- Se aplicó la nueva paleta al index y a los dashboards de cliente y comercio.
- Se separaron los colores funcionales de la interfaz de los colores inmutables del logotipo oficial.
- Se reforzó el contraste de CTA, descuentos, navegación, estados y foco visible.
- Se actualizó el encabezado visual de las hojas creadas por `setupTazmany()`.
- Se añadió una prueba automatizada para proteger los tokens del tema y los colores del wordmark.

## 0.1.0 — 2026-08-24

- Se creó la fundación Apps Script + Google Sheets de Tazmany.
- Se añadió `setupTazmany()` idempotente y datos demo de Lima.
- Se implementó el portal público responsive con catálogo y detalle de oferta.
- Se implementaron dashboards demo de cliente y comercio.
- Se añadió validación local, pruebas de dinero/comisiones y vista previa estática.
- Se inició la documentación técnica, manuales y capacitación por rol.
