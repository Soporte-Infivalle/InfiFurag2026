// ══════════════════════════════════════════════════════
//  DATA — Carga preguntas desde JSON (más rápido que xlsx)
//  Para actualizar preguntas: reemplaza data/preguntas.json
//  Puedes regenerarlo con: scripts/xlsx_to_json.py
// ══════════════════════════════════════════════════════

const DataLoader = (() => {
  return {
    async load(filePath) {
      // Reemplazar extensión si alguien pone el .xlsx por costumbre
      const jsonPath = filePath.replace(/\.xlsx$/i, '.json');
      const url = `${jsonPath}?v=${Date.now()}`;
      console.log('[DataLoader] Cargando:', url);

      const res = await fetch(url);
      console.log('[DataLoader] HTTP:', res.status, res.statusText);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} — no se encontró: ${url}`);
      }

      const questions = await res.json();

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('El archivo JSON no contiene preguntas válidas.');
      }

      console.log('[DataLoader] Preguntas cargadas:', questions.length);
      return questions;
    },
  };
})();