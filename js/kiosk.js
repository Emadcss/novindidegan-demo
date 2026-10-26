/* ========== Kiosk State Machine + Persian Virtual Keyboard ========== */

const KioskState = {
  step: 'surgery-type',
  surgeryType: null,
  subtype: null,
  doctor: null,
  patient: { firstName: '', lastName: '', nationalId: '', mobile: '' },
  hasHistory: null,
  result: null,
  activeField: 'firstName',
  kbMode: 'farsi' // farsi | numeric
};

let keyboardInstance = null;

function resetKiosk() {
  KioskState.step = 'surgery-type';
  KioskState.surgeryType = null;
  KioskState.subtype = null;
  KioskState.doctor = null;
  KioskState.patient = { firstName: '', lastName: '', nationalId: '', mobile: '' };
  KioskState.hasHistory = null;
  KioskState.result = null;
  KioskState.activeField = 'firstName';
  KioskState.kbMode = 'farsi';
  destroyKeyboard();
}

function destroyKeyboard() {
  if (keyboardInstance) {
    try { keyboardInstance.destroy(); } catch(e) {}
    keyboardInstance = null;
  }
}

function getVisibleSteps() {
  if (KioskState.surgeryType === 'eye') {
    return ['surgery-type', 'subtype', 'doctor', 'details', 'history', 'result'];
  }
  return ['surgery-type', 'doctor', 'details', 'history', 'result'];
}

function renderProgress() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  const steps = getVisibleSteps();
  const currentIdx = steps.indexOf(KioskState.step);
  bar.innerHTML = steps.map((_, i) => {
    let cls = 'progress-dot';
    if (i < currentIdx) cls += ' done';
    if (i === currentIdx) cls += ' active';
    return `<div class="${cls}"></div>`;
  }).join('');
}

function updateNavButtons() {
  const back = document.getElementById('btn-back');
  const cancel = document.getElementById('btn-cancel');
  if (!back) return;
  const isFirst = KioskState.step === 'surgery-type';
  const isResult = KioskState.step === 'result';
  back.disabled = isFirst || isResult;
  cancel.style.display = isResult ? 'none' : 'inline-flex';
}

function renderKioskStep() {
  const el = document.getElementById('kiosk-content');
  if (!el) return;
  destroyKeyboard();
  renderProgress();
  updateNavButtons();
  el.innerHTML = '';
  const map = {
    'surgery-type': renderSurgeryType,
    'subtype': renderSubtype,
    'doctor': renderDoctor,
    'details': renderDetails,
    'history': renderHistory,
    'result': renderResult
  };
  if (map[KioskState.step]) map[KioskState.step](el);
}

/* ---- Icons ---- */
function getIcon(name) {
  const icons = {
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    syringe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 6L6 18M15 3l6 6M9 21l-6-6"/><path d="M9 15l-1.5 1.5a2.12 2.12 0 003 3L12 18"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>`
  };
  return icons[name] || icons.eye;
}

/* ---- Steps ---- */
function renderSurgeryType(container) {
  container.innerHTML = `
    <h2 class="step-title">نوع جراحی را انتخاب کنید</h2>
    <p class="step-subtitle">لطفاً یکی از گزینه‌های زیر را انتخاب کنید</p>
    <div class="choice-grid cols-2" id="surgery-choices"></div>
  `;
  const grid = container.querySelector('#surgery-choices');
  SURGERY_TYPES.forEach(t => {
    const card = document.createElement('button');
    card.className = 'choice-card';
    card.innerHTML = `
      <div class="icon-wrap">${getIcon(t.icon)}</div>
      <span class="label">${t.label}</span>
      <span class="hint">${t.hint}</span>
    `;
    card.addEventListener('click', () => {
      KioskState.surgeryType = t.id;
      KioskState.step = (t.children && t.children.length) ? 'subtype' : 'doctor';
      if (!t.children) KioskState.subtype = null;
      renderKioskStep();
    });
    grid.appendChild(card);
  });
}

