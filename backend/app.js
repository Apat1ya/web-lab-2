const express = require("express");
const { createBooksRouter } = require("./routes/books");

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
    app.use(express.static("."));

    app.get("/api/health", (req, res) => {
        res.json({ status: "ok", database: "postgresql" });
    });

    app.use("/api/books", createBooksRouter(repository));

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

module.exports = { createApp };
