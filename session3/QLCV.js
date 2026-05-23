const STORAGE_KEY = 'taskboard_tasks';
let tasks = [];
let editingId = null;

const taskListEl = document.getElementById('task-list');
const emptyStateEl = document.getElementById('empty-state');
const toastEl = document.getElementById('toast');

const overlay = document.getElementById('overlay');
const popup = document.getElementById('task-form-popup');
const formTitleEl = document.getElementById('form-title');

const btnOpenForm = document.getElementById('btn-open-form');
const btnCloseForm = document.getElementById('btn-close-form');
const btnCancel = document.getElementById('btn-cancel');

const taskForm = document.getElementById('task-form');
const editIdInput = document.getElementById('edit-id');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const dueInput = document.getElementById('task-due');
const priorityInput = document.getElementById('task-priority');
const errTitle = document.getElementById('err-title');

const statTotal = document.getElementById('stat-total');
const statDone = document.getElementById('stat-done');
const statPending = document.getElementById('stat-pending');

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function renderTasks() {
    taskListEl.innerHTML = '';

    if (tasks.length === 0) {
        emptyStateEl.classList.remove('hidden');
        updateTaskSummary();
        return;
    }

    emptyStateEl.classList.add('hidden');

    tasks.forEach(task => {
        const card = createTaskCard(task);
        taskListEl.appendChild(card);
    });

    updateTaskSummary();
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.classList.add('task-card');
    if (task.done) card.classList.add('done');
    card.dataset.id = task.id;

    const priorityLabels = { high: ' Cao', medium: ' Trung bình', low: ' Thấp' };
    const badgeClass = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

    let dueHtml = '';
    if (task.due) {
        const today = new Date().toISOString().slice(0, 10);
        const isOverdue = !task.done && task.due < today;
        dueHtml = `<span class="due-date ${isOverdue ? 'overdue' : ''}">
                 📅 ${formatDate(task.due)}${isOverdue ? ' (Quá hạn)' : ''}
               </span>`;
    }

    card.innerHTML = `
    <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''}/>
    <div class="task-body">
      <div class="task-header">
        <span class="task-title">${escapeHtml(task.title)}</span>
        <span class="badge ${badgeClass[task.priority]}">${priorityLabels[task.priority]}</span>
      </div>
      ${task.desc ? `<p class="task-desc">${escapeHtml(task.desc)}</p>` : ''}
      <div class="task-meta">${dueHtml}</div>
    </div>
    <div class="task-actions">
      <button class="btn-icon btn-edit">✏️ Sửa</button>
      <button class="btn-icon btn-delete">🗑 Xóa</button>
    </div>
  `;

    card.querySelector('.task-checkbox').addEventListener('change', () => toggleDone(task.id));
    card.querySelector('.btn-edit').addEventListener('click', () => openEditForm(task.id));
    card.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));

    return card;
}

function updateTaskSummary() {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pending = total - done;

    statTotal.textContent = total;
    statDone.textContent = done;
    statPending.textContent = pending;
}

function openAddForm() {
    editingId = null;
    editIdInput.value = '';
    formTitleEl.textContent = 'Thêm công việc';
    taskForm.reset();
    errTitle.textContent = '';
    showPopup();
}

function openEditForm(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingId = id;
    editIdInput.value = id;
    formTitleEl.textContent = 'Sửa công việc';

    titleInput.value = task.title;
    descInput.value = task.desc || '';
    dueInput.value = task.due || '';
    priorityInput.value = task.priority;

    errTitle.textContent = '';
    showPopup();
}

function showPopup() {
    popup.classList.remove('hidden');
    overlay.classList.remove('hidden');
    titleInput.focus();
}

function hidePopup() {
    popup.classList.add('hidden');
    overlay.classList.add('hidden');
    taskForm.reset();
    errTitle.textContent = '';
    editingId = null;
}

function handleFormSubmit(e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    if (!title) {
        errTitle.textContent = 'Vui lòng nhập tiêu đề công việc.';
        titleInput.focus();
        return;
    }
    errTitle.textContent = '';

    const formData = {
        title,
        desc: descInput.value.trim(),
        due: dueInput.value,
        priority: priorityInput.value,
    };

    if (editingId) {
        const index = tasks.findIndex(t => t.id === editingId);
        if (index !== -1) tasks[index] = { ...tasks[index], ...formData };
        showMessage('Đã cập nhật công việc!');
    } else {
        tasks.push({ id: generateId(), done: false, ...formData });
        showMessage('Đã thêm công việc mới!');
    }

    saveTasks();
    renderTasks();
    hidePopup();
}

function deleteTask(id) {
    if (!window.confirm('Bạn có chắc muốn xóa công việc này không?')) return;

    tasks = tasks.filter(t => t.id !== id);

    saveTasks();
    renderTasks();
    showMessage('Đã xóa công việc.');
}

function toggleDone(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.done = !task.done;

    saveTasks();
    renderTasks();
    showMessage(task.done ? 'Đã đánh dấu hoàn thành! ✅' : 'Đã bỏ đánh dấu hoàn thành.');
}

let toastTimer = null;

function showMessage(msg, type = 'success') {
    if (toastTimer) clearTimeout(toastTimer);

    toastEl.textContent = msg;
    toastEl.className = `toast ${type}`;

    toastTimer = setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 2500);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str).replace(/[&<>"']/g, ch => map[ch]);
}

btnOpenForm.addEventListener('click', openAddForm);

btnCloseForm.addEventListener('click', hidePopup);
btnCancel.addEventListener('click', hidePopup);
overlay.addEventListener('click', hidePopup);

taskForm.addEventListener('submit', handleFormSubmit);

tasks = loadTasks();
renderTasks();