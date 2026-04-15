function login() {
    window.location.href = "dashboard.html";
}

function logout() {
    window.location.href = "index.html";
}

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active-page"));
    document.getElementById(pageId).classList.add("active-page");

    document.querySelectorAll("aside li").forEach(li => li.classList.remove("active"));
    event.target.classList.add("active");
}
