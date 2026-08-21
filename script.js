function getApiBaseUrl(location = window.location) {
    const isLocalStaticPreview = (
        location.protocol === "file:"
        || (["localhost", "127.0.0.1"].includes(location.hostname) && location.port !== "3000")
    );

    return isLocalStaticPreview ? "http://localhost:3000" : "";
}

function renderHeader() {
    const headerSlot = document.querySelector("[data-header]");
    const existingHeader = document.querySelector("header.header");

    if (!headerSlot && existingHeader) {
        return;
    }

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const links = [
        { href: "about.html", label: "&#1055;&#1088;&#1086; &#1084;&#1072;&#1075;&#1072;&#1079;&#1080;&#1085;" },
        { href: "catalog.html", label: "&#1050;&#1072;&#1090;&#1072;&#1083;&#1086;&#1075;" },
        { href: "account.html", label: "&#1054;&#1089;&#1086;&#1073;&#1080;&#1089;&#1090;&#1080;&#1081; &#1082;&#1072;&#1073;&#1110;&#1085;&#1077;&#1090;" },
        { href: "cart.html", label: "&#1050;&#1086;&#1096;&#1080;&#1082;" },
    ];

    const header = document.createElement("header");
    header.className = "header";
    header.innerHTML = `
        <a class="logo" href="index.html">BookStore</a>
        <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <nav id="site-nav">
            ${links.map((link) => `
                <a href="${link.href}"${link.href === currentPage ? ' aria-current="page"' : ""}>${link.label}</a>
            `).join("")}
        </nav>
        <button class="theme-button" type="button" aria-label="Toggle theme">&#127769;</button>
    `;

    if (headerSlot) {
        headerSlot.replaceWith(header);
    } else {
        document.body.prepend(header);
    }
}

document.addEventListener("error", (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied === "true") {
        return;
    }

    image.dataset.fallbackApplied = "true";
    image.src = "assets/book-placeholder.svg";
}, true);

document.addEventListener("DOMContentLoaded", () => {
    renderHeader();

    const header = document.querySelector("header.header");
    const menuButton = document.querySelector(".menu-button");
    if (header && menuButton) {
        menuButton.addEventListener("click", () => {
            const isOpen = header.classList.toggle("menu-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
        });

        header.querySelectorAll("nav a").forEach((link) => {
            link.addEventListener("click", () => {
                header.classList.remove("menu-open");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open menu");
            });
        });
    }

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
            themeButton.innerHTML = document.body.classList.contains("dark") ? "&#9728;&#65039;" : "&#127769;";
        });
    }
});

const bannerMotion = {
    mouseX: 0,
    mouseY: 0,
    ticking: false,
};

function scheduleBannerParallax() {
    if (bannerMotion.ticking) {
        return;
    }

    bannerMotion.ticking = true;
    requestAnimationFrame(updateBannerParallax);
}

function updateBannerParallax() {
    bannerMotion.ticking = false;

    const parallax = document.querySelector(".parallax");
    if (!parallax) {
        return;
    }

    const rect = parallax.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const scrollDistance = Math.max(0, Math.min(rect.height + viewportHeight, -rect.top));
    const bookSpeeds = [0.65, 0.9, 1.15, 0.8];

    parallax.querySelectorAll(".book-icons img").forEach((book, index) => {
        const speed = bookSpeeds[index] || 0.75;
        book.style.setProperty("--book-scroll", `${scrollDistance * -speed}px`);
    });

    const frame = parallax.querySelector(".banner-frame");
    if (frame) {
        frame.style.transform = `translate3d(${bannerMotion.mouseX * 0.01}px, ${bannerMotion.mouseY * 0.01}px, 0)`;
    }

    const text = parallax.querySelector(".banner-text");
    if (text) {
        text.style.transform = `translate3d(${bannerMotion.mouseX * 0.005}px, ${bannerMotion.mouseY * 0.005}px, 0)`;
    }
}

document.addEventListener("mousemove", (event) => {
    const x = window.innerWidth / 2 - event.clientX;
    const y = window.innerHeight / 2 - event.clientY;

    document.querySelectorAll(".decor").forEach((element, index) => {
        const speed = (index + 1) * 0.02;
        element.style.transform = `translate(${x * speed}px, ${y * speed}px) rotate(var(--r)) scale(var(--s))`;
    });

    bannerMotion.mouseX = x;
    bannerMotion.mouseY = y;
    scheduleBannerParallax();
});

document.addEventListener("scroll", scheduleBannerParallax, { passive: true });
window.addEventListener("resize", scheduleBannerParallax);
document.addEventListener("DOMContentLoaded", scheduleBannerParallax);
