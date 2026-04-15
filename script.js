function changeColor(){
document.body.style.background = document.body.style.background === 'lightblue' ? '#f4f6f9' : 'lightblue';
}

function increaseText(){
document.body.style.fontSize = '18px';
}

function toggleTasks(){
let t = document.getElementById('tasks');
t.style.display = t.style.display === 'none' ? 'block' : 'none';
}
