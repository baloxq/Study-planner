const defaultProfile = {
  firstName: 'Olha',
  lastName: 'Balakina',
  email: 'olha.balakina@student.vdu.lt',
  level: 'Year 2, Semester 2',
  program: 'Internet Technology',
  university: 'Vytautas Magnus University'
};

const initialTasks = [
  {title:'Complete Math Assignment', subject:'Mathematics', date:'2026-04-18', priority:'high', type:'Homework', done:false},
  {title:'Biology Chapter Summary', subject:'Biology', date:'2026-04-19', priority:'medium', type:'Lecture Review', done:false},
  {title:'History Essay Draft', subject:'History', date:'2026-04-21', priority:'high', type:'Essay', done:false},
  {title:'Physics Lab Upload', subject:'Physics', date:'2026-04-23', priority:'low', type:'Lab', done:true}
];

let tasks = JSON.parse(localStorage.getItem('studyPlannerTasks') || 'null') || initialTasks;
let profile = JSON.parse(localStorage.getItem('studyPlannerProfile') || 'null') || defaultProfile;
let selectedImage = 0;

function saveTasks(){ localStorage.setItem('studyPlannerTasks', JSON.stringify(tasks)); }
function saveProfile(){ localStorage.setItem('studyPlannerProfile', JSON.stringify(profile)); }

function applySavedPreferences(){
  const darkMode = localStorage.getItem('studyPlannerDark') === 'true';
  const accent = localStorage.getItem('studyPlannerAccent') || '#4f46e5';
  const baseSize = localStorage.getItem('studyPlannerFontSize') || '16';
  document.body.classList.toggle('dark', darkMode);
  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--base-size', baseSize + 'px');
  document.querySelectorAll('.dark-toggle').forEach(el => el.checked = darkMode);
  document.querySelectorAll('.accent-select').forEach(el => el.value = accent);
  document.querySelectorAll('.font-range').forEach(el => el.value = baseSize);
  updateFontValue(baseSize);
}

function initProfileCards(){
  document.querySelectorAll('[data-profile]').forEach(holder => {
    holder.innerHTML = `
      <div class="profile-top">
        <div class="avatar">${profile.firstName[0] || 'S'}${profile.lastName[0] || ''}</div>
        <div>
          <h3>${profile.firstName} ${profile.lastName}</h3>
          <div class="muted">${profile.program}</div>
        </div>
      </div>
      <div class="profile-view">
        <dl>
          <dt>Email</dt><dd>${profile.email}</dd>
          <dt>Study level</dt><dd>${profile.level}</dd>
          <dt>Study program</dt><dd>${profile.program}</dd>
          <dt>University</dt><dd>${profile.university}</dd>
        </dl>
      </div>
      <div class="profile-form ${holder.dataset.editing === 'true' ? 'active' : ''}">
        <div class="row-2">
          <input name="firstName" value="${profile.firstName}" placeholder="Name">
          <input name="lastName" value="${profile.lastName}" placeholder="Surname">
        </div>
        <input name="email" value="${profile.email}" placeholder="Email">
        <input name="level" value="${profile.level}" placeholder="Year and semester">
        <input name="program" value="${profile.program}" placeholder="Study program">
        <input name="university" value="${profile.university}" placeholder="University">
        <div class="form-actions">
          <button class="btn" type="button" onclick="saveProfileFromCard(this)">Save profile</button>
          <button class="btn secondary" type="button" onclick="toggleProfileEdit(this)">Cancel</button>
        </div>
      </div>
      <button class="btn secondary full" type="button" onclick="toggleProfileEdit(this)">${holder.dataset.editing === 'true' ? 'Close editor' : 'Edit profile'}</button>
    `;
  });
}

function toggleProfileEdit(button){
  const card = button.closest('[data-profile]') || button.closest('.profile-card');
  const form = card.querySelector('.profile-form');
  const editBtn = card.querySelector('.btn.secondary.full');
  form.classList.toggle('active');
  editBtn.textContent = form.classList.contains('active') ? 'Close editor' : 'Edit profile';
}

function saveProfileFromCard(button){
  const card = button.closest('[data-profile]') || button.closest('.profile-card');
  ['firstName','lastName','email','level','program','university'].forEach(key => {
    profile[key] = card.querySelector(`[name="${key}"]`).value.trim();
  });
  saveProfile();
  initProfileCards();
  bindPreferenceControls();
}

function bindPreferenceControls(){
  document.querySelectorAll('.dark-toggle').forEach(toggle => {
    toggle.onchange = () => {
      document.body.classList.toggle('dark', toggle.checked);
      localStorage.setItem('studyPlannerDark', String(toggle.checked));
      document.querySelectorAll('.dark-toggle').forEach(el => el.checked = toggle.checked);
    };
  });
  document.querySelectorAll('.accent-select').forEach(select => {
    select.onchange = () => {
      document.documentElement.style.setProperty('--accent', select.value);
      localStorage.setItem('studyPlannerAccent', select.value);
      document.querySelectorAll('.accent-select').forEach(el => el.value = select.value);
    };
  });
  document.querySelectorAll('.font-range').forEach(range => {
    range.oninput = () => {
      document.documentElement.style.setProperty('--base-size', range.value + 'px');
      localStorage.setItem('studyPlannerFontSize', range.value);
      document.querySelectorAll('.font-range').forEach(el => el.value = range.value);
      updateFontValue(range.value);
    };
  });
}

function updateFontValue(value){
  document.querySelectorAll('.range-value').forEach(el => el.textContent = value + 'px');
}

