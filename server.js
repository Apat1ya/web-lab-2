const { createApp } = require("./backend/app");
const { config } = require("./backend/config");
const { createPostgresBookRepository } = require("./backend/repositories/postgresBookRepository");

async function start() {
    const repository = await createRepository();
    const app = createApp({ repository });

    const server = app.listen(config.port, () => {
        console.log(`Server started on http://localhost:${config.port}`);
    });

    async function shutdown() {
        server.close(async () => {
            await repository.close();
            process.exit(0);
        });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

async function createRepository() {
    return createPostgresBookRepository(config.postgres);
}

if (require.main === module) {
    start().catch((error) => {
        if (error.code === "PG_CONFIG_MISSING" || error.code === "PG_CONFIG_INVALID") {
            console.error(`Server failed to start: ${error.message}`);
        } else if (error.code === "28P01") {
            console.error(
                "Server failed to start: PostgreSQL authentication failed. Check DATABASE_URL or PGPASSWORD in .env."
            );
        } else if (error.code === "3D000") {
            console.error(
                "Server failed to start: PostgreSQL database does not exist. Create the bookstore database first."
            );
        } else if (["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT"].includes(error.code)) {
            console.error(
                "Server failed to start: cannot connect to PostgreSQL. Check that the database is running and verify the .env connection settings."
            );
        } else {
            console.error("Server failed to start:", error);
        }
        process.exit(1);
    });
}

module.exports = { start, createRepository };
