function login() {
    window.location.href = "dashboard.html";
}

function logout() {
    window.location.href = "index.html";
}

function showPage(pageId) {

    // скрыть все страницы
    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });

    // показать нужную страницу
    document.getElementById(pageId).style.display = "block";

    // убрать active у всех кнопок
    document.querySelectorAll("aside li").forEach(li => {
        li.classList.remove("active");
    });

    // НАЙТИ кнопку по pageId и активировать
    document.querySelectorAll("aside li").forEach(li => {
        if (li.getAttribute("onclick").includes(pageId)) {
            li.classList.add("active");
        }
    });
}
