# Entrega incremental Tazmany 0.3.11

Actualización de dominio oficial y Google Identity sobre la versión 0.3.10. No crea hojas, no requiere setups y no habilita pagos.

## Resultado

- Dominio canónico: `https://tazmany.com`.
- Privacidad: `https://tazmany.com/privacidad.html`.
- Términos: `https://tazmany.com/terminos.html`.
- Contacto: `tazmani.store@gmail.com`.
- Orígenes temporales permitidos: dominio principal, `www` y GitHub técnico.
- Google Identity permanece en staging.

## Instalación

```bash
cd ~/Downloads/tazmany
unzip -o ~/Downloads/Tazmany_Dominio_Google_v0.3.11_INCREMENTAL.zip -d .
npm run verify
clasp push
```

Actualiza la implementación existente de Apps Script como una nueva versión `Tazmany dominio oficial 0.3.11`. No ejecutes funciones setup.

## Propiedad obligatoria de Apps Script

```text
TAZMANY_ALLOWED_FRONTEND_ORIGINS = https://tazmany.com,https://www.tazmany.com,https://jeffersonmgr07.github.io
```

## Google Auth Platform

```text
Página principal = https://tazmany.com/
Política de Privacidad = https://tazmany.com/privacidad.html
Términos del servicio = https://tazmany.com/terminos.html
Dominio autorizado = tazmany.com
```

El cliente OAuth Web debe autorizar `https://tazmany.com` y `https://www.tazmany.com`. Mantén la aplicación en `Prueba`.
