// ══════════════════════════════════════════════════════
//  DATA — Carga y parseo del archivo xlsx con SheetJS
// ══════════════════════════════════════════════════════

const DataLoader = (() => {

  function parseSheet(ws) {
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

    return rows
      .filter(r => r['ID'] && r['Pregunta 2025'])
      .map(r => {
        const opciones = [];
        for (let i = 1; i <= 15; i++) {
          const v = r[`Opción ${i}`];
          if (v && String(v).trim()) opciones.push(String(v).trim());
        }
        const cod = String(r['Código'] || '');
        return {
          id:      r['ID'],
          codigo:  cod,
          modulo:  cod.substring(0, 3).toUpperCase(),
          texto:   String(r['Pregunta 2025']).trim(),
          tipo:    String(r['Tipo de pregunta'] || 'Selección única').trim(),
          opciones,
        };
      });
  }

  return {
    async load(filePath, sheetName) {
      const url = `${filePath}?v=${Date.now()}`;
      console.log('[DataLoader] Intentando cargar:', url);

      const res = await fetch(url);
      console.log('[DataLoader] HTTP:', res.status, res.statusText);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} — archivo no encontrado en: ${url}`);
      }

      const buffer = await res.arrayBuffer();
      const wb     = XLSX.read(buffer, { type: 'array' });
      const ws     = wb.Sheets[sheetName];

      console.log('[DataLoader] Hojas disponibles:', Object.keys(wb.Sheets));

      if (!ws) {
        throw new Error(
          `Hoja "${sheetName}" no encontrada. Hojas disponibles: ${Object.keys(wb.Sheets).join(', ')}`
        );
      }

      const questions = parseSheet(ws);

      if (questions.length === 0) {
        throw new Error('El archivo no contiene preguntas válidas.');
      }

      console.log('[DataLoader] Preguntas cargadas:', questions.length);
      return questions;
    },
  };
})();