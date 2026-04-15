function logout(){window.location.href='index.html';}

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
 let title=document.getElementById('title').value;
 let priority=document.getElementById('priority').value;
 if(!title)return;

 let tasks=JSON.parse(localStorage.getItem('tasks')||'[]');
 tasks.push({title,priority,done:false});
 localStorage.setItem('tasks',JSON.stringify(tasks));

 renderTasks();
 toggleForm();
}

function toggleDone(i){
 let tasks=JSON.parse(localStorage.getItem('tasks'));
 tasks[i].done=!tasks[i].done;
 localStorage.setItem('tasks',JSON.stringify(tasks));
 renderTasks();
}

function deleteTask(i){
 let tasks=JSON.parse(localStorage.getItem('tasks'));
 tasks.splice(i,1);
 localStorage.setItem('tasks',JSON.stringify(tasks));
 renderTasks();
}

function renderTasks(){
 let list=document.getElementById('taskList');
 let listFull=document.getElementById('taskListFull');
 if(!list)return;

 list.innerHTML='';
 if(listFull) listFull.innerHTML='';

 let tasks=JSON.parse(localStorage.getItem('tasks')||'[]');

 tasks.forEach((t,i)=>{
  let div=document.createElement('div');
  div.className='task-item';
  div.innerHTML=`<input type="checkbox" onclick="toggleDone(${i})" ${t.done?'checked':''}>
                 ${t.title} (${t.priority})
                 <button onclick="deleteTask(${i})">🗑</button>`;
  list.appendChild(div);

  if(listFull){
    let clone=div.cloneNode(true);
    listFull.appendChild(clone);
  }
 });
}

document.addEventListener('DOMContentLoaded',renderTasks);
