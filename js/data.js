// ══════════════════════════════════════════════════════
//  DATA — Carga lazy por módulo desde data/modulos/
//  Carga inicial: solo index.json (0.5 KB)
//  Al abrir módulo: solo MOD.json (avg ~13 KB)
// ══════════════════════════════════════════════════════

const DataLoader = (() => {
  const cache = {};   // { [mod]: questions[] } — evita re-fetch

  function baseDir() {
    // CONFIG.DATA_DIR = '/InfiFurag2026/data'
    return CONFIG.DATA_DIR.replace(/\/$/, '');
  }

  async function fetchJSON(url) {
    const res = await fetch(`${url}?v=${CONFIG.VERSION}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    return res.json();
  }

  return {
    // Carga solo el índice de módulos (0.5 KB)
    async loadIndex() {
      const url = `${baseDir()}/index.json`;
      console.log('[DataLoader] Cargando índice:', url);
      const index = await fetchJSON(url);
      console.log('[DataLoader] Módulos disponibles:', index.length);
      return index;  // [{ modulo, total }]
    },

    // Carga las preguntas de un módulo específico (~avg 13 KB)
    async loadModule(mod) {
      if (cache[mod]) {
        console.log('[DataLoader] Cache hit:', mod);
        return cache[mod];
      }
      const url = `${baseDir()}/modulos/${mod}.json`;
      console.log('[DataLoader] Cargando módulo:', url);
      const questions = await fetchJSON(url);
      // Garantizar orden por ID
      questions.sort((a, b) => a.id - b.id);
      cache[mod] = questions;
      console.log('[DataLoader] Preguntas cargadas:', questions.length);
      return questions;
    },
  };
})();