const CART_KEY = "bookstore-cart";

const elements = {
    items: document.getElementById("cart-items"),
    subtotal: document.getElementById("cart-subtotal"),
    discount: document.getElementById("cart-discount"),
    total: document.getElementById("cart-total"),
    promo: document.getElementById("promo-code"),
    applyPromo: document.getElementById("apply-promo"),
    checkout: document.getElementById("checkout-button"),
};

let discountPercent = 0;

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    elements.applyPromo.addEventListener("click", applyPromo);
    elements.checkout.addEventListener("click", checkout);
});

function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCart() {
    const cart = getCart();

    if (cart.length === 0) {
        elements.items.innerHTML = `
            <tr>
                <td colspan="4" class="empty-cart">Кошик порожній. <a href="catalog.html">Перейти до каталогу</a></td>
            </tr>
        `;
    } else {
        elements.items.innerHTML = cart.map((item) => `
            <tr data-id="${item.id}">
                <td class="book-info">
                    <img src="${escapeAttribute(getThumbnailUrl(item.imageUrl))}" loading="lazy" decoding="async" alt="${escapeAttribute(item.title)}">
                    <div>
                        <p>${escapeHtml(item.title)}</p>
                        <p>${escapeHtml(item.author)}</p>
                    </div>
                </td>
                <td>${formatPrice(item.price)}</td>
                <td>
                    <input class="quantity-input" type="number" min="1" value="${item.quantity}" data-action="quantity">
                </td>
                <td>
                    <button class="delete-button" type="button" data-action="delete">×</button>
                </td>
            </tr>
        `).join("");
    }

    elements.items.querySelectorAll("[data-action]").forEach((control) => {
        control.addEventListener("click", handleCartAction);
        control.addEventListener("change", handleCartAction);
    });

    updateSummary(cart);
}

function handleCartAction(event) {
    const row = event.target.closest("tr");
    if (!row) {
        return;
    }

    const cart = getCart();
    const index = cart.findIndex((item) => item.id === row.dataset.id);
    if (index === -1) {
        return;
    }

    if (event.target.dataset.action === "delete") {
        cart.splice(index, 1);
    }

    if (event.target.dataset.action === "quantity") {
        cart[index].quantity = Math.max(1, Number(event.target.value));
    }

    saveCart(cart);
    renderCart();
}

function applyPromo() {
    const code = elements.promo.value.trim().toUpperCase();
    discountPercent = code === "BOOK10" ? 10 : 0;
    renderCart();
}

function checkout() {
    if (getCart().length === 0) {
        return;
    }

    localStorage.removeItem(CART_KEY);
    window.location.href = "success.html";
}

function updateSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const discount = subtotal * discountPercent / 100;
    const total = subtotal - discount;

    elements.subtotal.textContent = `Всього: ${formatPrice(subtotal)}`;
    elements.discount.textContent = `Знижка: ${formatPrice(discount)}`;
    elements.total.textContent = `До сплати ${formatPrice(total)}`;
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

function getThumbnailUrl(imageUrl) {
    const localCover = String(imageUrl || "").match(/^assets\/covers\/([^/.]+)\.[^/]+$/);
    return localCover ? `assets/covers/thumbs/${localCover[1]}.webp` : imageUrl || "assets/decor/book1.webp";
}
