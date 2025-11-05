#  Willie's Keys

A marketplace for sharing Magic with others.

## Tech Stack

- **SvelteKit** - Full-stack framework
- **SQLite** - Database (via Drizzle ORM)
- **Cloudflare Pages** - Deployment (free)

## Setup

### Prerequisites
- Node.js 18+

### Installation

1. Clone the repo
```bash
git clone <your-repo-url>
cd disney-pass-share
```

2. Install dependencies
```bash
npm install
```

3. Generate database
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

4. Seed database
```bash
npx tsx src/lib/db/seed.ts
```

5. Run dev server
```bash
npm run dev
```

Open http://localhost:5173

## Deployment

Deploy to Cloudflare Pages (free):
```bash
npm run build
```

Connect your GitHub repo to Cloudflare Pages dashboard.

## Database Schema

**passes** table:
- id (integer, primary key)
- title (text)
- owner (text)
- price (integer)
- passType (text)
- availableDates (text)
