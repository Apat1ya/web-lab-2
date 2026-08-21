const express = require("express");
const path = require("node:path");
const { createBooksRouter } = require("./routes/books");

const publicRoot = path.resolve(__dirname, "..");
const staticCacheOptions = {
    maxAge: "7d",
    immutable: false,
};
const pages = new Set([
    "about.html",
    "account.html",
    "book.html",
    "cart.html",
    "catalog.html",
    "checkout.html",
    "error.html",
    "index.html",
    "payment.html",
    "success.html",
]);

function createApp({ repository }) {
    const app = express();

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
            return res.status(204).send();
        }

        next();
    });

    app.use(express.json());

    app.use("/api", (req, res, next) => {
        res.setHeader("Cache-Control", "no-store");
        next();
    });

    app.get("/api/health", async (req, res) => {
        try {
            if (repository.health) {
                await repository.health();
            }

            res.json({ status: "ok", storage: repository.kind || "custom" });
        } catch (error) {
            res.status(503).json({ error: "PostgreSQL is unavailable" });
        }
    });

    app.use("/api/books", createBooksRouter(repository));

    app.use("/assets", express.static(path.join(publicRoot, "assets"), staticCacheOptions));
    app.use("/js", express.static(path.join(publicRoot, "js"), staticCacheOptions));

    app.get("/", (req, res) => {
        sendHtml(res, "index.html");
    });

    app.get(["/style.css", "/script.js"], (req, res) => {
        res.sendFile(path.join(publicRoot, req.path.slice(1)), staticCacheOptions);
    });

    app.get("/:page", (req, res, next) => {
        if (!pages.has(req.params.page)) {
            return next();
        }

        sendHtml(res, req.params.page);
    });

    app.use((req, res) => {
        res.status(404).json({ error: "Route not found" });
    });

    app.use((error, req, res, next) => {
        const status = error.status || 500;
        res.status(status).json({
            error: status === 500 ? "Internal server error" : error.message,
        });
    });

    return app;
}

function sendHtml(res, fileName) {
    res.sendFile(path.join(publicRoot, fileName), {
        headers: { "Cache-Control": "no-cache" },
    });
}

module.exports = { createApp };
