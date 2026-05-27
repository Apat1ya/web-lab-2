const config = {
    port: Number(process.env.PORT || 3000),
    postgres: {
        connectionString:
            process.env.DATABASE_URL ||
            "postgres://postgres:postgres@localhost:5432/bookstore",
    },
};

module.exports = { config };
