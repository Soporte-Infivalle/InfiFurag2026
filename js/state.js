// ══════════════════════════════════════════════════════
//  STATE — Estado global y persistencia en localStorage
// ══════════════════════════════════════════════════════

const STORAGE_KEY = 'furag25_state';

const State = (() => {
  // Índice de módulos [{ modulo, total }]
  let moduleIndex = [];

  // Preguntas del módulo activo (cargadas on-demand)
  let currentQuestions = [];

  // Módulo actualmente abierto
  let currentModule = null;

  // Respuestas en memoria para el módulo activo
  let responses = {};

  // Estado persistido: { [modulo]: { [qId]: value } }
  let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  return {
    // ── Index ─────────────────────────────────────────
    setIndex(index)  { moduleIndex = index; },
    getIndex()       { return moduleIndex; },
    getModules()     { return moduleIndex.map(m => m.modulo); },
    getModuleTotal(mod) {
      const entry = moduleIndex.find(m => m.modulo === mod);
      return entry ? entry.total : 0;
    },

    // ── Questions (loaded per module) ─────────────────
    setCurrentQuestions(qs) { currentQuestions = qs; },
    getCurrentQuestions()   { return currentQuestions; },

    // ── Current module ────────────────────────────────
    openModule(mod) {
      currentModule = mod;
      responses = saved[mod] ? { ...saved[mod] } : {};
    },
    closeModule() {
      currentModule   = null;
      currentQuestions = [];
      responses       = {};
    },
    getCurrentModule() { return currentModule; },

    // ── Responses ─────────────────────────────────────
    setResponse(qId, value) {
      const empty = value === undefined || value === '' ||
                    (Array.isArray(value) && value.length === 0);
      if (empty) delete responses[qId];
      else       responses[qId] = value;
      this.persist();
    },
    getResponse(qId)  { return responses[qId]; },
    isAnswered(qId) {
      const v = responses[qId];
      return v !== undefined && v !== '' &&
             !(Array.isArray(v) && v.length === 0);
    },

    // ── Progress ──────────────────────────────────────
    getProgress(mod) {
      const total  = this.getModuleTotal(mod);
      const src    = mod === currentModule ? responses : (saved[mod] || {});
      const answered = Object.values(src).filter(v =>
        v !== undefined && v !== '' &&
        !(Array.isArray(v) && v.length === 0)
      ).length;
      const pct = total ? Math.round(answered / total * 100) : 0;
      return { answered, total, pct };
    },

    // ── Persist ───────────────────────────────────────
    persist() {
      if (!currentModule) return;
      saved[currentModule] = { ...responses };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    },
    markModuleSaved(mod) {
      saved[mod] = { ...responses };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    },
  };
})();