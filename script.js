function login(){window.location.href='dashboard.html'}
function logout(){window.location.href='index.html'}

function showPage(id,el){
document.querySelectorAll('.page').forEach(p=>p.classList.remove('active-page'))
document.getElementById(id).classList.add('active-page')
document.querySelectorAll('aside li').forEach(li=>li.classList.remove('active'))
el.classList.add('active')
}

function toggleForm(){
document.getElementById('form').classList.toggle('hidden')
}

function addTask(){
let val=document.getElementById('taskInput').value
let li=document.createElement('li')
li.innerHTML=val+' <button onclick="this.parentElement.remove()">X</button>'
document.getElementById('taskList').appendChild(li)
}

function toggleTheme(){
document.body.classList.toggle('dark')
}

function changeText(){
document.body.classList.toggle('large')
}
