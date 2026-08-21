const homeBooks = document.getElementById("home-books");
const homeStatus = document.getElementById("home-status");
const API_BASE = getApiBaseUrl();

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(`${API_BASE}/api/books`);
        if (!response.ok) {
            throw new Error("Не вдалося завантажити книги");
        }

        const books = await response.json();
        homeStatus.textContent = books.length ? `Показано ${Math.min(books.length, 8)} книг` : "Каталог порожній";
        homeBooks.innerHTML = books.slice(0, 8).map((book) => `
            <article class="book-card" data-id="${book.id}">
                <a href="book.html?id=${encodeURIComponent(book.id)}">
                    <img src="${escapeAttribute(book.imageUrl || "assets/book1.png")}" alt="${escapeAttribute(book.title)}" loading="lazy" decoding="async">
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
        homeStatus.textContent = "Каталог тимчасово недоступний";
        homeBooks.innerHTML = `
            <div class="load-error" role="alert">
                <h3>Не вдалося завантажити книги</h3>
                <p>Запустіть сайт командою <code>npm start</code> і оновіть сторінку.</p>
                <button class="action-button" type="button" id="retry-books">Спробувати ще раз</button>
            </div>
        `;
        document.getElementById("retry-books").addEventListener("click", () => window.location.reload());
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
