# web-lab-2

Static bookstore frontend with a Node/Express API and PostgreSQL storage.

## Local development

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env`. The example contains the connection values
   used by the Compose PostgreSQL service and the application port. Change the
   password for any non-local environment. `DATABASE_URL` can be used instead
   of the individual `PG*` variables.

3. Start PostgreSQL in Docker:

   ```sh
   docker compose up -d
   ```

4. Apply `database/postgres/schema.sql` and then load the idempotent sample data
   from `database/postgres/seed.sql`:

   ```sh
   npm run db:seed
   ```

5. Start the app:

   ```sh
   npm start
   ```

   The server uses PostgreSQL only. If the connection settings are missing or
   PostgreSQL is unavailable, startup fails with an error instead of using
   temporary in-memory data.

6. Run the server-side tests (the API tests use a test-only fake repository and
   do not require PostgreSQL):

   ```sh
   npm test
   ```

The server listens on `PORT` when provided, otherwise on port `3000`.

## Books API

- `GET /api/books` — list books
- `GET /api/books/:id` — get one book
- `POST /api/books` — create a book
- `PUT /api/books/:id` — update a book
- `DELETE /api/books/:id` — delete a book
- `GET /api/health` — check the application and PostgreSQL connection

## Full app deployment

Use a Node.js web service with PostgreSQL, for example Render, Railway, Fly.io, or a similar host.

Recommended settings:

- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `DATABASE_URL`; `PORT` is usually provided by the platform
- Seed command after the database is created: `npm run db:seed`

The Express server serves the frontend files and the `/api/books` API from the same deployment.

The app creates the `books` table automatically on startup, but it does not insert sample books automatically. Run `npm run db:seed` once per database to load the sample catalog.

## GitHub Pages

GitHub Pages can host only the static frontend. If using Pages, configure:

- Source: deploy from branch
- Branch: `main`
- Folder: `/ root`

This repo includes `.nojekyll` so Pages does not try to process the site with Jekyll. Pages will not run the Express API or connect to PostgreSQL, so catalog pages that call `/api/books` will not work unless the API is hosted separately and the frontend is changed to call that external API URL.
