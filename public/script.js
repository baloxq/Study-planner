const API = '';
const defaultProfile = {
  firstName: 'Guest', lastName: 'User', email: 'guest@student.lt',
  level: 'Year 2, Semester 2', program: 'Internet Technology', university: 'Vytautas Magnus University', role: 'random user'
};
const initialTasks = [
  {id:'demo1', title:'Complete Math Assignment', subject:'Mathematics', date:'2026-04-18', priority:'high', type:'Homework', done:false},
  {id:'demo2', title:'Biology Chapter Summary', subject:'Biology', date:'2026-04-19', priority:'medium', type:'Lecture Review', done:false},
  {id:'demo3', title:'History Essay Draft', subject:'History', date:'2026-04-21', priority:'high', type:'Essay', done:false},
  {id:'demo4', title:'Physics Lab Upload', subject:'Physics', date:'2026-04-23', priority:'low', type:'Lab', done:true}
];
let tasks = [];
let profile = JSON.parse(localStorage.getItem('studyPlannerProfile') || 'null') || defaultProfile;
let currentSearch = '';
const token = () => localStorage.getItem('studyPlannerToken') || '';
const isLoggedIn = () => Boolean(token());
const esc = (v='') => String(v).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

function setMessage(id, message='', ok=false){ const el=document.getElementById(id); if(el){ el.textContent=message; el.classList.toggle('success', ok); } }
async function api(path, options={}){
  const headers = {'Content-Type':'application/json', ...(options.headers||{})};
  if(token()) headers.Authorization = 'Bearer ' + token();
  const res = await fetch(API + path, {...options, headers});
  const data = await res.json().catch(() => ({}));
  if(!res.ok || data.error) throw new Error(data.error || 'Request failed.');
  return data;
}

