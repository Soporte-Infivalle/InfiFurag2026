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

  // Boot: solo carga el índice (0.5 KB) → pantalla de módulos instantánea
  async function boot() {
    UI.show('s-loading');
    UI.setLoadingMsg('Cargando módulos…');

    try {
      const index = await DataLoader.loadIndex();
      State.setIndex(index);
      ModulesScreen.render();
      UI.show('s-modules');
    } catch (err) {
      console.error('[App] Error en boot:', err);
      UI.showError(err.message);
    }
  }

  // Abre un módulo: carga sus preguntas on-demand
  async function openModule(mod) {
    const nombre = ModulesScreen.getNombre();
    if (!nombre) {
      UI.toast('Ingresa tu nombre antes de continuar', 'warn');
      document.getElementById('inp-nombre').focus();
      return;
    }

    UI.show('s-loading');
    UI.setLoadingMsg(`Cargando módulo ${mod}…`);

    try {
      const questions = await DataLoader.loadModule(mod);
      State.openModule(mod);
      State.setCurrentQuestions(questions);
      FormScreen.render(mod, questions);
      UI.show('s-form');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('[App] Error cargando módulo:', err);
      UI.toast('Error al cargar el módulo: ' + err.message, 'error');
      UI.show('s-modules');
    }
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

// ── Start ─────────────────────────────────────────────
App.boot();