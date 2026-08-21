const API_BASE = getApiBaseUrl();
const API_URL = `${API_BASE}/api/books`;

const state = {
    books: [],
};

const elements = {
    list: document.getElementById("book-list"),
    status: document.getElementById("catalog-status"),
};

document.addEventListener("DOMContentLoaded", () => {
    loadBooks();
});

async function loadBooks() {
    try {
        elements.status.textContent = "Завантаження книг...";
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Не вдалося отримати книги");
        }

        state.books = await response.json();
        renderBooks();
    } catch (error) {
        elements.status.textContent = error.message;
        elements.list.innerHTML = "";
    }
}

function renderBooks() {
    elements.status.textContent = state.books.length
        ? `У каталозі ${state.books.length} книг`
        : "Каталог поки порожній";

    elements.list.innerHTML = state.books.map((book) => `
        <article class="book-card" data-id="${book.id}">
            <a href="book.html?id=${encodeURIComponent(book.id)}">
                <img src="${escapeAttribute(book.imageUrl || "assets/book1.png")}" alt="${escapeAttribute(book.title)}">
            </a>
            <h3>${escapeHtml(book.title)}</h3>
            <p>${escapeHtml(book.author)}</p>
            <p class="price">${formatPrice(book.price)}</p>
            <p class="stock">На складі: ${book.stock}</p>
            <div class="card-actions">
                <button type="button" class="buy-button action-button" data-action="cart">Додати в кошик</button>
            </div>
        </article>
    `).join("");

    elements.list.querySelectorAll("button[data-action]").forEach((button) => {
        button.addEventListener("click", addBookToCart);
    });
}

function addBookToCart(event) {
    const card = event.target.closest(".book-card");
    const book = state.books.find((item) => item.id === card.dataset.id);

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

function formatPrice(price) {
    return `${Number(price).toFixed(0)} грн`;
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
