function logout(){window.location.href='index.html'}
function showPage(id,el){
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active-page'));
 document.getElementById(id).classList.add('active-page');
 document.querySelectorAll('.nav li').forEach(li=>li.classList.remove('active'));
 el.classList.add('active');
}
function toggleForm(){
 document.getElementById('taskForm').classList.toggle('hidden');
}
function addTask(){
 let t=document.getElementById('title').value;
 if(!t)return;
 let tasks=JSON.parse(localStorage.getItem('tasks')||'[]');
 tasks.push({t,done:false});
 localStorage.setItem('tasks',JSON.stringify(tasks));
 render();
}
function toggleDone(i){
 let tasks=JSON.parse(localStorage.getItem('tasks'));
 tasks[i].done=!tasks[i].done;
 localStorage.setItem('tasks',JSON.stringify(tasks));
 render();
}
function del(i){
 let tasks=JSON.parse(localStorage.getItem('tasks'));
 tasks.splice(i,1);
 localStorage.setItem('tasks',JSON.stringify(tasks));
 render();
}
function render(){
 let list=document.getElementById('taskList');
 let full=document.getElementById('taskListFull');
 let comp=document.getElementById('completedList');
 list.innerHTML='';full.innerHTML='';comp.innerHTML='';
 let tasks=JSON.parse(localStorage.getItem('tasks')||'[]');
 tasks.forEach((x,i)=>{
  let el=document.createElement('div');
  el.innerHTML=`<input type="checkbox" ${x.done?'checked':''} onclick="toggleDone(${i})">${x.t}<button onclick="del(${i})">🗑</button>`;
  if(x.done) comp.appendChild(el); else list.appendChild(el);
  full.appendChild(el.cloneNode(true));
 });
}
document.addEventListener('DOMContentLoaded',render);
