require("dotenv").config({ quiet: true });

const config = {
    port: Number(process.env.PORT || 3000),
    postgres: getPostgresConfig(),
    allowMemoryFallback:
        process.env.USE_MEMORY_DATABASE === "true"
        || (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL),
};

function getPostgresConfig() {
    if (process.env.DATABASE_URL) {
        return { connectionString: process.env.DATABASE_URL };
    }

    return {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || "bookstore",
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "postgres",
    };
}

module.exports = { config };
