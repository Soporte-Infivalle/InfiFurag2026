// ══════════════════════════════════════════════════════
//  SHARED — Utilidades compartidas entre todas las páginas
// ══════════════════════════════════════════════════════

// ── Fetch JSON ──────────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(`${url}?v=${CONFIG.VERSION}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

// ── localStorage helpers ────────────────────────────
function getSaved() {
  try {
    return JSON.parse(localStorage.getItem('furag25_state') || '{}');
  } catch { return {}; }
}

// ── Toast ────────────────────────────────────────────
let _toastTimer;
function toast(msg, type = 'error', dur = 3500) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.className = `toast ${type} show`;
  el.textContent = msg;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), dur);
}