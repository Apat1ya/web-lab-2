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

document.addEventListener("mousemove", (e) => {
  const x = (window.innerWidth / 2 - e.clientX);
  const y = (window.innerHeight / 2 - e.clientY);

  document.querySelectorAll(".decor").forEach((el, i) => {
    const speed = (i + 1) * 0.02;

    el.style.transform = `translate(${x * speed}px, ${y * speed}px) rotate(var(--r)) scale(var(--s))`;
  });

  const frame = document.querySelector(".banner-frame");
  if (frame) {
    frame.style.transform = `translate(${x * 0.01}px, ${y * 0.01}px)`;
  }

  const text = document.querySelector(".banner-text");
  if (text) {
    text.style.transform = `translate(${x * 0.005}px, ${y * 0.005}px)`;
  }
});