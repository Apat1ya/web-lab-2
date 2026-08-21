require("dotenv").config({ quiet: true });

const config = {
    port: Number(process.env.PORT || 3000),
    postgres: getPostgresConfig(),
};

function getPostgresConfig() {
    if (process.env.DATABASE_URL) {
        return { connectionString: process.env.DATABASE_URL };
    }

    return {
        host: process.env.PGHOST,
        port: process.env.PGPORT === undefined ? undefined : Number(process.env.PGPORT),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
    };
}

function validatePostgresConfig(postgresConfig) {
    if (postgresConfig.connectionString) {
        return;
    }

    const requiredFields = ["host", "port", "database", "user", "password"];
    const missingFields = requiredFields.filter((field) => (
        postgresConfig[field] === undefined || postgresConfig[field] === ""
    ));

    if (missingFields.length > 0) {
        const error = new Error(
            "PostgreSQL configuration is incomplete. Set DATABASE_URL or PGHOST, PGPORT, PGDATABASE, PGUSER, and PGPASSWORD in .env."
        );
        error.code = "PG_CONFIG_MISSING";
        throw error;
    }

    if (!Number.isInteger(postgresConfig.port) || postgresConfig.port < 1 || postgresConfig.port > 65535) {
        const error = new Error("PGPORT must be an integer between 1 and 65535.");
        error.code = "PG_CONFIG_INVALID";
        throw error;
    }
}

module.exports = { config, validatePostgresConfig };
