const details = document.getElementById("book-details");
const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");
const API_BASE = window.location.protocol === "file:" ? "http://localhost:3000" : "";

document.addEventListener("DOMContentLoaded", loadBook);

async function loadBook() {
    if (!bookId) {
        details.innerHTML = `
            <div class="empty-state">
                <h1>Книгу не вибрано</h1>
                <a class="buy-button" href="catalog.html">Повернутися до каталогу</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/books/${encodeURIComponent(bookId)}`);
        if (!response.ok) {
            throw new Error("Книгу не знайдено");
        }

        const book = await response.json();
        renderBook(book);
    } catch (error) {
        details.innerHTML = `
            <div class="empty-state">
                <h1>${escapeHtml(error.message)}</h1>
                <a class="buy-button" href="catalog.html">Повернутися до каталогу</a>
            </div>
        `;
    }
}

function renderBook(book) {
    document.title = book.title;
    details.innerHTML = `
        <div class="product-image">
            <img src="${escapeAttribute(book.imageUrl || "assets/book1.png")}" decoding="async" alt="${escapeAttribute(book.title)}">
        </div>
        <div class="product-info">
            <h1>${escapeHtml(book.title)}</h1>
            <p class="book-author">${escapeHtml(book.author)}</p>
            <p class="description">${escapeHtml(book.description || "Опис поки відсутній.")}</p>
            <h2>${Number(book.price).toFixed(0)} грн</h2>
            <p>На складі: ${book.stock}</p>
            <button class="buy-button action-button" type="button" id="add-to-cart">Додати в кошик</button>
            <a href="catalog.html" class="secondary-link">Назад до каталогу</a>
        </div>
    `;

    document.getElementById("add-to-cart").addEventListener("click", () => addToCart(book));
}

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
