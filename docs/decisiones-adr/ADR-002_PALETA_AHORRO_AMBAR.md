# ADR-002 — Paleta “Ahorro amarillo + ámbar”

**Estado:** aceptada y ajustada en 0.1.2  
**Fecha:** 2026-08-24  
**Alcance:** interfaz del portal público y dashboards de Tazmany.

## Contexto

La paleta inicial navy/coral era coherente con el logotipo, pero comunicaba una energía más intensa que hogareña. Se compararon direcciones visuales claramente distintas y se seleccionó la opción 4 por su capacidad para expresar ahorro, cercanía y optimismo.

## Decisión

La interfaz utilizará:

| Función | Color |
| --- | --- |
| Acción y ahorro | Amarillo `#F2B705` |
| Promoción | Ámbar `#D77800` |
| Texto ámbar accesible | Ámbar oscuro `#914900` |
| Confianza y navegación | Navy `#182635` |
| Estructura profunda | Navy profundo `#0F1C29` |
| Fondo cálido | Crema `#FFF7D6` |
| Descuentos fuertes | Grafito `#2A2D31` o navy profundo |

Los botones amarillos usan texto navy. Los descuentos pueden usar fondo navy con texto amarillo. El ámbar puro no se usa como texto pequeño sobre blanco; se utiliza `#914900` para asegurar contraste.

La revisión 0.1.2 establece que el amarillo no será solo un acento: dominará el hero y algunas franjas de conversión. El crema queda reservado para superficies secundarias y ya no define la primera impresión del index.

## Identidad oficial

El logotipo oficial incorporado en 0.3.0 no se recolorea. “Tazma” usa navy, “ny” usa ámbar y la mascota mantiene sus colores originales. El fallback textual usa `#0A264E` y `#F2A000`; sus tokens permanecen separados de los tokens funcionales de la interfaz.

## Consecuencias

- La plataforma comunica ahorro con mayor rapidez.
- El navy mantiene confianza en pagos, cupones y liquidaciones.
- El crema aporta una sensación más cálida sin perder limpieza.
- Un cambio futuro de tema podrá realizarse mediante tokens sin modificar componentes ni lógica.