function renderSubtype(container) {
  const parent = SURGERY_TYPES.find(t => t.id === KioskState.surgeryType);
  const children = parent?.children || [];
  container.innerHTML = `
    <h2 class="step-title">نوع عمل چشم را مشخص کنید</h2>
    <p class="step-subtitle">یکی از گزینه‌های زیر را انتخاب کنید</p>
    <div class="choice-grid cols-2" id="subtype-choices"></div>
  `;
  const grid = container.querySelector('#subtype-choices');
  children.forEach(c => {
    const card = document.createElement('button');
    card.className = 'choice-card';
    card.innerHTML = `
      <div class="icon-wrap">${getIcon(c.id === 'injection' ? 'syringe' : 'eye')}</div>
      <span class="label">${c.label}</span>
      <span class="hint">${c.hint}</span>
    `;
    card.addEventListener('click', () => {
      KioskState.subtype = c.id;
      KioskState.step = 'doctor';
      renderKioskStep();
    });
    grid.appendChild(card);
  });
}

function renderDoctor(container) {
  let doctors = DOCTORS.filter(d => d.type === KioskState.surgeryType);
  if (KioskState.subtype) {
    doctors = doctors.filter(d => !d.subtype || d.subtype === KioskState.subtype);
  }
  container.innerHTML = `
    <h2 class="step-title">پزشک را انتخاب کنید</h2>
    <p class="step-subtitle">پزشکان در دسترس برای تخصص انتخاب‌شده</p>
    <div class="choice-grid" id="doctor-list" style="max-width:560px"></div>
  `;
  const list = container.querySelector('#doctor-list');
  if (!doctors.length) {
    list.innerHTML = `<div class="empty-state"><p>پزشکی برای این تخصص در دسترس نیست</p></div>`;
    return;
  }
  doctors.forEach(d => {
    const card = document.createElement('button');
    card.className = 'doctor-card';
    if (!d.available) card.style.opacity = '0.5';
    const avatar = d.photo
      ? `<img class="doctor-photo" src="${d.photo}" alt="${d.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="doctor-initials" style="display:none">${d.initials}</span>`
      : `<span class="doctor-initials">${d.initials}</span>`;
    card.innerHTML = `
      <div class="doctor-avatar">${avatar}</div>
      <div class="doctor-info">
        <div class="doctor-name">${d.name}</div>
        <div class="doctor-spec">${d.specialty}</div>
      </div>
      <span class="doctor-status">${d.available ? 'حاضر' : 'غایب'}</span>
    `;
    if (d.available) {
      card.addEventListener('click', () => {
        KioskState.doctor = d;
        KioskState.step = 'details';
        renderKioskStep();
      });
    }
    list.appendChild(card);
  });
}

/* ---- Details + Virtual Keyboard ---- */
const FARSI_LAYOUT = {
  default: [
    "\u06f1 \u06f2 \u06f3 \u06f4 \u06f5 \u06f6 \u06f7 \u06f8 \u06f9 \u06f0 {bksp}",
    "\u0636 \u0635 \u062b \u0642 \u0641 \u063a \u0639 \u0647 \u062e \u062d \u062c \u0686",
    "\u0634 \u0633 \u06cc \u0628 \u0644 \u0627 \u062a \u0646 \u0645 \u06a9 \u06af",
    "{shift} \u0638 \u0637 \u0632 \u0631 \u0630 \u062f \u067e \u0648 \u002e {shift}",
    "{space}"
  ],
  shift: [
    "! \u066c \u066b \ufdfc \u066a \u00d7 * ) ( \u0640 {bksp}",
    "\u0652 \u064c \u064d \u064b \u064f \u0650 \u064e \u0651 ] [ } {",
    "\u0624 \u0626 \u064a \u0625 \u0623 \u0622 \u0629 \u00bb \u00ab : \u061b",
    "{shift} \u0643 \u0653 \u0698 \u0670 \u200c \u0654 \u0621 < > \u061f {shift}",
    "{space}"
  ]
};

const NUMERIC_LAYOUT = {
  default: [
    "1 2 3",
    "4 5 6",
    "7 8 9",
    "{bksp} 0 {enter}"
  ]
};

// Persian digits version for numeric feel consistency
const NUMERIC_LAYOUT_FA = {
  default: [
    "۱ ۲ ۳",
    "۴ ۵ ۶",
    "۷ ۸ ۹",
    "{bksp} ۰ {enter}"
  ]
};

function fieldDisplay(val, placeholder) {
  if (val) return val;
  return `<span class="placeholder">${placeholder}</span>`;
}

