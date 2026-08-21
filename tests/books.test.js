const assert = require("node:assert/strict");
const test = require("node:test");
const { createApp } = require("../backend/app");

test("books API supports CRUD operations", async () => {
    const repository = createTestRepository();
    const server = createApp({ repository }).listen(0);
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
        let response = await fetch(`${baseUrl}/api/books`);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), []);

        response = await fetch(`${baseUrl}/api/books`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                title: "The Little Prince",
                author: "Antoine de Saint-Exupery",
                price: 200,
                stock: 10,
                description: "Classic novella",
                imageUrl: "https://example.com/little-prince.jpg",
            }),
        });
        assert.equal(response.status, 201);
        const created = await response.json();
        assert.equal(created.id, "1");
        assert.equal(created.title, "The Little Prince");

        response = await fetch(`${baseUrl}/api/books/1`);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), created);

        response = await fetch(`${baseUrl}/api/books/1`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ price: 220, stock: 8 }),
        });
        assert.equal(response.status, 200);
        const updated = await response.json();
        assert.equal(updated.price, 220);
        assert.equal(updated.stock, 8);

        response = await fetch(`${baseUrl}/api/books/1`);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), updated);

        response = await fetch(`${baseUrl}/api/books/1`, { method: "DELETE" });
        assert.equal(response.status, 204);

        response = await fetch(`${baseUrl}/api/books/1`);
        assert.equal(response.status, 404);

        response = await fetch(`${baseUrl}/api/books/999`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ stock: 1 }),
        });
        assert.equal(response.status, 404);

        response = await fetch(`${baseUrl}/api/books/999`, { method: "DELETE" });
        assert.equal(response.status, 404);
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});

test("books API rejects invalid book data", async () => {
    const repository = createTestRepository();
    const server = createApp({ repository }).listen(0);
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
        const invalidPayloads = [
            { title: "Incomplete book" },
            { title: "   ", author: "Author", price: 10, stock: 1 },
            { title: "Book", author: "   ", price: 10, stock: 1 },
            { title: "Book", author: "Author", price: -1, stock: 1 },
            { title: "Book", author: "Author", price: 10, stock: -1 },
            { title: "Book", author: "Author", price: "10", stock: 1 },
            { title: "Book", author: "Author", price: 10, stock: 1.5 },
        ];

        for (const payload of invalidPayloads) {
            const response = await fetch(`${baseUrl}/api/books`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
            });

            assert.equal(response.status, 400);
            assert.equal(typeof (await response.json()).error, "string");
        }
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});

test("app serves frontend files without exposing repo metadata", async () => {
    const repository = createTestRepository();
    const server = createApp({ repository }).listen(0);
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
        let response = await fetch(`${baseUrl}/`);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("cache-control"), "no-cache");
        assert.match(await response.text(), /BookStore/);

        response = await fetch(`${baseUrl}/style.css`);
        assert.equal(response.status, 200);
        assert.match(response.headers.get("content-type"), /text\/css/);
        assert.equal(response.headers.get("cache-control"), "public, max-age=604800");

        response = await fetch(`${baseUrl}/js/catalog.js`);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("cache-control"), "public, max-age=604800");

        response = await fetch(`${baseUrl}/assets/book1.png`);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("cache-control"), "public, max-age=604800");

        response = await fetch(`${baseUrl}/api/books`);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("cache-control"), "no-store");

        response = await fetch(`${baseUrl}/package.json`);
        assert.equal(response.status, 404);
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});

test("health endpoint reports the configured repository", async () => {
    const repository = createTestRepository();
    const server = createApp({ repository }).listen(0);
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
        const response = await fetch(`${baseUrl}/api/health`);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { status: "ok", storage: "test" });
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});

function createTestRepository() {
    const books = [];
    let nextId = 1;

    return {
        kind: "test",

        async health() {},

        async list() {
            return books.map(clone);
        },

        async getById(id) {
            const book = books.find((item) => item.id === String(id));
            return book ? clone(book) : null;
        },

        async create(payload) {
            const book = normalize({ id: String(nextId++), ...payload });
            books.push(book);
            return clone(book);
        },

        async update(id, payload) {
            const index = books.findIndex((item) => item.id === String(id));
            if (index === -1) {
                return null;
            }

            books[index] = normalize({ ...books[index], ...payload });
            return clone(books[index]);
        },

        async remove(id) {
            const index = books.findIndex((item) => item.id === String(id));
            if (index === -1) {
                return false;
            }

            books.splice(index, 1);
            return true;
        },
    };
}

function normalize(book) {
    return {
        id: String(book.id),
        title: book.title,
        author: book.author,
        price: Number(book.price),
        stock: Number(book.stock),
        description: book.description || "",
        imageUrl: book.imageUrl || "",
    };
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}
