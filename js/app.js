// ══════════════════════════════════════════════════════
//  APP — Boot, coordinación de pantallas y UI helpers
// ══════════════════════════════════════════════════════

// ── UI helpers ──────────────────────────────────────────
const UI = (() => {
  let toastTimer;

  function show(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  function toast(msg, type = 'error', dur = 3500) {
    const el = document.getElementById('toast');
    el.className = `toast ${type} show`;
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), dur);
  }

  function setLoadingMsg(text) {
    document.getElementById('loading-msg').textContent = text;
  }

  function showError(detail) {
    document.getElementById('err-detail').textContent = detail;
    show('s-error');
  }

  return { show, toast, setLoadingMsg, showError };
})();

// ── App coordinator ─────────────────────────────────────
const App = (() => {

  async function boot() {
    UI.show('s-loading');
    UI.setLoadingMsg('Cargando preguntas…');

    try {
      const questions = await DataLoader.load(CONFIG.DATA_FILE);
      State.setQuestions(questions);
      ModulesScreen.render();
      UI.show('s-modules');
    } catch (err) {
      console.error('[App] Error en boot:', err);
      UI.showError(err.message);
    }
  }

  function openModule(mod) {
    State.openModule(mod);
    FormScreen.render(mod);
    UI.show('s-form');
    window.scrollTo(0, 0);
  }

  function closeModule() {
    FormScreen.reset();
    State.closeModule();
    ModulesScreen.refresh();
    UI.show('s-modules');
    window.scrollTo(0, 0);
  }

  async function submitAnswers() {
    const btn     = document.getElementById('btn-submit');
    const nombre  = ModulesScreen.getNombre();
    const entidad = ModulesScreen.getEntidad();
    const mod     = State.getCurrentModule();

    if (!nombre) {
      UI.toast('Ingresa tu nombre antes de enviar', 'warn');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Guardando…';

    try {
      const ok = await Submitter.send(mod, nombre, entidad);
      if (ok) UI.show('s-success');
    } catch (err) {
      UI.toast('Error al enviar: ' + err.message, 'error');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Guardar respuestas ↗';
    }
  }

  return { boot, openModule, closeModule, submitAnswers };
})();

// ── Start ────────────────────────────────────────────────
// Scripts están al final del <body>, el DOM ya está listo.
App.boot();