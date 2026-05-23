const STORAGE_KEY = 'sinhVienData';
let students = [];
let editingId = null;
let deleteId = null;

const defaultData = [
  { id: '1', maSV: 'SV001', hoTen: 'Nguyễn Văn An', ngaySinh: '2002-05-14', lopHoc: 'CNTT01', email: 'an.nv@email.com', diemTB: 8.5 },
  { id: '2', maSV: 'SV002', hoTen: 'Trần Thị Bích', ngaySinh: '2003-08-22', lopHoc: 'CNTT01', email: 'bich.tt@email.com', diemTB: 7.2 },
  { id: '3', maSV: 'SV003', hoTen: 'Lê Quang Cường', ngaySinh: '2002-11-30', lopHoc: 'CNTT02', email: 'cuong.lq@email.com', diemTB: 9.1 },
  { id: '4', maSV: 'SV004', hoTen: 'Phạm Minh Đức', ngaySinh: '2003-01-07', lopHoc: 'CNTT02', email: 'duc.pm@email.com', diemTB: 5.8 },
];

function loadStudents() {
  const raw = localStorage.getItem(STORAGE_KEY);
  students = raw ? JSON.parse(raw) : [...defaultData];
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function updateStatistics() {
  const n = students.length;
  document.getElementById('statTotal').textContent = n;

  if (n === 0) {
    document.getElementById('statAvg').textContent = '—';
    document.getElementById('statGood').textContent = '0';
    return;
  }

  const avg = students.reduce((sum, sv) => sum + parseFloat(sv.diemTB), 0) / n;
  const good = students.filter(sv => parseFloat(sv.diemTB) >= 8).length;

  document.getElementById('statAvg').textContent = avg.toFixed(2);
  document.getElementById('statGood').textContent = good;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function renderStudents(list) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-msg">Không có dữ liệu</td></tr>';
    return;
  }

  list.forEach(sv => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${sv.maSV}</td>
      <td>${sv.hoTen}</td>
      <td>${formatDate(sv.ngaySinh)}</td>
      <td>${sv.lopHoc}</td>
      <td>${sv.email}</td>
      <td>${parseFloat(sv.diemTB).toFixed(1)}</td>
      <td>
        <button class="btn-edit" data-id="${sv.id}">Sửa</button>
        <button class="btn-del" data-id="${sv.id}">Xóa</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function refreshTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = q
    ? students.filter(sv =>
        sv.hoTen.toLowerCase().includes(q) ||
        sv.maSV.toLowerCase().includes(q) ||
        sv.lopHoc.toLowerCase().includes(q))
    : students;
  renderStudents(filtered);
}

let notifTimer;

function showNotif(msg, type = 'success') {
  const el = document.getElementById('notification');
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => { el.className = ''; }, 3000);
}

function openForm(title, btnLabel) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('btnSaveForm').textContent = btnLabel;
  clearErrors();
  document.getElementById('formOverlay').classList.add('active');
}

function closeForm() {
  document.getElementById('formOverlay').classList.remove('active');
  resetForm();
  editingId = null;
}

function resetForm() {
  ['maSV', 'hoTen', 'ngaySinh', 'lopHoc', 'email', 'diemTB'].forEach(id => {
    document.getElementById(id).value = '';
  });
  clearErrors();
}

function fillForm(sv) {
  document.getElementById('maSV').value = sv.maSV;
  document.getElementById('hoTen').value = sv.hoTen;
  document.getElementById('ngaySinh').value = sv.ngaySinh;
  document.getElementById('lopHoc').value = sv.lopHoc;
  document.getElementById('email').value = sv.email;
  document.getElementById('diemTB').value = sv.diemTB;
}

function getFormData() {
  return {
    maSV: document.getElementById('maSV').value.trim(),
    hoTen: document.getElementById('hoTen').value.trim(),
    ngaySinh: document.getElementById('ngaySinh').value,
    lopHoc: document.getElementById('lopHoc').value.trim(),
    email: document.getElementById('email').value.trim(),
    diemTB: parseFloat(document.getElementById('diemTB').value),
  };
}

