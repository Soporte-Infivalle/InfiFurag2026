// ══════════════════════════════════════════════════════
//  ADMIN — Panel de administración con login simple
// ══════════════════════════════════════════════════════

const Admin = (() => {
  // Contraseña — cámbiala en config.js agregando ADMIN_PWD
  function pwd() {
    return CONFIG.ADMIN_PWD || 'furag2025';
  }

  let authenticated = false;

  // ── Open / Close ───────────────────────────────────

  function open() {
    document.getElementById('admin-overlay').classList.add('open');
    document.getElementById('admin-pwd').value = '';
    document.getElementById('admin-pwd-err').textContent = '';

    if (authenticated) {
      showPanel();
    } else {
      showLogin();
    }
  }

  function close() {
    document.getElementById('admin-overlay').classList.remove('open');
  }

  function onOverlayClick(e) {
    if (e.target === document.getElementById('admin-overlay')) close();
  }

  // ── Login ──────────────────────────────────────────

  function showLogin() {
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    setTimeout(() => document.getElementById('admin-pwd').focus(), 50);
  }

  function showPanel() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    renderProgressList();
    // Pre-fill webhook
    document.getElementById('adm-webhook').value = CONFIG.WEBHOOK_URL || '';
  }

  function login() {
    const val = document.getElementById('admin-pwd').value;
    if (val === pwd()) {
      authenticated = true;
      document.getElementById('admin-pwd-err').textContent = '';
      showPanel();
    } else {
      document.getElementById('admin-pwd-err').textContent = 'Contraseña incorrecta';
      document.getElementById('admin-pwd').select();
    }
  }

  function logout() {
    authenticated = false;
    close();
  }

  // ── Config ─────────────────────────────────────────

  function saveConfig() {
    const webhook = document.getElementById('adm-webhook').value.trim();
    CONFIG.WEBHOOK_URL = webhook;
    UI.toast('Configuración guardada en memoria', 'success');
  }

  // ── Progress list ──────────────────────────────────

  function renderProgressList() {
    const index = State.getIndex();
    const list  = document.getElementById('adm-progress-list');

    if (!index.length) {
      list.innerHTML = '<p style="font-size:.82rem;color:var(--muted)">No hay módulos cargados.</p>';
      return;
    }

    list.innerHTML = index.map(({ modulo, total }) => {
      const { answered, pct } = State.getProgress(modulo);
      const cls = pct === 0 ? 'empty' : pct < 100 ? 'partial' : '';
      const label = pct === 0 ? 'Sin respuestas' : `${answered}/${total} — ${pct}%`;
      return `
        <div class="adm-mod-row">
          <span class="adm-mod-name">${modulo}</span>
          <span class="adm-mod-pct ${cls}">${label}</span>
        </div>`;
    }).join('');
  }

  // ── Clear ──────────────────────────────────────────

  function clearModule() {
    const mod = State.getCurrentModule();
    if (!mod) {
      UI.toast('Abre un módulo primero para borrarlo', 'warn');
      return;
    }
    if (!confirm(`¿Borrar todas las respuestas del módulo ${mod}?`)) return;

    // Remove from localStorage
    const saved = JSON.parse(localStorage.getItem('furag25_state') || '{}');
    delete saved[mod];
    localStorage.setItem('furag25_state', JSON.stringify(saved));

    // Reload page to reset in-memory state cleanly
    UI.toast(`Respuestas de ${mod} borradas`, 'success');
    setTimeout(() => location.reload(), 1000);
  }

  function clearAll() {
    if (!confirm('¿Borrar TODAS las respuestas guardadas en este dispositivo?')) return;
    localStorage.removeItem('furag25_state');
    UI.toast('Todas las respuestas borradas', 'success');
    setTimeout(() => location.reload(), 1000);
  }

  return { open, close, onOverlayClick, login, logout, saveConfig, clearModule, clearAll };
})();