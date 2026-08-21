const { Pool } = require("pg");

async function createPostgresBookRepository(options) {
    const pool = new Pool(options);
    await ensureSchema(pool);

    return {
        kind: "postgresql",

        async list() {
            const result = await pool.query(
                `SELECT id, title, author, price, stock, description, image_url AS "imageUrl"
                 FROM books
                 ORDER BY id`
            );
            return result.rows.map(mapBook);
        },

        async getById(id) {
            const result = await pool.query(
                `SELECT id, title, author, price, stock, description, image_url AS "imageUrl"
                 FROM books
                 WHERE id = $1`,
                [id]
            );
            return result.rows[0] ? mapBook(result.rows[0]) : null;
        },

        async create(payload) {
            const result = await pool.query(
                `INSERT INTO books (title, author, price, stock, description, image_url)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, title, author, price, stock, description, image_url AS "imageUrl"`,
                [
                    payload.title,
                    payload.author,
                    payload.price,
                    payload.stock,
                    payload.description || "",
                    payload.imageUrl || "",
                ]
            );
            return mapBook(result.rows[0]);
        },

        async update(id, payload) {
            const current = await this.getById(id);
            if (!current) {
                return null;
            }

            const next = { ...current, ...payload };
            const result = await pool.query(
                `UPDATE books
                 SET title = $1,
                     author = $2,
                     price = $3,
                     stock = $4,
                     description = $5,
                     image_url = $6,
                     updated_at = NOW()
                 WHERE id = $7
                 RETURNING id, title, author, price, stock, description, image_url AS "imageUrl"`,
                [
                    next.title,
                    next.author,
                    next.price,
                    next.stock,
                    next.description || "",
                    next.imageUrl || "",
                    id,
                ]
            );
            return mapBook(result.rows[0]);
        },

        async remove(id) {
            const result = await pool.query("DELETE FROM books WHERE id = $1", [id]);
            return result.rowCount > 0;
        },

        async close() {
            await pool.end();
        },
    };
}

async function ensureSchema(pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS books (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
            stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
            description TEXT DEFAULT '',
            image_url TEXT DEFAULT '',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            UNIQUE (title, author)
        );
    `);
}

function mapBook(row) {
    return {
        id: String(row.id),
        title: row.title,
        author: row.author,
        price: Number(row.price),
        stock: Number(row.stock),
        description: row.description || "",
        imageUrl: row.imageUrl || "",
    };
}

module.exports = { createPostgresBookRepository, ensureSchema };