function renderTasks(listEl){
  if(!listEl) return;
  listEl.innerHTML = '';
  const filter = listEl.dataset.filter || 'all';
  const current = tasks.filter(t => {
    if(filter === 'done') return t.done;
    if(filter === 'todo') return !t.done;
    return true;
  });

  current.forEach((task, index) => listEl.appendChild(taskRow(task, index)));
  if(!current.length){
    listEl.innerHTML = '<div class="note">No tasks match this view yet. Add a new task to demonstrate the MVP workflow.</div>';
  }
  updateStats();
}

function taskRow(task, index){
  const row = document.createElement('article');
  row.className = 'task';
  row.innerHTML = `
    <div class="left">
      <input type="checkbox" ${task.done ? 'checked' : ''} aria-label="mark completed">
      <div>
        <div class="title">${task.title}</div>
        <div class="meta">${task.subject} • ${task.type} • Due ${formatDate(task.date)}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag ${task.priority}">${capitalize(task.priority)}</span>
          <span class="tag ${task.done ? 'done' : 'low'}">${task.done ? 'Completed' : 'Active'}</span>
        </div>
      </div>
    </div>
    <div class="task-actions">
      <button class="icon-btn" title="duplicate" aria-label="duplicate task">📄</button>
      <button class="icon-btn" title="delete" aria-label="delete task">🗑️</button>
    </div>
  `;
  row.querySelector('input').onchange = (e) => {
    task.done = e.target.checked;
    saveTasks();
    refreshAll();
  };
  row.querySelectorAll('.icon-btn')[0].onclick = () => {
    tasks.unshift({...task, title: task.title + ' (copy)', done:false});
    saveTasks();
    refreshAll();
  };
  row.querySelectorAll('.icon-btn')[1].onclick = () => {
    tasks.splice(index, 1);
    saveTasks();
    refreshAll();
  };
  return row;
}

function formatDate(dateStr){
  return new Date(dateStr).toLocaleDateString('en-GB', {day:'2-digit', month:'short'});
}
function capitalize(word){ return word.charAt(0).toUpperCase() + word.slice(1); }

function toggleForm(){
  const box = document.getElementById('taskFormWrap');
  if(box) box.classList.toggle('hidden');
}

function addTask(e){
  e.preventDefault();
  const title = document.getElementById('f_title').value.trim();
  const subject = document.getElementById('f_subject').value.trim();
  const date = document.getElementById('f_date').value;
  const priority = document.getElementById('f_priority').value;
  const type = document.getElementById('f_type').value;
  if(!title || !subject || !date) return;
  tasks.unshift({title, subject, date, priority, type, done:false});
  saveTasks();
  e.target.reset();
  toggleForm();
  refreshAll();
}

function updateStats(){
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const active = tasks.filter(t => !t.done).length;
  const high = tasks.filter(t => t.priority === 'high').length;
  document.querySelectorAll('[data-stat="total"]').forEach(el => el.textContent = total);
  document.querySelectorAll('[data-stat="done"]').forEach(el => el.textContent = done);
  document.querySelectorAll('[data-stat="active"]').forEach(el => el.textContent = active);
  document.querySelectorAll('[data-stat="high"]').forEach(el => el.textContent = high);
}

function renderCalendar(){
  const grid = document.getElementById('calGrid');
  if(!grid) return;
  grid.innerHTML = '';
  const days = 30;
  for(let i = 1; i <= days; i++){
    const day = document.createElement('div');
    day.className = 'day';
    day.innerHTML = `<div class="num">${i}</div>`;
    tasks.forEach(task => {
      const d = new Date(task.date).getDate();
      if(d === i){
        const event = document.createElement('div');
        event.className = 'event ' + task.priority;
        event.textContent = task.title;
        day.appendChild(event);
      }
    });
    grid.appendChild(day);
  }
}

function showPreviewMessage(type){
  const box = document.getElementById('previewMessage');
  if(!box) return;
  const messages = {
    dashboard: 'The dashboard centralizes the main MVP actions: overview, add task, monitor deadlines, and continue your daily planning.',
    calendar: 'The calendar view helps the student quickly understand workload distribution and avoid deadline collisions.',
    profile: 'The profile card keeps student identity and study context visible, and it can be edited instantly with no page reload.',
    analytics: 'Progress visuals make the MVP feel real by showing completion rate, priority load, and weekly study trends.',
    tasks: 'The task board demonstrates the core planning loop: create, review, prioritize, complete, and update.'
  };
  box.textContent = messages[type] || messages.dashboard;
  document.querySelectorAll('.visual-card').forEach(card => card.classList.toggle('active', card.dataset.visual === type));
}

function cycleGreeting(){
  const target = document.getElementById('dynamicGreeting');
  if(!target) return;
  const messages = [
    'Stay consistent and finish one important task first.',
    'Use the planner to break large deadlines into smaller actions.',
    'A simple weekly overview can prevent last-minute stress.'
  ];
  let index = Number(target.dataset.index || 0);
  index = (index + 1) % messages.length;
  target.dataset.index = index;
  target.textContent = messages[index];
}

function filterTasks(mode){
  document.querySelectorAll('#taskList,[data-role="tasks-list"]').forEach(list => {
    list.dataset.filter = mode;
    renderTasks(list);
  });
}

function refreshAll(){
  document.querySelectorAll('#taskList,[data-role="tasks-list"]').forEach(renderTasks);
  renderCalendar();
}

document.addEventListener('DOMContentLoaded', () => {
  applySavedPreferences();
  initProfileCards();
  bindPreferenceControls();
  showPreviewMessage('dashboard');
  refreshAll();
});
