# Willie's Keys

A marketplace for sharing Disney Magic Key passes, inspired by Steamboat Willie (public domain, 1928).

## Features

-  Browse available Disney Magic Key passes
-  List your own pass for others to use
-  Edit your pass details
-  Delete passes with confirmation
-  Responsive design (mobile & desktop)
-  Clean, minimal Steamboat Willie aesthetic

## Tech Stack

- **SvelteKit** - Full-stack framework
- **SQLite** - Local development database
- **Cloudflare D1** - Production database
- **Drizzle ORM** - Type-safe database queries
- **Cloudflare Pages** - Free hosting with auto-deploy

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd willies-keys
```

2. Install dependencies
```bash
npm install
```

3. Generate local database
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

4. Seed local database with sample passes
```bash
npx tsx src/lib/db/seed.ts
```

5. Run development server
```bash
npm run dev
```

Open http://localhost:5173

## Database Management

### Seed Data

**Generate 50 fake passes locally:**
```bash
npx tsx src/lib/db/seed.ts
```

**Generate SQL for production:**
```bash
npx tsx src/lib/db/seed.ts --sql > seed.sql
npx wrangler d1 execute willies-keys-db --remote --file=seed.sql
```

### Migrations

**Create and apply migration locally:**
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**Apply migration to production D1:**
```bash
npx drizzle-kit generate
npx wrangler d1 execute willies-keys-db --remote --file=./drizzle/[migration-file].sql
```

## Production Deployment

### Initial Cloudflare D1 Setup

1. Install Wrangler CLI
```bash
npm install -D wrangler
```

2. Login to Cloudflare
```bash
npx wrangler login
```

3. Create D1 database
```bash
npx wrangler d1 create willies-keys-db
```

4. Copy the database ID to `wrangler.toml`:
```toml
[[d1_databases]]
binding = "willies_keys_db"
database_name = "willies-keys-db"
database_id = "your-database-id-here"
```

5. Run migrations on D1
```bash
npx drizzle-kit generate
npx wrangler d1 execute willies-keys-db --remote --file=./drizzle/[migration-file].sql
```

6. Seed production database
```bash
npx tsx src/lib/db/seed.ts --sql > seed.sql
npx wrangler d1 execute willies-keys-db --remote --file=seed.sql
```

### Deploy to Cloudflare Pages

1. Push to GitHub
```bash
git push
```

2. Connect repository at https://dash.cloudflare.com
   - Go to **Workers & Pages** → **Create application** → **Pages**
   - Import your GitHub repository
   - Framework preset: **SvelteKit**
   - Build command: `npm run build`
   - Build output directory: `.svelte-kit/cloudflare`

3. Add D1 binding in Cloudflare Pages settings:
   - Go to **Settings** → **Functions** → **D1 database bindings**
   - Variable name: `willies_keys_db`
   - D1 database: Select `willies-keys-db`

4. Every push to `main` auto-deploys! 🎉

## Project Structure
```
willies-keys/
├── src/
│   ├── lib/
│   │   └── db/
│   │       ├── schema.ts       # Database schema
│   │       ├── index.ts        # Database connection (dev/prod)
│   │       ├── local.ts        # Local SQLite connection
│   │       └── seed.ts         # Seed script
│   └── routes/
│       ├── +page.svelte        # Homepage (browse passes)
│       ├── +page.server.ts     # Load passes from DB
│       ├── add/
│       │   ├── +page.svelte    # Add new pass form
│       │   └── +page.server.ts # Create pass action
│       └── pass/[id]/
│           ├── +page.svelte    # Pass detail page
│           ├── +page.server.ts # Load single pass
│           └── edit/
│               ├── +page.svelte    # Edit pass form
│               └── +page.server.ts # Update/delete actions
├── wrangler.toml               # Cloudflare configuration
├── drizzle.config.ts           # Drizzle ORM configuration
└── package.json
```

## Environment Detection

The app automatically detects whether it's running in development or production:

- **Development mode** (`npm run dev`): Uses local SQLite database (`local.db`)
- **Production mode** (`npm run build`): Uses Cloudflare D1 database

This is controlled by `import.meta.env.MODE` in the database connection logic.

## Database Schema

### passes
- `id` - integer (primary key)
- `title` - text (e.g., "Magic Key - Dream Pass")
- `owner` - text (pass holder's name)
- `price` - integer (price per day in dollars)
- `pass_type` - text (Dream Key, Inspire Key, etc.)
- `available_dates` - text (when the pass is available)
- `user_id` - text (optional, for future auth)

## Scripts

- `npm run dev` - Start development server (uses local SQLite)
- `npm run build` - Build for production (uses Cloudflare D1)
- `npm run preview` - Preview production build locally
- `npx tsx src/lib/db/seed.ts` - Seed local database
- `npx tsx src/lib/db/seed.ts --sql` - Generate SQL for production seeding

## License

MIT

## Credits

Inspired by Steamboat Willie (1928), now in the public domain.
