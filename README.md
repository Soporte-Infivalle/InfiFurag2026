# FURAG 2025 — Formulario de Respuestas

App web para responder las preguntas del FURAG 2025 por módulo. Las respuestas se guardan automáticamente en Google Sheets y se pueden visualizar en Looker Studio.

## Estructura del repositorio

```
├── index.html          ← App principal
├── config.js           ← URLs de configuración (editar antes de desplegar)
├── .gitignore
├── README.md
└── data/
    └── preguntas.xlsx  ← Archivo de preguntas (solo hoja "Preguntas")
```

---

## Paso 1 — Clonar y configurar localmente

```bash
git clone https://github.com/TU_USUARIO/furag-2025.git
cd furag-2025
```

Abre `config.js` y completa los dos valores:

```js
const CONFIG = {
  WEBHOOK_URL: 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec',
  DATA_FILE:   'data/preguntas.xlsx',
  SHEET_NAME:  'Preguntas',
};
```

---

## Paso 2 — Actualizar preguntas (cuando cambien)

Simplemente reemplaza el archivo `data/preguntas.xlsx` con la versión nueva.  
La app lo lee automáticamente — no hay que cambiar código.

**Requisitos del archivo:**
- Una hoja llamada exactamente `Preguntas`
- Columnas: `ID`, `Código`, `Pregunta 2025`, `Tipo de pregunta`, `Opción 1` … `Opción 15`

---

## Paso 3 — Crear el webhook en Google Apps Script

1. Crea un **Google Sheet nuevo** (llámalo por ejemplo "FURAG 2025 - Respuestas")
2. Ve a **Extensiones → Apps Script**
3. Borra el contenido y pega este código:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Crear encabezados si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Nombre', 'Entidad', 'Módulo',
        'ID Pregunta', 'Código', 'Pregunta', 'Tipo', 'Respuesta'
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    }

    data.rows.forEach(row => {
      sheet.appendRow([
        row.timestamp,
        row.nombre,
        row.entidad,
        row.modulo,
        row.id_pregunta,
        row.codigo,
        row.pregunta,
        row.tipo,
        row.respuesta
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', rows: data.rows.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Guardar** → **Desplegar → Nueva implementación**
5. Tipo: **Aplicación web**
6. Ejecutar como: **Yo**
7. Quién tiene acceso: **Cualquier usuario**
8. Click **Desplegar** → copia la URL
9. Pega esa URL en `config.js` como `WEBHOOK_URL`

---

## Paso 4 — Desplegar en GitHub Pages

```bash
# Primera vez
git add .
git commit -m "Initial deploy"
git push origin main

# Activar GitHub Pages:
# Settings → Pages → Source: Deploy from branch → main → / (root) → Save
```

Tu app quedará en: `https://TU_USUARIO.github.io/furag-2025`

**Para actualizar** (cambio de preguntas o config):
```bash
git add .
git commit -m "Actualizar preguntas / config"
git push origin main
```
GitHub Pages se actualiza automáticamente en ~1 minuto.

---

## Paso 5 — Conectar a Looker Studio

1. En Looker Studio → **Añadir datos → Google Sheets**
2. Selecciona el Sheet "FURAG 2025 - Respuestas"
3. Listo — ya puedes crear gráficas de progreso, respuestas por módulo, etc.

---

## Estructura de datos en Google Sheets

| Timestamp | Nombre | Entidad | Módulo | ID Pregunta | Código | Pregunta | Tipo | Respuesta |
|---|---|---|---|---|---|---|---|---|
| 2025-03-10T... | María García | Min. Salud | PLA | 5 | PLA200 | En el direccionamiento… | Selección múltiple | Opción A \| Opción C |

---

## Preguntas frecuentes

**¿Las respuestas se pierden si cierro el navegador antes de enviar?**  
No. La app guarda automáticamente en el navegador (localStorage) mientras escribes. Al abrir de nuevo, el progreso se restaura.

**¿Puedo responder el mismo módulo varias veces?**  
Sí. Cada envío agrega nuevas filas al Sheet — se puede identificar por Timestamp y Nombre quién respondió qué.

**¿Cómo actualizo las preguntas?**  
Reemplaza `data/preguntas.xlsx` y haz `git push`. La app lee el archivo en cada carga.
