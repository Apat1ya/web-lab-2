# web-lab-2

Static bookstore frontend with a Node/Express API and PostgreSQL storage.

## Local development

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a PostgreSQL database and configure local credentials.

   Copy `.env.example` to `.env`, then edit `PGPASSWORD` to match the password you set for your local `postgres` user. You can also replace the `PG*` values with one `DATABASE_URL` value:

   ```text
   postgres://postgres:postgres@localhost:5432/bookstore
   ```

   The app falls back to those same local defaults if no `.env` or environment variables are provided.

3. Apply schema and sample data:

   ```sh
   npm run db:seed
   ```

4. Start the app:

   ```sh
   npm start
   ```

The server listens on `PORT` when provided by the deployment platform, otherwise `3000`.

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
