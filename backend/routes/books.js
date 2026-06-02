const express = require("express");
const { validateBookPayload } = require("../validation/bookValidation");

function createBooksRouter(repository) {
    const router = express.Router();

    router.get("/", async (req, res, next) => {
        try {
            const books = await repository.list();
            setReadCache(res);
            res.json(books);
        } catch (error) {
            next(error);
        }
    });

    router.get("/:id", async (req, res, next) => {
        try {
            const book = await repository.getById(req.params.id);
            if (!book) {
                return res.status(404).json({ error: "Book not found" });
            }

            setReadCache(res);
            res.json(book);
        } catch (error) {
            next(error);
        }
    });

    router.post("/", async (req, res, next) => {
        try {
            const payload = validateBookPayload(req.body, true);
            const book = await repository.create(payload);
            res.status(201).json(book);
        } catch (error) {
            next(error);
        }
    });

    router.put("/:id", async (req, res, next) => {
        try {
            const payload = validateBookPayload(req.body, false);
            const book = await repository.update(req.params.id, payload);
            if (!book) {
                return res.status(404).json({ error: "Book not found" });
            }

            res.json(book);
        } catch (error) {
            next(error);
        }
    });

    router.delete("/:id", async (req, res, next) => {
        try {
            const deleted = await repository.remove(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: "Book not found" });
            }

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    });

    return router;
}

function setReadCache(res) {
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
}

module.exports = { createBooksRouter };
