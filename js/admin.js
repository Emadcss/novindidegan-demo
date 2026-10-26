function getAppointments() {
  if (typeof window.SAMPLE_APPOINTMENTS !== 'undefined' && Array.isArray(window.SAMPLE_APPOINTMENTS)) {
    return window.SAMPLE_APPOINTMENTS;
  }
  return [];
}
function getPatients() {
  if (typeof window.SAMPLE_PATIENTS !== 'undefined' && Array.isArray(window.SAMPLE_PATIENTS)) {
    return window.SAMPLE_PATIENTS;
  }
  return [];
}

/* ========== Admin Panel ========== */

function renderAdminPanel(panel) {
  const titleMap = {
    dashboard: 'داشبورد',
    doctors: 'مدیریت پزشکان',
    patients: 'مدیریت بیماران',
    appointments: 'مدیریت نوبت',
    reports: 'گزارش‌گیری',
    admins: 'مدیریت ادمین‌ها'
  };

  document.getElementById('admin-page-title').textContent = titleMap[panel] || 'داشبورد';

  // Update nav active
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === panel);
  });

  const content = document.getElementById('admin-content');
  const renderers = {
    dashboard: renderDashboard,
    doctors: renderDoctors,
    patients: renderPatients,
    appointments: renderAppointments,
    reports: renderReports,
    admins: renderAdmins
  };
  content.innerHTML = '';
  (renderers[panel] || renderDashboard)(content);
}

function renderDashboard(el) {
  const historyCount = getAppointments().filter(a => a.hasHistory).length;
  el.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px;gap:8px">
      <button class="btn btn-ghost" style="min-height:36px;font-size:0.8rem;padding:0 14px" id="btn-reset-demo">بازنشانی داده تست</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">نوبت‌های امروز</div>
        <div class="stat-value">${getAppointments().length}</div>
        <div class="stat-change up">${historyCount} مورد با سابقه جراحی</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">در انتظار</div>
        <div class="stat-value">۱۴</div>
        <div class="stat-change">۳ نفر در صف تزریق</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">پزشکان حاضر</div>
        <div class="stat-value">۵</div>
        <div class="stat-change up">از ۶ پزشک فعال</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">میانگین انتظار</div>
        <div class="stat-value">۱۸<span style="font-size:1rem">د</span></div>
        <div class="stat-change down">-۴ دقیقه</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:20px">
      <div class="panel-card">
        <div class="panel-card-header">
          <h3>نوبت‌های اخیر امروز</h3>
          <button class="btn btn-ghost" style="min-height:36px;font-size:0.85rem;padding:0 14px" onclick="renderAdminPanel('appointments')">مشاهده همه</button>
        </div>
        <div class="panel-card-body" style="padding:0">
          <table class="table">
            <thead>
              <tr>
                <th>کد پذیرش</th>
                <th>بیمار</th>
                <th>پزشک</th>
                <th>ساعت</th>
                <th>سابقه جراحی</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              ${getAppointments().slice(0, 8).map(a => `
                <tr class="${a.hasHistory ? 'row-has-history' : ''}">
                  <td style="font-weight:600;font-variant-numeric:tabular-nums">${a.code}</td>
                  <td>${a.patient}</td>
                  <td>${a.doctor}</td>
                  <td>${a.time}</td>
                  <td>${historyBadge(a.hasHistory)}</td>
                  <td>${statusBadge(a.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-card-header">
          <h3>تقویم هفته</h3>
        </div>
        <div class="panel-card-body">
          <div class="calendar-grid" id="mini-cal"></div>
        </div>
      </div>
    </div>
  `;

  // Simple calendar
  const cal = document.getElementById('mini-cal');
  const days = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  days.forEach(d => {
    const div = document.createElement('div');
    div.className = 'cal-day-name';
    div.textContent = d;
    cal.appendChild(div);
  });
  // Fake days 1-30, today = 25
  for (let i = 1; i <= 30; i++) {
    const div = document.createElement('div');
    div.className = 'cal-day';
    if (i === 25) div.classList.add('today');
    if ([3, 7, 12, 15, 18, 22, 25, 28].includes(i)) div.classList.add('has-appts');
    div.textContent = i;
    cal.appendChild(div);
  }

  const resetBtn = document.getElementById('btn-reset-demo');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('همه نوبت‌ها و بیماران ثبت‌شده در این مرورگر پاک شود و به حالت اولیه برگردد؟')) {
        window.resetDemoData();
        renderAdminPanel('dashboard');
        showToast('داده تست بازنشانی شد');
      }
    });
  }
}


