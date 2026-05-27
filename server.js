const { createApp } = require("./backend/app");
const { config } = require("./backend/config");
const { createPostgresBookRepository } = require("./backend/repositories/postgresBookRepository");

async function start() {
    const repository = await createPostgresBookRepository(config.postgres);
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

if (require.main === module) {
    start().catch((error) => {
        console.error("Server failed to start:", error);
        process.exit(1);
    });
}

module.exports = { start };
