function login(){window.location.href='dashboard.html'}
function logout(){window.location.href='index.html'}

function showPage(id,el){
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active-page'));
 document.getElementById(id).classList.add('active-page');
 document.querySelectorAll('aside li').forEach(li=>li.classList.remove('active'));
 el.classList.add('active');
}

function toggleForm(){
 document.getElementById('taskForm').classList.toggle('hidden');
}

function addTask(){
 let t=document.getElementById('title').value;
 if(!t)return;
 let tasks=JSON.parse(localStorage.getItem('tasks')||'[]');
 tasks.push({t});
 localStorage.setItem('tasks',JSON.stringify(tasks));
 render();
}

function render(){
 let list=document.getElementById('taskList');
 let full=document.getElementById('taskListFull');
 if(!list)return;
 list.innerHTML='';
 if(full) full.innerHTML='';
 let tasks=JSON.parse(localStorage.getItem('tasks')||'[]');
 tasks.forEach((x)=>{
   let div=document.createElement('div');
   div.innerText=x.t;
   list.appendChild(div);
   if(full) full.appendChild(div.cloneNode(true));
 });
}

document.addEventListener('DOMContentLoaded',render);
