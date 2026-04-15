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
