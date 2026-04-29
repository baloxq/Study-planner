document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const notFoundMessage = document.getElementById("notFoundMessage");

  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();
    const tasks = document.querySelectorAll(".task");

    let found = false;

    tasks.forEach(task => {
      const title = task.querySelector(".title")?.innerText.toLowerCase() || "";

      if (title.includes(value)) {
        task.style.display = "flex";
        found = true;
      } else {
        task.style.display = "none";
      }
    });

    notFoundMessage.style.display = found ? "none" : "block";
  });
});