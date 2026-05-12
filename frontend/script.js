document.addEventListener("DOMContentLoaded", () => {
  console.log("JS работает");
  const tabs = document.querySelectorAll(".tab");
  const forms = document.querySelectorAll(".form");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {

      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.dataset.target;

      forms.forEach(form => {
        form.classList.remove("active");
        if (form.id === target) {
          form.classList.add("active");
        }
      });

    });
  });

  const themeBtn = document.querySelector(".theme-button");

  themeBtn.addEventListener("click", () =>{
    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")) {
      themeBtn.textContent = "☀️"; 
    } else {
      themeBtn.textContent = "🌙";
    }
  })

});