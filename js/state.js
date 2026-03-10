// ══════════════════════════════════════════════════════
//  STATE — Estado global y persistencia en localStorage
// ══════════════════════════════════════════════════════

const STORAGE_KEY = 'furag25_state';

const State = (() => {
  // Preguntas cargadas del xlsx
  let questions = [];

  // Módulo actualmente abierto
  let currentModule = null;

  // Respuestas en memoria para el módulo activo
  let responses = {};

  // Estado persistido: { [modulo]: { [qId]: value } }
  let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  return {
    // ── Questions ────────────────────────────────────
    setQuestions(qs) { questions = qs; },
    getQuestions()   { return questions; },
    getByModule(mod) { return questions.filter(q => q.modulo === mod); },
    getModules()     { return [...new Set(questions.map(q => q.modulo))].sort(); },

    // ── Current module ───────────────────────────────
    openModule(mod) {
      currentModule = mod;
      responses = saved[mod] ? { ...saved[mod] } : {};
    },
    closeModule() {
      currentModule = null;
      responses = {};
    },
    getCurrentModule() { return currentModule; },

    // ── Responses ────────────────────────────────────
    setResponse(qId, value) {
      if (value === undefined || value === '' ||
         (Array.isArray(value) && value.length === 0)) {
        delete responses[qId];
      } else {
        responses[qId] = value;
      }
      this.persist();
    },
    getResponse(qId)    { return responses[qId]; },
    getAllResponses()    { return { ...responses }; },
    isAnswered(qId) {
      const v = responses[qId];
      return v !== undefined && v !== '' &&
             !(Array.isArray(v) && v.length === 0);
    },

    // ── Progress ─────────────────────────────────────
    getProgress(mod) {
      const qs = this.getByModule(mod);
      const src = mod === currentModule ? responses : (saved[mod] || {});
      const answered = qs.filter(q => {
        const v = src[q.id];
        return v !== undefined && v !== '' &&
               !(Array.isArray(v) && v.length === 0);
      }).length;
      return { answered, total: qs.length, pct: qs.length ? Math.round(answered / qs.length * 100) : 0 };
    },

    // ── Persist ──────────────────────────────────────
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
