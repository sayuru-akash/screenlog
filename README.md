# Screenlog

A modern, mobile-first watch tracker for TV shows, movies, and anime.

## Features

- **Track Shows & Movies**: Add content to your personal watchlist and track progress.
- **Episode Tracking**: Mark episodes as watched, see what to watch next, and track season progress.
- **Calendar**: View upcoming episodes from your tracked shows.
- **Discover**: Browse trending, popular, and top-rated shows and movies.
- **Search**: Find shows and movies quickly with debounced search.
- **Profile & Stats**: View your watching stats, top genres, and total watch time.
- **Dark & Light Mode**: Fully themed with system preference support.
- **Mobile-First**: Bottom navigation on mobile, top navigation on desktop.

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) - Full-stack framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Better Auth](https://www.better-auth.com/) - Authentication
- [Prisma](https://www.prisma.io/) - Database ORM
- [Neon PostgreSQL](https://neon.tech/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TMDB API](https://www.themoviedb.org/documentation/api) - Movie/TV metadata
- [TVmaze API](https://www.tvmaze.com/api) - TV episode data

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- TMDB API key

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd screenlog
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:5173"
TMDB_API_KEY="your-tmdb-api-key"
```

4. Set up the database:
```bash
npx prisma migrate dev --name init
```

5. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random secret for auth sessions |
| `BETTER_AUTH_URL` | Your app URL |
| `TMDB_API_KEY` | TMDB API read access token |
| `TVMAZE_API_KEY` | Optional TVmaze key |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking

## Project Structure

```
src/
  lib/
    components/      # UI components
    server/          # Server-only code (auth, db)
    services/        # External API integrations
    stores/          # Svelte stores
    types/           # TypeScript types
    utils.ts         # Utility functions
  routes/
    (app)/           # Authenticated routes
    api/             # API endpoints
    signin/          # Auth pages
    signup/
    forgot-password/
    +page.svelte     # Landing page
prisma/
  schema.prisma      # Database schema
```

## Security

- External API keys are strictly server-side
- Authentication handled by Better Auth with secure sessions
- Database queries parameterized via Prisma
- Protected routes redirect unauthenticated users

## License

MIT
