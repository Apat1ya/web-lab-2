const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
const { config } = require("../backend/config");

async function runSqlFile(pool, fileName) {
    const sql = await fs.readFile(path.join(__dirname, "postgres", fileName), "utf8");
    await pool.query(sql);
}

async function seedDatabase() {
    const pool = new Pool(config.postgres);

    try {
        await runSqlFile(pool, "schema.sql");
        await runSqlFile(pool, "seed.sql");
        console.log("Database schema and seed data applied.");
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    seedDatabase().catch((error) => {
        console.error("Database seed failed:", error);
        process.exit(1);
    });
}

module.exports = { seedDatabase };
