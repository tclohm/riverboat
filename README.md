# Willie's Keys 

A marketplace for sharing Disney Magic Key passes, inspired by Steamboat Willie.

## Tech Stack

- **SvelteKit** - Full-stack framework
- **SQLite** - Database via Drizzle ORM
- **Cloudflare Pages + D1** - Deployment (free)

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup

1. Clone and install
```bash
git clone
cd willies-keys
npm install
```

2. Generate local database
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

3. Seed local database
```bash
npx tsx src/lib/db/seed.ts
```

4. Run dev server
```bash
npm run dev
```

Open http://localhost:5173

## Production Deployment

### Cloudflare D1 Setup

1. Install Wrangler (Cloudflare CLI)
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

4. Add database ID to `wrangler.toml`

5. Run migrations on D1
```bash
npx wrangler d1 execute willies-keys-db --remote --file=./drizzle/[migration-file].sql
```

6. Seed production database
```bash
npx tsx src/lib/db/seed.ts --sql > seed.sql
npx wrangler d1 execute willies-keys-db --remote --file=seed.sql
```

### Deploy to Cloudflare Pages

1. Connect repo at https://dash.cloudflare.com
2. Select **Workers & Pages** → **Create application** → **Pages**
3. Import your GitHub repo
4. Framework: **SvelteKit**
5. Build command: `npm run build`
6. Deploy!

## Database Schema

**passes** table:
- `id` - integer (primary key)
- `title` - text
- `owner` - text
- `price` - integer
- `pass_type` - text
- `available_dates` - text

## License

MIT
