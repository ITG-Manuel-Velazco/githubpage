# Cómo editar tu portafolio

Ahora la página está dividida en 3 archivos:

- **`content.json`** → AQUÍ editas todo: textos, foto, experiencia, educación, habilidades, certificados, portafolio. Es el único archivo que necesitas tocar en el día a día.
- **`render.js`** → el "motor" que lee `content.json` y arma la página. No hace falta tocarlo.
- **`index.html`** → la estructura y el diseño (CSS). Tampoco hace falta tocarlo salvo que quieras cambiar el estilo visual.

## Editar contenido en GitHub (sin instalar nada)

1. Entra a tu repositorio en github.com.
2. Abre `content.json`.
3. Da clic en el ícono de lápiz (Edit this file).
4. Cambia el texto que quieras entre las comillas `" "` (respeta las comas y las llaves `{ }`).
5. Baja hasta el final de la página y da clic en **Commit changes**.
6. Espera 1-2 minutos: GitHub Pages actualiza sola la página en línea.

## Cambiar la foto

1. Sube tu nueva foto a la carpeta `assets/` con cualquier nombre (ej. `assets/foto2026.jpg`).
2. En `content.json`, dentro de `"perfil"`, cambia el valor de `"foto"` por esa ruta, ej: `"foto": "assets/foto2026.jpg"`.

## Agregar una nueva experiencia laboral

Dentro de `"experiencia"` (es una lista), copia un bloque como este y pégalo antes del `]` que cierra la lista, cambiando los datos:

```json
{
  "puesto": "Nuevo puesto",
  "organizacion": "Empresa · Ciudad",
  "inicio": "2026-01",
  "fin": "2026-06",
  "etiqueta_fecha": "ENE 2026 – JUN 2026 · 6 MESES",
  "bullets": [
    "Primera actividad realizada.",
    "Segunda actividad realizada."
  ]
}
```

No importa en qué orden lo pegues: la página siempre ordena las experiencias sola, de la más reciente a la más antigua, usando `"inicio"` (formato `AAAA-MM`).

## Agregar un nuevo estudio, certificado o proyecto

Mismo principio: son listas (`"educacion"`, `"certificados"`, `"portafolio"`) — copia un bloque `{ ... }` existente, cámbiale los datos y agrégalo a la lista.

## Probar los cambios en tu computadora antes de subirlos

El sitio carga `content.json` con `fetch()`. Si abres `index.html` con doble clic (protocolo `file://`), el navegador bloquea esa carga por seguridad — por eso `index.html` incluye una **copia de respaldo** de `content.json` pegada dentro de él mismo (busca `id="content-data"` cerca del final del archivo). Cuando `render.js` detecta que no puede usar `fetch()`, usa automáticamente esa copia, así que el doble clic **ya funciona sin errores**.

⚠️ Importante: esa copia es una "foto" del contenido en el momento en que se generó. Si editas `content.json` y solo abres `index.html` con doble clic, **verás la versión vieja**, porque estás viendo el respaldo, no el archivo editado. Para previsualizar tus cambios más recientes en tu computadora, usa alguna de estas opciones:

- **Opción fácil (VS Code):** instala la extensión "Live Server" y da clic en "Go Live".
- **Opción terminal (Python ya instalado):**
  ```
  python3 -m http.server 8000
  ```
  y abre `http://localhost:8000` en tu navegador.

En **GitHub Pages no hay este problema en absoluto**: ahí el sitio se sirve por `https://`, así que siempre lee `content.json` en vivo y tus ediciones se reflejan directo, sin necesidad de tocar la copia de respaldo.

## Consejo

Antes de guardar (`Commit changes`), puedes pegar el contenido completo de `content.json` en cualquier validador de JSON en línea para confirmar que no falta una coma o una llave. Un JSON mal formado hará que la página no cargue nada.
