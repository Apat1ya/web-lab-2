const homeBooks = document.getElementById("home-books");
const homeStatus = document.getElementById("home-status");
const API_BASE = window.location.protocol === "file:" ? "http://localhost:3000" : "";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(`${API_BASE}/api/books`);
        if (!response.ok) {
            throw new Error("Не вдалося завантажити книги");
        }

        const books = await response.json();
        homeStatus.textContent = books.length ? "Дані завантажені з PostgreSQL" : "Каталог порожній";
        homeBooks.innerHTML = books.slice(0, 4).map((book) => `
            <article class="book-card" data-id="${book.id}">
                <a href="book.html?id=${encodeURIComponent(book.id)}">
                    <img src="${escapeAttribute(book.imageUrl || "assets/book1.png")}" alt="${escapeAttribute(book.title)}">
                </a>
                <h3>${escapeHtml(book.title)}</h3>
                <p class="price">${Number(book.price).toFixed(0)} грн</p>
                <button type="button" class="buy-button action-button" data-action="cart">Додати в кошик</button>
            </article>
        `).join("");

        homeBooks.querySelectorAll("button[data-action='cart']").forEach((button) => {
            button.addEventListener("click", (event) => {
                const card = event.target.closest(".book-card");
                const book = books.find((item) => item.id === card.dataset.id);
                addToCart(book);
            });
        });
    } catch (error) {
        homeStatus.textContent = error.message;
        homeBooks.innerHTML = "";
    }
});

function addToCart(book) {
    const cart = JSON.parse(localStorage.getItem("bookstore-cart") || "[]");
    const current = cart.find((item) => item.id === book.id);

    if (current) {
        current.quantity += 1;
    } else {
        cart.push({
            id: book.id,
            title: book.title,
            author: book.author,
            price: Number(book.price),
            imageUrl: book.imageUrl,
            quantity: 1,
        });
    }

    localStorage.setItem("bookstore-cart", JSON.stringify(cart));
    window.location.href = "cart.html";
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}
