/* Demo data + localStorage — must attach everything to window */
(function (global) {
  'use strict';

  var SURGERY_TYPES = [
    {
      id: 'eye',
      label: 'جراحی چشم',
      icon: 'eye',
      hint: 'قرنیه، شبکیه، آب‌سیاه، لیزیک و ...',
      children: [
        { id: 'injection', label: 'تزریق', hint: 'تزریق داخل چشمی' },
        { id: 'eye-surgery', label: 'جراحی چشم', hint: 'اعمال جراحی چشم' }
      ]
    },
    {
      id: 'cosmetic',
      label: 'جراحی زیبایی',
      icon: 'sparkles',
      hint: 'پوست، مو، بینی و ...'
    }
  ];

  var DOCTORS = [
    { id: 1, name: 'دکتر علی ایزدی', specialty: 'چشم — گلوکوم', type: 'eye', subtype: 'eye-surgery', initials: 'ا', available: true, photo: 'assets/doctors/a_Izadi.jpg' },
    { id: 2, name: 'دکتر نوشین کریمی', specialty: 'چشم — قرنیه', type: 'eye', subtype: 'eye-surgery', initials: 'ک', available: true, photo: 'assets/doctors/n_Karimi.jpg' },
    { id: 3, name: 'دکتر باشی‌زاده فخار', specialty: 'چشم — شبکیه', type: 'eye', subtype: 'injection', initials: 'ف', available: true },
    { id: 4, name: 'دکتر پیمان سلیمی‌نژاد', specialty: 'گوش و حلق و بینی', type: 'cosmetic', subtype: null, initials: 'س', available: true, photo: 'assets/doctors/p_SalimiNejhad.jpg' },
    { id: 5, name: 'دکتر علیرضا فقیهی', specialty: 'جراحی بینی و سینوس', type: 'cosmetic', subtype: null, initials: 'ف', available: false, photo: 'assets/doctors/ar_faghihi.jpg' },
    { id: 6, name: 'دکتر گلفام مهرپرور', specialty: 'جراحی بینی', type: 'cosmetic', subtype: null, initials: 'م', available: true, photo: 'assets/doctors/g_MehrParvar.jpg' },
    { id: 7, name: 'دکتر امیرحسین محمودی', specialty: 'چشم — قرنیه', type: 'eye', subtype: 'eye-surgery', initials: 'م', available: true, photo: 'assets/doctors/mahmoodi.jpg' }
  ];

  var SEED_APPOINTMENTS = [
    { id: 101, code: 'EYE-1405-0142', patient: 'مریم احمدی', doctor: 'دکتر علی ایزدی', type: 'جراحی چشم', time: '۰۹:۱۵', status: 'waiting', hasHistory: true, nationalId: '0012345678', mobile: '09121234567' },
    { id: 102, code: 'INJ-1405-0087', patient: 'رضا محمدی', doctor: 'دکتر باشی‌زاده فخار', type: 'تزریق', time: '۰۹:۴۰', status: 'in-progress', hasHistory: false, nationalId: '0023456789', mobile: '09132345678' },
    { id: 103, code: 'COS-1405-0031', patient: 'سارا کریمی', doctor: 'دکتر پیمان سلیمی‌نژاد', type: 'جراحی زیبایی', time: '۱۰:۰۰', status: 'waiting', hasHistory: true, nationalId: '0034567890', mobile: '09143456789' },
    { id: 104, code: 'EYE-1405-0143', patient: 'حسین رضایی', doctor: 'دکتر نوشین کریمی', type: 'جراحی چشم', time: '۱۰:۲۰', status: 'done', hasHistory: false, nationalId: '0045678901', mobile: '09154567890' },
    { id: 105, code: 'COS-1405-0032', patient: 'فاطمه نوری', doctor: 'دکتر گلفام مهرپرور', type: 'جراحی زیبایی', time: '۱۰:۴۵', status: 'waiting', hasHistory: false, nationalId: '', mobile: '09165678901' }
  ];

  var SEED_PATIENTS = [
    { id: 1, name: 'مریم احمدی', nationalId: '0012345678', mobile: '09121234567', visits: 3, hasHistory: true },
    { id: 2, name: 'رضا محمدی', nationalId: '0023456789', mobile: '09132345678', visits: 1, hasHistory: false },
    { id: 3, name: 'سارا کریمی', nationalId: '0034567890', mobile: '09143456789', visits: 5, hasHistory: true },
    { id: 4, name: 'حسین رضایی', nationalId: '0045678901', mobile: '09154567890', visits: 2, hasHistory: false }
  ];

  var STORAGE_KEY = 'novindidegan_demo_v1';

  function normalizeDigits(str) {
    if (!str) return '';
    var fa = '۰۱۲۳۴۵۶۷۸۹';
    var ar = '٠١٢٣٤٥٦٧٨٩';
    return String(str).trim().replace(/[۰-۹٠-٩]/g, function (d) {
      var i = fa.indexOf(d);
      if (i >= 0) return String(i);
      var j = ar.indexOf(d);
      return j >= 0 ? String(j) : d;
    });
  }

  function loadStore() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveStore() {
    try {
      if (!global.localStorage) return;
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        appointments: global.SAMPLE_APPOINTMENTS,
        patients: global.SAMPLE_PATIENTS
      }));
    } catch (e) {
      console.warn('[novindidegan] localStorage save failed', e);
    }
  }

  function findPatientByIdentity(nationalId, mobile) {
    var nid = normalizeDigits(nationalId);
    var mob = normalizeDigits(mobile);
    var list = global.SAMPLE_PATIENTS || [];
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var pn = normalizeDigits(p.nationalId);
      var pm = normalizeDigits(p.mobile);
      if (nid && pn && nid === pn) return p;
      if (mob && pm && mob === pm) return p;
    }
    return null;
  }

  function upsertPatient(opts) {
    var firstName = (opts.firstName || '').trim();
    var lastName = (opts.lastName || '').trim();
    var nid = normalizeDigits(opts.nationalId);
    var mob = normalizeDigits(opts.mobile);
    var hasHistory = !!opts.hasHistory;
    var name = (firstName + ' ' + lastName).trim();

    var patient = findPatientByIdentity(nid, mob);
    if (patient) {
      patient.name = name || patient.name;
      if (nid) patient.nationalId = nid;
      if (mob) patient.mobile = mob;
      if (hasHistory) patient.hasHistory = true;
      patient.visits = (patient.visits || 0) + 1;
    } else {
      patient = {
        id: Date.now(),
        name: name,
        nationalId: nid,
        mobile: mob,
        visits: 1,
        hasHistory: hasHistory
      };
      global.SAMPLE_PATIENTS.unshift(patient);
    }
    saveStore();
    return patient;
  }

  function registerAppointment(opts) {
    var patient = upsertPatient({
      firstName: opts.firstName,
      lastName: opts.lastName,
      nationalId: opts.nationalId,
      mobile: opts.mobile,
      hasHistory: opts.hasHistory
    });

    var now = new Date();
    var timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    var appt = {
      id: Date.now(),
      code: opts.code,
      patient: patient.name,
      doctor: opts.doctor,
      type: opts.type,
      time: timeStr,
      status: 'waiting',
      hasHistory: !!opts.hasHistory || !!patient.hasHistory,
      nationalId: patient.nationalId || '',
      mobile: patient.mobile || '',
      patientId: patient.id
    };

    global.SAMPLE_APPOINTMENTS.unshift(appt);
    saveStore();
    console.log('[novindidegan] appointment registered', appt.code, 'total=', global.SAMPLE_APPOINTMENTS.length);
    return { appointment: appt, patient: patient };
  }

  function resetDemoData() {
    global.SAMPLE_APPOINTMENTS = SEED_APPOINTMENTS.map(function (a) { return Object.assign({}, a); });
    global.SAMPLE_PATIENTS = SEED_PATIENTS.map(function (p) { return Object.assign({}, p); });
    saveStore();
    console.log('[novindidegan] demo data reset');
  }

  // ---- init ----
  var stored = loadStore();
  if (stored && Array.isArray(stored.appointments) && Array.isArray(stored.patients)) {
    global.SAMPLE_APPOINTMENTS = stored.appointments;
    global.SAMPLE_PATIENTS = stored.patients;
  } else {
    global.SAMPLE_APPOINTMENTS = SEED_APPOINTMENTS.map(function (a) { return Object.assign({}, a); });
    global.SAMPLE_PATIENTS = SEED_PATIENTS.map(function (p) { return Object.assign({}, p); });
    saveStore();
  }

  global.SURGERY_TYPES = SURGERY_TYPES;
  global.DOCTORS = DOCTORS;
  global.registerAppointment = registerAppointment;
  global.resetDemoData = resetDemoData;
  global.findPatientByIdentity = findPatientByIdentity;
  global.saveStore = saveStore;
  global.loadStore = loadStore;

  console.log('[novindidegan] data.js loaded — appointments:', global.SAMPLE_APPOINTMENTS.length, 'patients:', global.SAMPLE_PATIENTS.length);
})(typeof window !== 'undefined' ? window : global);