function isMobileView() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function renderDetails(container) {
  const p = KioskState.patient;
  const mobile = isMobileView();
  const isNumericField = KioskState.activeField === 'nationalId' || KioskState.activeField === 'mobile';
  KioskState.kbMode = isNumericField ? 'numeric' : 'farsi';

  if (mobile) {
    // —— Mobile: native inputs, no OSK ——
    container.innerHTML = `
      <div class="details-layout">
        <div class="details-top">
          <div class="details-top-title">
            <h2>مشخصات بیمار</h2>
            <p>نام و نام‌خانوادگی اجباری است. کد ملی یا موبایل را وارد کنید.</p>
          </div>
          <div class="details-fields">
            <div class="form-field native-mode" data-field="firstName">
              <label>نام <span class="req">*</span></label>
              <input class="native-input" id="n-first" type="text" autocomplete="given-name"
                placeholder="مثال: مریم" value="${p.firstName || ''}" />
            </div>
            <div class="form-field native-mode" data-field="lastName">
              <label>نام خانوادگی <span class="req">*</span></label>
              <input class="native-input" id="n-last" type="text" autocomplete="family-name"
                placeholder="مثال: احمدی" value="${p.lastName || ''}" />
            </div>
            <div class="form-field native-mode" data-field="nationalId">
              <label>کد ملی</label>
              <input class="native-input" id="n-nid" type="text" inputmode="numeric" maxlength="10"
                placeholder="۱۰ رقم" value="${p.nationalId || ''}" />
            </div>
            <div class="form-field native-mode" data-field="mobile">
              <label>شماره موبایل</label>
              <input class="native-input" id="n-mobile" type="tel" inputmode="tel" maxlength="11"
                placeholder="۰۹۱۲۱۲۳۴۵۶۷" value="${p.mobile || ''}" />
            </div>
          </div>
          <div class="details-actions">
            <button class="btn btn-primary" id="btn-details-next">ادامه</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-details-next').addEventListener('click', () => {
      p.firstName = document.getElementById('n-first').value.trim();
      p.lastName = document.getElementById('n-last').value.trim();
      p.nationalId = document.getElementById('n-nid').value.trim();
      p.mobile = document.getElementById('n-mobile').value.trim();
      if (!p.firstName || !p.lastName) { showToast('نام و نام‌خانوادگی اجباری است'); return; }
      if (!p.nationalId && !p.mobile) { showToast('کد ملی یا شماره موبایل را وارد کنید'); return; }
      KioskState.step = 'history';
      renderKioskStep();
    });
    return;
  }

  // —— Desktop / Kiosk: virtual keyboard ——
  container.innerHTML = `
    <div class="details-layout">
      <div class="details-top">
        <div class="details-top-title">
          <h2>مشخصات بیمار</h2>
          <p>روی هر فیلد بزنید و با کیبورد تایپ کنید · نام اجباری است</p>
        </div>
        <div class="details-fields">
          <div class="form-field ${KioskState.activeField==='firstName'?'active':''}" data-field="firstName">
            <label>نام <span class="req">*</span></label>
            <div class="field-value desktop-only">${fieldDisplay(p.firstName, 'مثال: مریم')}</div>
          </div>
          <div class="form-field ${KioskState.activeField==='lastName'?'active':''}" data-field="lastName">
            <label>نام خانوادگی <span class="req">*</span></label>
            <div class="field-value desktop-only">${fieldDisplay(p.lastName, 'مثال: احمدی')}</div>
          </div>
          <div class="form-field ${KioskState.activeField==='nationalId'?'active':''}" data-field="nationalId">
            <label>کد ملی</label>
            <div class="field-value desktop-only">${fieldDisplay(p.nationalId, '۱۰ رقم')}</div>
          </div>
          <div class="form-field ${KioskState.activeField==='mobile'?'active':''}" data-field="mobile">
            <label>شماره موبایل</label>
            <div class="field-value desktop-only">${fieldDisplay(p.mobile, '۰۹۱۲...')}</div>
          </div>
        </div>
        <div class="details-actions">
          <button class="btn btn-primary" id="btn-details-next">ادامه</button>
        </div>
      </div>

      <div class="keyboard-wrap">
        <div class="keyboard-area">
          <div class="simple-keyboard ${KioskState.kbMode==='numeric'?'kb-numeric':''}"></div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.form-field').forEach(f => {
    f.addEventListener('click', () => {
      const prev = KioskState.activeField;
      KioskState.activeField = f.dataset.field;
      const needNumeric = f.dataset.field === 'nationalId' || f.dataset.field === 'mobile';
      const wasNumeric = prev === 'nationalId' || prev === 'mobile';
      if (needNumeric !== wasNumeric) {
        renderDetails(container);
      } else {
        container.querySelectorAll('.form-field').forEach(el => {
          el.classList.toggle('active', el.dataset.field === KioskState.activeField);
        });
        if (keyboardInstance) {
          keyboardInstance.setInput(KioskState.patient[KioskState.activeField] || '');
        }
      }
    });
  });

  document.getElementById('btn-details-next').addEventListener('click', () => {
    if (!p.firstName.trim() || !p.lastName.trim()) {
      showToast('نام و نام‌خانوادگی اجباری است');
      return;
    }
    if (!p.nationalId.trim() && !p.mobile.trim()) {
      showToast('کد ملی یا شماره موبایل را وارد کنید');
      return;
    }
    KioskState.step = 'history';
    renderKioskStep();
  });

  initKeyboard();
}

