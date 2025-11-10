# Willie's Keys

A marketplace for sharing Disney Magic Key passes, inspired by Steamboat Willie (public domain, 1928).

## Features

- Browse available Disney Magic Key passes
- User authentication with secure login/registration
- List your own pass for others to use
- Edit your pass details
- Delete passes with confirmation
- Responsive design (mobile & desktop)
- Clean, minimal Steamboat Willie aesthetic

## Tech Stack

- **SvelteKit** - Full-stack framework
- **SQLite** - Local development database
- **Cloudflare D1** - Production database
- **Drizzle ORM** - Type-safe database queries
- **Cloudflare Pages** - Free hosting with auto-deploy

## Database Architecture

This project uses a robust database connection pattern with:

- **Singleton Pattern** - Maintains a single database connection throughout the application
- **Provider Pattern** - Abstracts database implementations (SQLite for development, D1 for production)
- **Factory Pattern** - Creates the appropriate database provider based on environment

The database connections are managed automatically based on the environment:
- **Development** (`npm run dev`): Uses local SQLite database (`local.db`)
- **Production** (`npm run build`): Uses Cloudflare D1 database

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
npm run seed
```

5. Run development server
```bash
npm run dev
```

Open http://localhost:5173

### Setup Authentication

1. Generate database with authentication tables
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

2. Create a test user account
```bash
# You can register through the UI or run:
npm run seed:users
```

3. Update your D1 database with auth tables
```bash
npx wrangler d1 execute willies-keys-db --remote --file=./drizzle/[migration-file].sql
```


## Database Management

### Seed Data

**Generate sample passes for local development:**
```bash
npm run seed
```

**Generate SQL for production seeding:**
```bash
npm run seed:sql
```

This will output SQL that can be applied to your production database:
```bash
npm run seed:sql > seed.sql
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

## Project Structure
```
willies-keys/
├── src/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts          # Database client (singleton)
│   │   │   ├── factory.ts         # Database factory
│   │   │   ├── index.ts           # Main database API
│   │   │   ├── schema.ts          # Database schema
│   │   │   ├── seed.ts            # Seeding script
│   │   │   └── providers/         # Database providers
│   │   │       ├── types.ts       # Provider interfaces
│   │   │       ├── sqlite-provider.ts  # SQLite implementation
│   │   │       └── d1-provider.ts # Cloudflare D1 implementation
│   │   └── server/
│   │       └── auth.ts            # Authentication logic
│   └── routes/                    # SvelteKit routes
│       ├── +page.svelte           # Homepage (browse passes)
│       ├── +page.server.ts        # Load passes from DB
│       ├── add/                   # Add pass route
│       ├── pass/[id]/             # Pass detail routes
│       └── login/, signup/, etc.  # Auth routes
├── static/                        # Static assets
├── drizzle/                       # Generated migrations
├── wrangler.toml                  # Cloudflare configuration
├── drizzle.config.ts             # Drizzle ORM configuration
└── package.json                  # Project dependencies
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
npm run seed:sql > seed.sql
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

4. Every push to `main` auto-deploys!

## Scripts

- `npm run dev` - Start development server (uses SQLite)
- `npm run dev:prod` - Start development server simulating production (uses SQLite with production settings)
- `npm run build` - Build for production (targets Cloudflare D1)
- `npm run build:dev` - Build development version (uses SQLite)
- `npm run preview` - Preview production build locally
- `npm run seed` - Seed local database with sample data
- `npm run seed:sql` - Generate SQL for production seeding


## Authentication System

Willie's Keys now includes a complete authentication system with the following features:

- User registration with secure password hashing
- Login/logout functionality
- Session management with secure cookies
- Protected routes for pass management

The authentication system uses:
- Bcrypt for secure password hashing
- Cryptographically secure session tokens
- HttpOnly cookies for enhanced security
- Database tables for users, accounts, and sessions

## Database Architecture Update

The database schema has been extended to include authentication-related tables:

- **user** - Stores user profiles with name, email, and verification status
- **account** - Manages authentication providers and credentials
- **session** - Handles active user sessions
- **verification** - Supports email verification and password reset

All database interactions now use our robust provider pattern with:
- Type-safe schema definitions
- Singleton database client for efficient connection management
- Separate providers for SQLite (development) and D1 (production)
- Factory pattern to instantiate the appropriate database provider

## User Interface Updates

The application now features:
- Dynamic header that shows user information when logged in
- Login and registration forms with validation
- Secure authentication flows
- User-specific content views

## License

MIT

## Credits

Inspired by Steamboat Willie (1928), now in the public domain.