function renderDoctors(el) {
  el.innerHTML = `
    <div class="panel-card">
      <div class="panel-card-header">
        <h3>لیست پزشکان</h3>
        <button class="btn btn-primary" style="min-height:40px;font-size:0.9rem;padding:0 18px" onclick="showToast('در نسخه نهایی فعال می‌شود')">+ افزودن پزشک</button>
      </div>
      <div class="panel-card-body" style="padding:0">
        <table class="table">
          <thead>
            <tr>
              <th>نام</th>
              <th>تخصص</th>
              <th>وضعیت امروز</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            ${DOCTORS.map(d => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="doctor-avatar" style="width:36px;height:36px;font-size:0.9rem;overflow:hidden">
                      ${d.photo
                        ? `<img src="${d.photo}" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.remove();this.parentNode.textContent='${d.initials}'">`
                        : d.initials}
                    </div>
                    <strong>${d.name}</strong>
                  </div>
                </td>
                <td>${d.specialty}</td>
                <td>${d.available
                  ? '<span class="badge badge-green">حاضر</span>'
                  : '<span class="badge badge-red">غایب</span>'}</td>
                <td>
                  <button class="btn btn-ghost" style="min-height:34px;font-size:0.82rem;padding:0 12px" onclick="showToast('ویرایش در نسخه نهایی')">ویرایش</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderPatients(el) {
  el.innerHTML = `
    <div class="panel-card">
      <div class="panel-card-header">
        <h3>بیماران ثبت‌شده</h3>
        <input class="form-input" style="width:220px;height:40px;font-size:0.9rem" placeholder="جستجو نام یا کد ملی..." />
      </div>
      <div class="panel-card-body" style="padding:0">
        <table class="table">
          <thead>
            <tr>
              <th>نام</th>
              <th>کد ملی</th>
              <th>موبایل</th>
              <th>سابقه جراحی</th>
              <th>تعداد مراجعه</th>
            </tr>
          </thead>
          <tbody>
            ${getPatients().map(p => `
              <tr class="${p.hasHistory ? 'row-has-history' : ''}">
                <td>
                  <strong>${p.name}</strong>
                  ${p.hasHistory ? '<div class="history-alert">⚠ سابقه جراحی در مرکز دارد</div>' : ''}
                </td>
                <td style="font-variant-numeric:tabular-nums">${p.nationalId || '—'}</td>
                <td style="font-variant-numeric:tabular-nums">${p.mobile || '—'}</td>
                <td>${historyBadge(p.hasHistory)}</td>
                <td>${p.visits}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAppointments(el) {
  el.innerHTML = `
    <div class="panel-card">
      <div class="panel-card-header">
        <h3>نوبت‌های امروز</h3>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost" style="min-height:36px;font-size:0.85rem;padding:0 14px">فیلتر</button>
          <button class="btn btn-primary" style="min-height:36px;font-size:0.85rem;padding:0 14px" onclick="showToast('چاپ لیست در نسخه نهایی')">چاپ لیست</button>
        </div>
      </div>
      <div class="panel-card-body" style="padding:0">
        <table class="table">
          <thead>
            <tr>
              <th>کد پذیرش</th>
              <th>بیمار</th>
              <th>پزشک</th>
              <th>نوع عمل</th>
              <th>ساعت</th>
              <th>سابقه جراحی</th>
              <th>وضعیت</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${getAppointments().map(a => `
              <tr class="${a.hasHistory ? 'row-has-history' : ''}">
                <td style="font-weight:600">${a.code}</td>
                <td>
                  ${a.patient}
                  ${a.hasHistory ? '<div class="history-alert">⚠ سابقه جراحی در مرکز دارد — پرونده جدید تشکیل نشود</div>' : ''}
                </td>
                <td>${a.doctor}</td>
                <td>${a.type}</td>
                <td>${a.time}</td>
                <td>${historyBadge(a.hasHistory)}</td>
                <td>${statusBadge(a.status)}</td>
                <td>
                  <button class="btn btn-ghost" style="min-height:32px;font-size:0.8rem;padding:0 10px" onclick="showToast('بیمار: ${a.patient} | سابقه: ${a.hasHistory ? 'دارد' : 'ندارد'}')">جزئیات</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderReports(el) {
  el.innerHTML = `
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat-card">
        <div class="stat-label">کل نوبت‌های ماه</div>
        <div class="stat-value">۱٬۲۴۰</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">جراحی چشم</div>
        <div class="stat-value">۶۸۰</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">جراحی زیبایی</div>
        <div class="stat-value">۵۶۰</div>
      </div>
    </div>
    <div class="panel-card">
      <div class="panel-card-header"><h3>گزارش‌های قابل دریافت</h3></div>
      <div class="panel-card-body">
        <div style="display:grid;gap:12px">
          ${[
            'گزارش روزانه نوبت‌ها (Excel)',
            'گزارش حضور پزشکان',
            'آمار تخصص‌ها در بازه زمانی',
            'لیست بیماران با سابقه جراحی'
          ].map(r => `
            <button class="btn btn-ghost" style="justify-content:space-between;min-height:52px;border:1px solid var(--border);border-radius:12px;padding:0 20px" onclick="showToast('دانلود در نسخه نهایی')">
              <span>${r}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderAdmins(el) {
  el.innerHTML = `
    <div class="panel-card">
      <div class="panel-card-header">
        <h3>کاربران ادمین</h3>
        <button class="btn btn-primary" style="min-height:40px;font-size:0.9rem;padding:0 18px" onclick="showToast('افزودن ادمین در نسخه نهایی')">+ افزودن ادمین</button>
      </div>
      <div class="panel-card-body" style="padding:0">
        <table class="table">
          <thead>
            <tr>
              <th>نام</th>
              <th>نقش</th>
              <th>آخرین ورود</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>مدیر سیستم</strong></td>
              <td><span class="badge badge-blue">Super Admin</span></td>
              <td>امروز ۰۸:۱۲</td>
              <td><span class="badge badge-green">فعال</span></td>
            </tr>
            <tr>
              <td><strong>پذیرش ۱</strong></td>
              <td><span class="badge badge-orange">Operator</span></td>
              <td>امروز ۰۷:۴۵</td>
              <td><span class="badge badge-green">فعال</span></td>
            </tr>
            <tr>
              <td><strong>پذیرش ۲</strong></td>
              <td><span class="badge badge-orange">Operator</span></td>
              <td>دیروز ۱۶:۳۰</td>
              <td><span class="badge badge-green">فعال</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function historyBadge(hasHistory) {
  if (hasHistory === true) {
    return '<span class="badge badge-history-yes" title="بیمار سابقه جراحی در این مرکز دارد — پرونده جدید تشکیل نشود">سابقه دارد</span>';
  }
  if (hasHistory === false) {
    return '<span class="badge badge-history-no">بدون سابقه</span>';
  }
  return '<span class="badge badge-orange">نامشخص</span>';
}

function statusBadge(status) {
  const map = {
    waiting: '<span class="badge badge-orange">در انتظار</span>',
    'in-progress': '<span class="badge badge-blue">در حال ویزیت</span>',
    done: '<span class="badge badge-green">انجام‌شده</span>'
  };
  return map[status] || status;
}
