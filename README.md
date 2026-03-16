# InfiFurag 2026

Aplicativo web para diligenciar el formulario FURAG 2025 (Formulario Único de Reporte de Avance de la Gestión) desarrollado para **Infivalle — Gobernación del Valle del Cauca**.

**URL:** https://soporte-infivalle.github.io/InfiFurag2026/  
**Repositorio:** https://github.com/soporte-infivalle/InfiFurag2026

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript vanilla (módulos IIFE) |
| Datos | JSON estático por módulo (19 módulos, 423 preguntas) |
| Backend | Google Apps Script (webhook REST) |
| Almacenamiento | Google Sheets |
| Hosting | GitHub Pages |
| Persistencia temporal | `localStorage` del navegador |
| Dashboard | Looker Studio (conectado al Google Sheet) |

---

## Estructura del proyecto

```
InfiFurag2026/
├── index.html              # Pantalla de inicio — selección de módulo
├── modulo.html             # Formulario por módulo
├── admin.html              # Panel de administración
├── config.js               # Configuración global
│
├── css/
│   ├── base.css
│   ├── index.css
│   ├── modulo.css
│   └── admin.css
│
├── js/
│   ├── shared.js           # Utilidades compartidas
│   ├── state.js            # Estado global y persistencia localStorage
│   ├── data.js             # Carga lazy de JSON con caché en memoria
│   ├── modules.js          # Pantalla de selección de módulos
│   ├── form.js             # Renderizado del formulario
│   ├── submit.js           # Envío de respuestas al webhook
│   ├── app.js              # Coordinador principal
│   └── admin.js            # Panel de administración
│
├── data/
│   ├── index.json          # Índice de módulos [{ modulo, total }]
│   ├── all.json            # Todas las preguntas en un archivo
│   ├── preguntas.xlsx      # Fuente Excel de las preguntas
│   └── modulos/
│       ├── PER.json
│       ├── PLA.json
│       └── ...             # 19 módulos en total
│
├── scripts/
│   └── xlsx_to_json.py     # Regenera los JSON desde el Excel
│
└── apps_script.gs          # Backend — Google Apps Script v6
```

---

## Configuración

Editar `config.js` antes de desplegar:

```javascript
const CONFIG = {
  WEBHOOK_URL:  '',                    // URL del Apps Script desplegado
  DATA_DIR:     '/InfiFurag2026/data', // Ruta base a los JSON
  VERSION:      '1',                   // Incrementar al actualizar JSONs
  ADMIN_PWD:    'furag2025',           // Contraseña del panel admin
};
```

---

## Módulos FURAG 2025

| Código | Nombre | Preguntas |
|--------|--------|-----------|
| PER | Percepción | 4 |
| PLA | Planeación | 6 |
| GTH | Gestión del Talento Humano | 28 |
| INT | Integridad | 13 |
| FOR | Fortalecimiento Organizacional | 19 |
| GDI | Gestión de la Información | 65 |
| SDI | Seguridad Digital | 22 |
| DJU | Defensa Jurídica | 28 |
| SEC | Servicio al Ciudadano | 18 |
| PCI | Participación Ciudadana | 16 |
| SYE | Seguimiento y Evaluación | 16 |
| TRA | Transparencia | 30 |
| GDO | Gestión Documental | 29 |
| GCI | Gestión Ciudadana | 24 |
| CIN | Control Interno | 35 |
| THI | Tecnologías de la Información | 27 |
| EMI | Emisiones y Medio Ambiente | 27 |
| FIN | Financiero | 1 |
| CCP | Control de Corrupción y Protección | 15 |
| **Total** | | **423** |

---

## Arquitectura

```
Navegador (GitHub Pages)
│
│  1. Boot → carga index.json (0.5 KB)
│  2. Abre módulo → carga MOD.json (~13 KB)
│  3. Respuestas se guardan en localStorage
│  4. Al enviar → POST al webhook
│
▼
Apps Script v6 (doPost)
│
│  5. Inserta filas en hoja "Respuestas"
│  6. Recalcula hoja "_progreso"
│  7. Actualiza columnas 2025 en "Comparativo Respuestas"
│
▼
Google Sheets
│
├── Respuestas              ← datos crudos
├── _progreso               ← % avance por módulo (oculta)
├── Respuestas 2024         ← histórico 2024
├── Similitud               ← similitud textual 2024↔2025
├── Preguntas 2025          ← base de preguntas con opciones
├── Comparativo Respuestas  ← marcadas vs posibles por año
└── Avance Preguntas        ← resumen global para Looker Studio
│
▼
Looker Studio (Dashboard)
│
└── Se actualiza en tiempo real con cada envío del formulario
```

