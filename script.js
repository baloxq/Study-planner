// Simple state (in-memory for demo)
let tasks = [
  {title:'Complete Math Assignment', subject:'Mathematics', date:'2026-03-22', priority:'high', done:false},
  {title:'Read Chapter 5 - Biology', subject:'Biology', date:'2026-03-23', priority:'medium', done:false},
  {title:'History Essay Draft', subject:'History', date:'2026-03-25', priority:'high', done:false},
  {title:'Physics Lab Report', subject:'Physics', date:'2026-03-26', priority:'low', done:true},
];

// Render dashboard/tasks
function renderTasks(listEl){
  if(!listEl) return;
  listEl.innerHTML = '';
  const upcoming = tasks.filter(t=>!t.done);
  const completed = tasks.filter(t=>t.done);

  upcoming.forEach((t,i)=>{
    listEl.appendChild(taskRow(t,i,false));
  });

  if(completed.length){
    const h = document.createElement('div');
    h.className='meta';
    h.style.margin='12px 0 6px';
    h.textContent='Completed';
    listEl.appendChild(h);
    completed.forEach((t,i)=>{
      listEl.appendChild(taskRow(t,i,true));
    });
  }
}

function taskRow(t,i,done){
  const row = document.createElement('div');
  row.className='task';
  const left = document.createElement('div');
  left.className='left';

  const cb = document.createElement('input');
  cb.type='checkbox';
  cb.checked = done;
  cb.onchange = ()=>{ t.done = cb.checked; refresh(); };

  const info = document.createElement('div');
  const title = document.createElement('div');
  title.className='title';
  title.textContent = t.title;
  const meta = document.createElement('div');
  meta.className='meta';
  const d = new Date(t.date);
  meta.textContent = `${t.subject} • ${d.toLocaleDateString('en-GB',{month:'short', day:'2-digit'})}`;

  const tag = document.createElement('span');
  tag.className = 'tag ' + (t.priority||'low');
  tag.textContent = (t.priority||'low').charAt(0).toUpperCase()+ (t.priority||'low').slice(1);

  info.appendChild(title);
  const mwrap = document.createElement('div');
  mwrap.style.display='flex'; mwrap.style.gap='8px'; mwrap.style.alignItems='center';
  mwrap.appendChild(meta); mwrap.appendChild(tag);
  info.appendChild(mwrap);

  left.appendChild(cb);
  left.appendChild(info);

  const del = document.createElement('button');
  del.className='icon-btn';
  del.innerHTML='🗑️';
  del.onclick = ()=>{ tasks.splice(i,1); refresh(); };

  row.appendChild(left);
  row.appendChild(del);
  return row;
}

function refresh(){
  renderTasks(document.getElementById('taskList'));
  renderCalendar();
}

// Form toggle
function toggleForm(){
  const f = document.getElementById('taskFormWrap');
  if(f) f.style.display = (f.style.display==='none'||!f.style.display)?'block':'none';
}

function addTask(e){
  e.preventDefault();
  const title = document.getElementById('f_title').value.trim();
  const subject = document.getElementById('f_subject').value.trim();
  const date = document.getElementById('f_date').value;
  const priority = document.getElementById('f_priority').value;
  if(!title||!subject||!date) return;
  tasks.unshift({title, subject, date, priority, done:false});
  e.target.reset();
  toggleForm();
  refresh();
}

// Calendar
function renderCalendar(){
  const grid = document.getElementById('calGrid');
  if(!grid) return;
  grid.innerHTML='';
  const daysInMonth = 31; // static demo
  for(let i=1;i<=daysInMonth;i++){
    const cell = document.createElement('div');
    cell.className='day';
    const num = document.createElement('div');
    num.className='num';
    num.textContent = i;
    cell.appendChild(num);

    // events
    tasks.forEach(t=>{
      const d = new Date(t.date);
      if(d.getDate()===i){
        const ev = document.createElement('div');
        ev.className='event ' + (t.priority||'low');
        ev.textContent = t.title;
        cell.appendChild(ev);
      }
    });

    grid.appendChild(cell);
  }
}

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  renderTasks(document.getElementById('taskList'));
  renderCalendar();
});
