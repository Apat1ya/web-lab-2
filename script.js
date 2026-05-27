document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab");
    const forms = document.querySelectorAll(".form");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((item) => item.classList.remove("active"));
            tab.classList.add("active");

            const target = tab.dataset.target;
            forms.forEach((form) => {
                form.classList.toggle("active", form.id === target);
            });
        });
    });

    const themeButton = document.querySelector(".theme-button");
    if (themeButton) {
        themeButton.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            themeButton.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
        });
    }
});

document.addEventListener("mousemove", (event) => {
    const x = window.innerWidth / 2 - event.clientX;
    const y = window.innerHeight / 2 - event.clientY;

    document.querySelectorAll(".decor").forEach((element, index) => {
        const speed = (index + 1) * 0.02;
        element.style.transform = `translate(${x * speed}px, ${y * speed}px) rotate(var(--r)) scale(var(--s))`;
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