---

## Apps Script — Endpoints

| Método | Parámetros | Descripción |
|--------|-----------|-------------|
| `POST` | — | Recibe respuestas, actualiza Sheet y Comparativo |
| `GET` | `?mod=XXX` | Progreso 2025 + respuestas del módulo + similitud |
| `GET` | `?año=2024&mod=XXX` | Respuestas históricas 2024 + similitud |

### Hojas requeridas en Google Sheets

| Hoja | Descripción |
|------|-------------|
| `Respuestas` | Datos crudos — una fila por pregunta respondida |
| `_progreso` | Resumen por módulo, oculta, actualización automática |
| `Respuestas 2024` | Histórico 2024 indexado por Código |
| `Similitud` | 5 cols: Cód.2025, Cód.2024, Pregunta 2024, Sim.Texto, Razón |
| `Preguntas 2025` | 423 preguntas con opciones (hasta 36 por pregunta) |
| `Comparativo Respuestas` | 479 filas — marcadas vs posibles, ambos años |
| `Avance Preguntas` | Resumen global para Looker Studio |

### Despliegue del Apps Script

1. Abrir el Google Sheet → **Extensiones → Apps Script**
2. Pegar el contenido de `apps_script.gs` → **Guardar**
3. **Implementar → Administrar implementaciones → Nueva versión → Implementar**
4. Permisos: ejecutar como **"Yo"** — acceso: **"Cualquier persona"**
5. Copiar la URL y pegarla en `CONFIG.WEBHOOK_URL`
6. Ejecutar `migrarColumnas()` una vez desde el editor

---

## Tipos de pregunta soportados

| Tipo | Control | Serialización |
|------|---------|---------------|
| Selección única | Radio button | String |
| Selección múltiple | Checkboxes | Array → `"A \| B \| C"` |
| Selección múltiple numérica | Checkboxes | Array → `"A \| B \| C"` |
| Abierta texto | Textarea | String |
| Abierta numérica | Input number | String |
| Matricial | Checkboxes (opciones únicas) | Array |

---

## Funcionalidad "Ver respuesta 2024"

Al abrir cualquier módulo se lanza en paralelo un `GET ?año=2024&mod=XXX`. Cuando responde, aparece un botón azul en cada tarjeta que al expandirse muestra:

- **Banda de similitud** — rojo ≥90%, amarillo 50–89%, gris <50%, con el texto de la pregunta 2024
- **Respuesta 2024** — pills para selección múltiple, itálica para abiertas
- **Evidencia 2024** — si existe

Si el webhook no está configurado o la hoja no existe, el botón simplemente no aparece.

---

## Actualizar preguntas

Si se modifica `data/preguntas.xlsx`:

```bash
cd scripts
python xlsx_to_json.py
```

Luego incrementar `VERSION` en `config.js` y hacer commit. GitHub Pages se actualiza automáticamente.

---

## Panel de administración

Acceso desde el ícono ⚙️ con la contraseña de `CONFIG.ADMIN_PWD`.

- Ver % de avance de todos los módulos en tiempo real
- Actualizar la URL del webhook sin redesplegar
- Borrar respuestas de un módulo del `localStorage`
- Borrar todas las respuestas del dispositivo

---

## Scripts de análisis (independientes)

| Archivo | Descripción |
|---------|-------------|
| `conteo_opciones.gs` | Genera hojas `Conteo 2025` y `Conteo 2024` con `Módulo \| Código \| Tipo \| Num_Opciones` |
| `comparativo_respuestas.gs` | Genera la hoja `Comparativo Respuestas` cruzando preguntas y respuestas de ambos años |

Pegar en el Sheet de análisis y ejecutar `generarConteos()` o `generarComparativo()`.

---

## Dashboard Looker Studio

Conectado directamente al Google Sheet. Se actualiza automáticamente con cada envío del formulario (latencia ~1 min).

**Fuentes conectadas:** `_progreso`, `Avance Preguntas`, `Resumen Comparativo`, `Comparativo Respuestas`, `Similitud`, `Respuestas`

**Páginas del dashboard:**
- Página 1 — Avance general, responsables, avance por módulo, comparativo 2024 vs 2025
- Página 2 — Análisis por tipo de pregunta y similitud entre vigencias
- Página 3 — Detalle de respuestas por responsable y módulo

---

*Infivalle — Gobernación del Valle del Cauca · FURAG 2025 · v6*