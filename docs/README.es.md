# MinimalGPT

> [!WARNING]
> **Proyecto descontinuado — necesita una actualización.** Según el autor, la versión 0.0.3 funcionaba anteriormente, pero falló al volver a probarla. La versión 0.0.4 es una revisión de seguridad para preservar el proyecto, **no una actualización de compatibilidad verificada**. La compatibilidad con la interfaz actual de ChatGPT **no se ha verificado**. Este repositorio ofrece código de referencia, no una extensión lista para usar ni con soporte activo.

[English](../README.md) · [Português (Brasil)](README.pt-BR.md) · **Español**

MinimalGPT es una extensión experimental para Chromium (Manifest V3) que reduce el desorden visual de ChatGPT sin sustituir la aplicación original. Está diseñada para **una conversación por pestaña del navegador**.

## Estado del proyecto

**Descontinuado / sin mantenimiento.** El último funcionamiento conocido es el uso anterior de la versión 0.0.3 que comunicó el autor; se desconocen la causa y el alcance del fallo posterior. El autor informó después de que la versión 0.0.4 no ocultaba la mayoría de los controles previstos. La interfaz de ChatGPT cambia independientemente de esta extensión, por lo que los selectores pueden dejar de corresponderse con los elementos de la página. La versión 0.0.4 es una **revisión de seguridad para preservar el proyecto**, no una versión de compatibilidad verificada: reduce el riesgo de ocultar controles ajenos y deja el modo desactivado por defecto en las instalaciones nuevas. No se garantizan actualizaciones, compatibilidad ni soporte. El proyecto no declara ninguna afiliación oficial con OpenAI ni con ChatGPT.

Si faltan controles en la página o la interfaz se ve dañada, desactiva MinimalGPT con `Alt+M` y vuelve a cargar la pestaña de ChatGPT. Si el atajo no funciona, desactiva o elimina la extensión en `chrome://extensions/` y vuelve a cargar la página. No dependas de este proyecto para tareas críticas.

## Comportamiento previsto

Cuando se activa manualmente, el perfil basado principalmente en CSS intenta ocultar los elementos identificables de la barra lateral y la barra superior, los controles para compartir, algunos controles de voz y dictado y determinadas acciones de las respuestas. Pretende conservar el cuadro de escritura, los archivos adjuntos, el envío y la copia de mensajes. También reduce las sombras decorativas del cuadro de escritura y ajusta el ancho de lectura cuando reconoce los elementos. El resultado depende del DOM y del idioma actuales de ChatGPT. Algunos controles pueden seguir visibles si cambian sus identificadores; es preferible a ocultar funciones no relacionadas.

MinimalGPT no intercepta solicitudes de red, no accede a credenciales de la cuenta, no carga código remoto ni instala observadores del DOM. Solo solicita el permiso `storage` de Chromium. La extensión se ejecuta únicamente en `https://chatgpt.com/*` y almacena localmente una preferencia de activación/desactivación. Revisa los archivos de código antes de instalar una extensión sin mantenimiento.

## Archivos

- `manifest.json` — configuración de la extensión, idioma predeterminado y permisos.
- `_locales/en/messages.json` — nombre, descripción y mensajes de estado en inglés.
- `_locales/pt_BR/messages.json` — nombre, descripción y mensajes de estado en portugués de Brasil.
- `_locales/es/messages.json` — nombre, descripción y mensajes de estado en español.
- `docs/README.pt-BR.md` — documentación completa en portugués de Brasil.
- `docs/README.es.md` — esta documentación en español.
- `minimal.css` — reglas visuales opcionales; la localización no modifica este archivo.
- `content.js` — preferencia local, atajo `Alt+M` y aviso de estado traducido.
- `tests/` — pruebas básicas estáticas y del script, sin dependencias externas; no verifican la compatibilidad en un navegador real.
- `.github/workflows/smoke.yml` — ejecución automática de las pruebas tras los cambios y en las solicitudes de incorporación.

## Idiomas

El inglés (`en`) es el idioma predeterminado; también están disponibles el portugués de Brasil (`pt_BR`) y el español (`es`). Chromium selecciona una traducción disponible según el idioma del navegador y utiliza el inglés como alternativa cuando no hay una traducción correspondiente. El ruso (`ru`) y el chino simplificado (`zh_CN`) están previstos, pero todavía no están disponibles.

**El idioma del navegador puede ser distinto del idioma de ChatGPT.** Traducir los mensajes de MinimalGPT no modifica los selectores CSS que identifican los controles del sitio ni corrige la incompatibilidad comunicada. Esta etapa no altera el comportamiento de la extensión.

## Instalación local para inspección (bajo tu responsabilidad)

1. Descarga o clona el repositorio y examina su contenido.
2. En Chromium, abre `chrome://extensions/`, activa el **Modo de desarrollador** y selecciona **Cargar descomprimida** (el texto exacto puede variar según el navegador).
3. Selecciona la carpeta que contiene `manifest.json`.
4. Vuelve a cargar `https://chatgpt.com/`. Una instalación nueva comienza con el modo **DESACTIVADO** por seguridad; pulsa `Alt+M` para activarlo.
5. Después de actualizar los archivos, vuelve a cargar la extensión desde `chrome://extensions/` y luego la pestaña de ChatGPT.

La preferencia local se conserva al volver a cargar. Las instalaciones que ya hayan guardado el modo activado permanecen activadas hasta que se desactiven expresamente. El navegador o el sitio pueden utilizar también `Alt+M`; si no funciona, desactiva la extensión en la página de extensiones de Chromium.

## Pruebas y limitaciones

Con Node.js 22, ejecuta `node --test tests/*.test.cjs`. Las pruebas comprueban el manifiesto, las claves de traducción, las precauciones estáticas del CSS y el comportamiento simulado del atajo y el almacenamiento. **No verifican la interfaz actual de ChatGPT, la accesibilidad ni el funcionamiento de extremo a extremo.** Es necesario probar manualmente la extensión en un navegador antes de afirmar que una versión es compatible.

Limitaciones conocidas: la extensión depende de atributos privados y no documentados del DOM de ChatGPT; las funciones, los idiomas y las disposiciones de la interfaz pueden variar; no incluye detección automática de incompatibilidades ni autorreparación. Evita añadir reglas generales que oculten todos los elementos `header`, todos los botones excepto Copiar o cualquier elemento cuyo identificador contenga `audio`.

## Historial de versiones

- **0.0.4 (2026-09-22):** revisión de seguridad para preservar el proyecto: avisos de descontinuación, modo desactivado por defecto en instalaciones nuevas, selectores CSS conservadores y pruebas básicas. **La compatibilidad con el ChatGPT actual no se ha verificado.** El autor informó después de que la mayoría de los cambios visuales previstos no funcionaba. Se revirtió una modificación no solicitada de los selectores, identificada como 0.0.5; el código de la 0.0.4 es la base de la localización.
- **0.0.3 (2026-08-27):** actualización de selectores para voz, dictado y acciones de respuesta; última versión que el autor declara haber utilizado correctamente antes de comunicar un fallo posterior.
- **0.0.2:** perfil con menos elementos visuales para una conversación por pestaña y reducción del movimiento.
- **0.0.1:** extensión inicial Manifest V3, atajo `Alt+M` y persistencia local.

Este repositorio no concede ninguna licencia de código abierto. El hecho de que sea público no autoriza, por sí solo, la redistribución ni la modificación del código. El autor puede elegir una licencia por separado.