function initKeyboard() {
  const Keyboard = window.SimpleKeyboard?.default || window.SimpleKeyboard;
  if (!Keyboard) {
    console.warn('simple-keyboard not loaded');
    return;
  }

  destroyKeyboard();

  const isNumeric = KioskState.kbMode === 'numeric';
  const layout = isNumeric ? NUMERIC_LAYOUT_FA : FARSI_LAYOUT;

  keyboardInstance = new Keyboard({
    onChange: (input) => {
      KioskState.patient[KioskState.activeField] = input;
      const field = document.querySelector(`.form-field[data-field="${KioskState.activeField}"] .field-value`);
      if (field) {
        if (input) {
          field.classList.remove('placeholder');
          field.textContent = input;
        } else {
          const ph = KioskState.activeField === 'firstName' ? 'مثال: مریم' :
                     KioskState.activeField === 'lastName' ? 'مثال: احمدی' :
                     KioskState.activeField === 'nationalId' ? '۱۰ رقم' : '۰۹۱۲...';
          field.innerHTML = fieldDisplay('', ph);
        }
      }
    },
    onKeyPress: (button) => {
      if (button === '{shift}' || button === '{lock}') {
        const current = keyboardInstance.options.layoutName;
        keyboardInstance.setOptions({ layoutName: current === 'default' ? 'shift' : 'default' });
      }
      if (button === '{enter}') {
        document.getElementById('btn-details-next')?.click();
      }
    },
    layout,
    layoutName: 'default',
    display: {
      '{bksp}': '⌫',
      '{enter}': 'تأیید',
      '{shift}': '⇧',
      '{space}': 'فاصله',
      '{lock}': 'Caps'
    },
    theme: 'hg-theme-default',
    preventMouseDownDefault: true,
    useButtonTag: true,
    physicalKeyboardHighlight: false
  });

  keyboardInstance.setInput(KioskState.patient[KioskState.activeField] || '');

  // Force LTR key order (standard physical layout)
  const kbEl = document.querySelector('.simple-keyboard');
  if (kbEl) {
    kbEl.style.direction = 'ltr';
    kbEl.setAttribute('dir', 'ltr');
  }
}

function renderHistory(container) {
  container.innerHTML = `
    <h2 class="step-title">سابقه جراحی در این مرکز</h2>
    <p class="step-subtitle">آیا قبلاً در کلینیک نوین دیدگان جراحی داشته‌اید؟</p>
    <div class="choice-grid cols-2" id="history-choices" style="max-width:400px"></div>
  `;
  const grid = container.querySelector('#history-choices');
  [
    { val: true, label: 'بله', icon: 'check' },
    { val: false, label: 'خیر', icon: 'x' }
  ].forEach(opt => {
    const card = document.createElement('button');
    card.className = 'choice-card';
    card.innerHTML = `
      <div class="icon-wrap">${getIcon(opt.icon)}</div>
      <span class="label">${opt.label}</span>
    `;
    card.addEventListener('click', () => {
      KioskState.hasHistory = opt.val;
      submitAppointment();
    });
    grid.appendChild(card);
  });
}