function clearErrors() {
  ['fg-maSV', 'fg-hoTen', 'fg-ngaySinh', 'fg-lopHoc', 'fg-email', 'fg-diemTB'].forEach(id => {
    document.getElementById(id).classList.remove('error');
  });
}

function validateForm() {
  clearErrors();
  let isValid = true;

  if (document.getElementById('maSV').value.trim() === '') {
    document.getElementById('fg-maSV').classList.add('error');
    isValid = false;
  }

  if (document.getElementById('hoTen').value.trim() === '') {
    document.getElementById('fg-hoTen').classList.add('error');
    isValid = false;
  }

  if (document.getElementById('ngaySinh').value === '') {
    document.getElementById('fg-ngaySinh').classList.add('error');
    isValid = false;
  }

  if (document.getElementById('lopHoc').value.trim() === '') {
    document.getElementById('fg-lopHoc').classList.add('error');
    isValid = false;
  }

  const emailVal = document.getElementById('email').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailVal)) {
    document.getElementById('fg-email').classList.add('error');
    isValid = false;
  }

  const diemVal = document.getElementById('diemTB').value;
  if (diemVal === '' || isNaN(diemVal) || +diemVal < 0 || +diemVal > 10) {
    document.getElementById('fg-diemTB').classList.add('error');
    isValid = false;
  }

  return isValid;
}

function isMaSVDuplicate(maSV) {
  return students.some(sv => sv.maSV === maSV);
}

document.getElementById('btnOpenForm').addEventListener('click', () => {
  editingId = null;
  resetForm();
  openForm('Thêm sinh viên', 'Lưu');
});

document.getElementById('btnCloseForm').addEventListener('click', closeForm);
document.getElementById('btnCancelForm').addEventListener('click', closeForm);

document.getElementById('formOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeForm();
});

document.getElementById('btnSaveForm').addEventListener('click', () => {
  if (!validateForm()) return;

  const data = getFormData();

  if (editingId) {
    const idx = students.findIndex(sv => sv.id === editingId);
    students[idx] = { ...students[idx], ...data };
    showNotif('Cập nhật thành công: ' + data.hoTen);

  } else {
    if (isMaSVDuplicate(data.maSV)) {
      const fg = document.getElementById('fg-maSV');
      fg.classList.add('error');
      fg.querySelector('.field-error').textContent = 'Mã sinh viên đã tồn tại';
      return;
    }

    students.push({ id: Date.now().toString(), ...data });
    showNotif('Đã thêm sinh viên: ' + data.hoTen);
  }

  saveStudents();
  refreshTable();
  updateStatistics();
  closeForm();
});

document.getElementById('tableBody').addEventListener('click', function (e) {
  const editBtn = e.target.closest('.btn-edit');
  const delBtn = e.target.closest('.btn-del');

  if (editBtn) {
    const sv = students.find(s => s.id === editBtn.dataset.id);
    if (!sv) return;
    editingId = sv.id;
    fillForm(sv);
    openForm('Cập nhật sinh viên', 'Cập nhật');
  }

  if (delBtn) {
    const sv = students.find(s => s.id === delBtn.dataset.id);
    if (!sv) return;
    deleteId = sv.id;
    document.getElementById('confirmName').textContent = sv.hoTen;
    document.getElementById('confirmOverlay').classList.add('active');
  }
});

document.getElementById('btnConfirmDelete').addEventListener('click', () => {
  const sv = students.find(s => s.id === deleteId);
  students = students.filter(s => s.id !== deleteId);
  saveStudents();
  refreshTable();
  updateStatistics();
  showNotif('Đã xóa: ' + (sv ? sv.hoTen : ''), 'error');
  document.getElementById('confirmOverlay').classList.remove('active');
  deleteId = null;
});

document.getElementById('btnCancelDelete').addEventListener('click', () => {
  document.getElementById('confirmOverlay').classList.remove('active');
  deleteId = null;
});

document.getElementById('confirmOverlay').addEventListener('click', function (e) {
  if (e.target === this) {
    this.classList.remove('active');
    deleteId = null;
  }
});

document.getElementById('searchInput').addEventListener('input', refreshTable);

loadStudents();
refreshTable();
updateStatistics();