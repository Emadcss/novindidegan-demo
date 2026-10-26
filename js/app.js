/* ========== App Bootstrap ========== */

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${name}`);
  if (target) target.classList.add('active');

  if (name === 'kiosk') {
    resetKiosk();
    renderKioskStep();
  }
  if (name === 'admin') {
    renderAdminPanel('dashboard');
    updateAdminDate();
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function updateClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  const now = new Date();
  // Simple Tehran-ish time (demo)
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${h}:${m}`;
}

function updateAdminDate() {
  const el = document.getElementById('admin-date');
  if (!el) return;
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  // Fallback simple
  el.textContent = now.toLocaleDateString('fa-IR', options) || 'یکشنبه ۲۵ مهر ۱۴۰۵';
}

// Entry cards
document.querySelectorAll('.entry-card').forEach(btn => {
  btn.addEventListener('click', () => {
    const go = btn.dataset.go;
    if (go === 'kiosk') showScreen('kiosk');
    if (go === 'admin') showScreen('admin');
  });
});

// Kiosk nav
document.getElementById('btn-back')?.addEventListener('click', kioskGoBack);
document.getElementById('btn-cancel')?.addEventListener('click', kioskCancel);

// Admin nav
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    renderAdminPanel(btn.dataset.panel);
  });
});

document.getElementById('admin-exit')?.addEventListener('click', () => {
  showScreen('entry');
});

// Clock
updateClock();
setInterval(updateClock, 15000);

// Prevent zoom on double-tap (kiosk)
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