async function registerUser(e){
  e.preventDefault(); setMessage('authMessage','');
  try{
    const data = await api('/api/auth/register',{method:'POST', body:JSON.stringify({
      name:document.getElementById('reg-name').value,
      email:document.getElementById('reg-email').value,
      password:document.getElementById('reg-password').value
    })});
    localStorage.setItem('studyPlannerToken', data.token);
    localStorage.setItem('studyPlannerProfile', JSON.stringify(toProfile(data.user)));
    location.href='dashboard.html';
  }catch(err){ setMessage('authMessage', err.message); }
}
async function loginUser(e){
  e.preventDefault(); setMessage('authMessage','');
  try{
    const data = await api('/api/auth/login',{method:'POST', body:JSON.stringify({
      email:document.getElementById('email').value,
      password:document.getElementById('password').value
    })});
    localStorage.setItem('studyPlannerToken', data.token);
    localStorage.setItem('studyPlannerProfile', JSON.stringify(toProfile(data.user)));
    location.href='dashboard.html';
  }catch(err){ setMessage('authMessage', err.message); }
}
function toProfile(user){
  const parts = String(user.name || 'Student User').split(' ');
  return {firstName:parts[0]||'Student', lastName:parts.slice(1).join(' ')||'', email:user.email||'', level:user.level||defaultProfile.level, program:user.program||defaultProfile.program, university:user.university||defaultProfile.university, role:user.role||'registered'};
}
function logout(){ localStorage.removeItem('studyPlannerToken'); location.href='index.html'; }

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
      <div class="profile-top"><div class="avatar">${esc((profile.firstName||'S')[0])}${esc((profile.lastName||'')[0]||'')}</div><div><h3>${esc(profile.firstName)} ${esc(profile.lastName)}</h3><div class="muted">${esc(profile.role || 'registered user')}</div></div></div>
      <div class="profile-view"><dl><dt>Email</dt><dd>${esc(profile.email)}</dd><dt>Study level</dt><dd>${esc(profile.level)}</dd><dt>Study program</dt><dd>${esc(profile.program)}</dd><dt>University</dt><dd>${esc(profile.university)}</dd></dl></div>
      <div class="profile-form"><div class="row-2"><input name="firstName" value="${esc(profile.firstName)}" placeholder="Name"><input name="lastName" value="${esc(profile.lastName)}" placeholder="Surname"></div><input name="level" value="${esc(profile.level)}" placeholder="Year and semester"><input name="program" value="${esc(profile.program)}" placeholder="Study program"><input name="university" value="${esc(profile.university)}" placeholder="University"><div class="form-actions"><button class="btn" type="button" onclick="saveProfileFromCard(this)">Save profile</button><button class="btn secondary" type="button" onclick="toggleProfileEdit(this)">Cancel</button></div></div>
      <button class="btn secondary full" type="button" onclick="toggleProfileEdit(this)">Edit profile</button>`;
  });
  document.querySelectorAll('.logout a').forEach(a => { a.href='#'; a.onclick=(e)=>{e.preventDefault(); logout();}; });
}
function toggleProfileEdit(button){ const card=button.closest('[data-profile]')||button.closest('.profile-card'); const form=card.querySelector('.profile-form'); form.classList.toggle('active'); card.querySelector('.btn.secondary.full').textContent=form.classList.contains('active')?'Close editor':'Edit profile'; }
async function saveProfileFromCard(button){
  const card = button.closest('[data-profile]') || button.closest('.profile-card');
  ['firstName','lastName','level','program','university'].forEach(key => { const el=card.querySelector(`[name="${key}"]`); if(el) profile[key]=el.value.trim(); });
  saveProfile();
  if(isLoggedIn()){
    try{ await api('/api/auth/profile',{method:'PUT',body:JSON.stringify({name:`${profile.firstName} ${profile.lastName}`.trim(), program:profile.program, university:profile.university, level:profile.level})}); }catch(err){ alert(err.message); }
  }
  initProfileCards(); bindPreferenceControls();
}
function bindPreferenceControls(){
  document.querySelectorAll('.dark-toggle').forEach(toggle => toggle.onchange = () => { document.body.classList.toggle('dark', toggle.checked); localStorage.setItem('studyPlannerDark', String(toggle.checked)); document.querySelectorAll('.dark-toggle').forEach(el => el.checked = toggle.checked); });
  document.querySelectorAll('.accent-select').forEach(select => select.onchange = () => { document.documentElement.style.setProperty('--accent', select.value); localStorage.setItem('studyPlannerAccent', select.value); document.querySelectorAll('.accent-select').forEach(el => el.value = select.value); });
  document.querySelectorAll('.font-range').forEach(range => range.oninput = () => { document.documentElement.style.setProperty('--base-size', range.value + 'px'); localStorage.setItem('studyPlannerFontSize', range.value); document.querySelectorAll('.font-range').forEach(el => el.value = range.value); updateFontValue(range.value); });
}
function updateFontValue(value){ document.querySelectorAll('.range-value').forEach(el => el.textContent = value + 'px'); }

async function loadTasks(){
  if(!isLoggedIn()){ tasks = initialTasks; renderLoaded(); return; }
  const list = document.querySelector('[data-role="tasks-list"]');
  const filter = list ? (list.dataset.filter || 'all') : 'all';
  const query = new URLSearchParams({status: filter, search: currentSearch});
  try{ tasks = await api('/api/tasks?' + query.toString()); setMessage('taskMessage', currentSearch && !tasks.length ? 'Not found' : '', false); }
  catch(err){ setMessage('taskMessage', err.message); tasks=[]; }
  renderLoaded();
}
function renderLoaded(){ document.querySelectorAll('#taskList,[data-role="tasks-list"]').forEach(renderTasks); renderCalendar(); updateStats(); }
function renderTasks(listEl){
  if(!listEl) return; listEl.innerHTML='';
  let current = isLoggedIn() ? tasks : initialTasks.filter(t => !currentSearch || t.title.toLowerCase().includes(currentSearch.toLowerCase()));
  const filter = listEl.dataset.filter || 'all';
  if(!isLoggedIn()) current = current.filter(t => filter==='done'?t.done:filter==='todo'?!t.done:true);
  if(!current.length){ listEl.innerHTML = `<div class="note">${currentSearch ? 'Not found' : (isLoggedIn() ? 'No tasks match this view yet. Add a task to write it to the database.' : 'Login or register to create, edit and delete database tasks. Demo tasks are shown for random users.')}</div>`; return; }
  current.forEach(task => listEl.appendChild(taskRow(task)));
}
function taskRow(task){
  const row=document.createElement('article'); row.className='task';
  row.innerHTML=`<div class="left"><input type="checkbox" ${task.done?'checked':''} aria-label="mark completed"><div><div class="title">${esc(task.title)}</div><div class="meta">${esc(task.subject)} • ${esc(task.type)} • Due ${formatDate(task.date)}</div><div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><span class="tag ${esc(task.priority)}">${capitalize(task.priority)}</span><span class="tag ${task.done?'done':'low'}">${task.done?'Completed':'Active'}</span></div></div></div><div class="task-actions"><button class="icon-btn" title="edit" aria-label="edit task">✏️</button><button class="icon-btn" title="duplicate" aria-label="duplicate task">📄</button><button class="icon-btn" title="delete" aria-label="delete task">🗑️</button></div>`;
  row.querySelector('input').onchange = async e => { await updateTask({...task, done:e.target.checked}); };
  row.querySelectorAll('.icon-btn')[0].onclick = () => showTaskEditor(row, task);
  row.querySelectorAll('.icon-btn')[1].onclick = async () => { await createTask({...task, title: task.title + ' (copy)', done:false}); };
  row.querySelectorAll('.icon-btn')[2].onclick = async () => { if(confirm('Delete this task?')) await deleteTask(task.id); };
  return row;
}
function showTaskEditor(row, task){
  row.innerHTML=`<form class="task-edit-form" onsubmit="saveTaskEdit(event, ${Number(task.id) || 0})"><div class="full"><label>Task title</label><input class="input" name="title" value="${esc(task.title)}" required></div><div><label>Subject</label><input class="input" name="subject" value="${esc(task.subject)}" required></div><div><label>Type</label><select class="input" name="type">${['Homework','Lecture Review','Exam','Lab','Essay'].map(t=>`<option ${t===task.type?'selected':''}>${t}</option>`).join('')}</select></div><div><label>Priority</label><select class="input" name="priority">${['medium','high','low'].map(p=>`<option value="${p}" ${p===task.priority?'selected':''}>${capitalize(p)}</option>`).join('')}</select></div><div><label>Due date</label><input class="input" type="date" name="date" value="${esc(task.date)}" required></div><div class="full form-actions"><button class="btn" type="submit">Save changes</button><button class="btn secondary" type="button" onclick="loadTasks()">Cancel</button></div></form>`;
}
async function saveTaskEdit(e,id){ e.preventDefault(); const f=e.target; await updateTask({id,title:f.title.value,subject:f.subject.value,type:f.type.value,priority:f.priority.value,date:f.date.value,done:tasks.find(t=>Number(t.id)===id)?.done||false}); }
async function createTask(task){ if(!isLoggedIn()){ setMessage('taskMessage','Please login first to write tasks to the database.'); return; } try{ await api('/api/tasks',{method:'POST',body:JSON.stringify(task)}); await loadTasks(); }catch(err){ setMessage('taskMessage',err.message); } }
async function updateTask(task){ if(!isLoggedIn()){ setMessage('taskMessage','Please login first to update database tasks.'); return; } try{ await api('/api/tasks/'+task.id,{method:'PUT',body:JSON.stringify(task)}); await loadTasks(); }catch(err){ setMessage('taskMessage',err.message); } }
async function deleteTask(id){ if(!isLoggedIn()){ setMessage('taskMessage','Please login first to delete database tasks.'); return; } try{ await api('/api/tasks/'+id,{method:'DELETE'}); await loadTasks(); }catch(err){ setMessage('taskMessage',err.message); } }
function toggleForm(){ const box=document.getElementById('taskFormWrap'); if(box) box.classList.toggle('hidden'); }
async function addTask(e){ e.preventDefault(); const f=e.target; await createTask({title:f.querySelector('#f_title').value, subject:f.querySelector('#f_subject').value, date:f.querySelector('#f_date').value, priority:f.querySelector('#f_priority').value, type:f.querySelector('#f_type').value, done:false}); f.reset(); const box=document.getElementById('taskFormWrap'); if(box) box.classList.add('hidden'); }
function searchTasks(e){ e.preventDefault(); const input=e.target.querySelector('input[type="search"]'); currentSearch=input.value.trim(); document.querySelectorAll('.search-form input[type="search"]').forEach(i=>i.value=currentSearch); loadTasks(); }
function clearTaskSearch(){ currentSearch=''; document.querySelectorAll('.search-form input[type="search"]').forEach(i=>i.value=''); loadTasks(); }
function filterTasks(mode){ document.querySelectorAll('#taskList,[data-role="tasks-list"]').forEach(list => list.dataset.filter = mode); loadTasks(); }
function updateStats(){ const all=isLoggedIn()?tasks:initialTasks; document.querySelectorAll('[data-stat="total"]').forEach(el=>el.textContent=all.length); document.querySelectorAll('[data-stat="done"]').forEach(el=>el.textContent=all.filter(t=>t.done).length); document.querySelectorAll('[data-stat="active"]').forEach(el=>el.textContent=all.filter(t=>!t.done).length); document.querySelectorAll('[data-stat="high"]').forEach(el=>el.textContent=all.filter(t=>t.priority==='high').length); }
function formatDate(dateStr){ const d=new Date(dateStr); return isNaN(d)?esc(dateStr):d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'}); }
function capitalize(word=''){ return word.charAt(0).toUpperCase()+word.slice(1); }
function renderCalendar(){ const grid=document.getElementById('calGrid'); if(!grid) return; grid.innerHTML=''; const source=isLoggedIn()?tasks:initialTasks; for(let i=1;i<=30;i++){ const day=document.createElement('div'); day.className='day'; day.innerHTML=`<div class="num">${i}</div>`; source.forEach(task=>{ const d=new Date(task.date).getDate(); if(d===i){ const ev=document.createElement('div'); ev.className='event '+task.priority; ev.textContent=task.title; day.appendChild(ev); }}); grid.appendChild(day); } }
function showPreviewMessage(type){ const box=document.getElementById('previewMessage'); if(!box) return; const messages={dashboard:'The dashboard centralizes the main MVP actions: overview, add task, monitor deadlines, and continue your daily planning.',calendar:'The calendar view helps the student quickly understand workload distribution and avoid deadline collisions.',profile:'The profile card keeps student identity and study context visible, and it can be edited instantly with no page reload.',analytics:'Progress visuals make the MVP feel real by showing completion rate, priority load, and weekly study trends.',tasks:'The task board demonstrates the core planning loop: create, review, prioritize, complete, and update.'}; box.textContent=messages[type]||messages.dashboard; document.querySelectorAll('.visual-card').forEach(card=>card.classList.toggle('active', card.dataset.visual===type)); }
function cycleGreeting(){ const target=document.getElementById('dynamicGreeting'); if(!target) return; const messages=['Stay consistent and finish one important task first.','Use the planner to break large deadlines into smaller actions.','A simple weekly overview can prevent last-minute stress.']; let index=Number(target.dataset.index||0); index=(index+1)%messages.length; target.dataset.index=index; target.textContent=messages[index]; }

document.addEventListener('DOMContentLoaded', async () => { applySavedPreferences(); initProfileCards(); bindPreferenceControls(); showPreviewMessage('dashboard'); if(isLoggedIn()){ try{ profile=toProfile(await api('/api/auth/me')); saveProfile(); initProfileCards(); bindPreferenceControls(); }catch{ localStorage.removeItem('studyPlannerToken'); } } await loadTasks(); });