function submitAppointment() {
  const el = document.getElementById('kiosk-content');
  el.innerHTML = `
    <div class="result-card" style="padding:56px 36px">
      <div style="width:48px;height:48px;border:3px solid var(--c-primary);border-top-color:transparent;border-radius:50%;margin:0 auto 20px;animation:spin 0.8s linear infinite"></div>
      <p style="color:var(--c-text-3);font-size:1.1rem;font-weight:500">در حال ثبت نوبت...</p>
    </div>
  `;
  const prefix = KioskState.subtype === 'injection' ? 'INJ' :
                 KioskState.surgeryType === 'eye' ? 'EYE' : 'COS';
  const num = String(Math.floor(Math.random() * 900) + 100).padStart(4, '0');
  const code = `${prefix}-1405-${num}`;

  setTimeout(() => {
    const typeLabel = KioskState.subtype === 'injection' ? 'تزریق' :
            KioskState.surgeryType === 'eye' ? 'جراحی چشم' : 'جراحی زیبایی';

    let appointment, patient;
    try {
      const result = registerAppointment({
        code,
        firstName: KioskState.patient.firstName,
        lastName: KioskState.patient.lastName,
        doctor: KioskState.doctor.name,
        type: typeLabel,
        hasHistory: !!KioskState.hasHistory,
        nationalId: KioskState.patient.nationalId || '',
        mobile: KioskState.patient.mobile || ''
      });
      appointment = result.appointment;
      patient = result.patient;
    } catch (err) {
      console.error('[novindidegan] register failed', err);
      KioskState.result = { success: false };
      KioskState.step = 'result';
      renderKioskStep();
      return;
    }

    KioskState.result = {
      success: true,
      code: appointment.code,
      doctor: appointment.doctor,
      type: appointment.type,
      patient: appointment.patient,
      history: appointment.hasHistory ? 'دارد' : 'ندارد',
      isReturning: (patient.visits || 1) > 1
    };
    KioskState.step = 'result';
    renderKioskStep();
  }, 1100);
}

function renderResult(container) {
  const r = KioskState.result;
  if (!r || !r.success) {
    container.innerHTML = `
      <div class="result-card">
        <div class="result-icon error">${getIcon('x')}</div>
        <h2 class="result-title">ثبت ناموفق</h2>
        <p style="color:var(--c-text-3);margin-bottom:24px">لطفاً دوباره تلاش کنید یا به پذیرش مراجعه کنید</p>
        <button class="btn btn-primary" id="btn-retry">تلاش دوباره</button>
      </div>
    `;
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      resetKiosk();
      renderKioskStep();
    });
    return;
  }

  container.innerHTML = `
    <div class="result-card">
      <div class="result-icon success">${getIcon('check')}</div>
      <h2 class="result-title">نوبت با موفقیت ثبت شد</h2>
      <div class="result-code">${r.code}</div>
      <div class="result-meta">
        <div><strong>بیمار:</strong> ${r.patient}</div>
        <div><strong>پزشک:</strong> ${r.doctor}</div>
        <div><strong>نوع عمل:</strong> ${r.type}</div>
        <div><strong>سابقه جراحی:</strong> ${r.history}</div>
      </div>
      <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:22px;line-height:1.6">
        قبض در حال چاپ است...<br/>
        پس از دریافت قبض به باجه پذیرش مراجعه کنید
      </p>
      <button class="btn btn-success" id="btn-done">بازگشت به صفحه اصلی</button>
    </div>
  `;
  document.getElementById('btn-done').addEventListener('click', () => {
    resetKiosk();
    showScreen('entry');
  });
  setTimeout(() => {
    if (KioskState.step === 'result') {
      resetKiosk();
      showScreen('entry');
    }
  }, 12000);
}

function kioskGoBack() {
  const steps = getVisibleSteps();
  const idx = steps.indexOf(KioskState.step);
  if (idx <= 0) return;
  if (KioskState.step === 'subtype') KioskState.surgeryType = null;
  if (KioskState.step === 'doctor') KioskState.subtype = null;
  if (KioskState.step === 'details') KioskState.doctor = null;
  KioskState.step = steps[idx - 1];
  renderKioskStep();
}

function kioskCancel() {
  resetKiosk();
  showScreen('entry');
}

const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);
