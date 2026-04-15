// ---------- AUTH ----------

function login() {
    window.location.href = "dashboard.html";
}

function logout() {
    window.location.href = "index.html";
}

// ---------- SIDEBAR ----------

function showPage(pageId, element) {

    // скрываем все страницы
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active-page");
    });

    // показываем нужную
    document.getElementById(pageId).classList.add("active-page");

    // убираем active у всех кнопок
    document.querySelectorAll("aside li").forEach(li => {
        li.classList.remove("active");
    });

    // добавляем active выбранной
    element.classList.add("active");
}

// ---------- TASK SYSTEM ----------

function addTask() {
    const text = prompt("Enter new task:");

    if (text) {
        let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push(text);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    }
}

function renderTasks() {
    const container = document.getElementById("taskList");
    if (!container) return;

    container.innerHTML = "";

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "task-item";
        div.innerText = task;
        container.appendChild(div);
    });
}

// ---------- INIT ----------

document.addEventListener("DOMContentLoaded", renderTasks);
// ===== TASK FORM =====

function toggleForm() {
    document.getElementById("taskForm").classList.toggle("hidden");
}

function saveTask() {

    const title = document.getElementById("taskTitle").value;
    const subject = document.getElementById("taskSubject").value;
    const date = document.getElementById("taskDate").value;
    const priority = document.getElementById("taskPriority").value;

    if (!title) {
        alert("Enter task title!");
        return;
    }

    const task = {
        title,
        subject,
        date,
        priority
    };

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    renderTasks();
    toggleForm();
}

// render

function renderTasks() {
    const container = document.getElementById("taskList");
    if (!container) return;

    container.innerHTML = "";

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(t => {
        const div = document.createElement("div");
        div.className = "task-item";
        div.innerHTML = `
            <b>${t.title}</b><br>
            ${t.subject || ""} | ${t.date || ""} | ${t.priority}
        `;
        container.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", renderTasks);
