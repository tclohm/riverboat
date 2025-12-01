# Willie's Keys

A marketplace for sharing Disney Magic Key passes, inspired by Steamboat Willie (public domain, 1928).

## Features

- **Browse passes** - View all available Magic Key passes from other users
- **Request passes** - Submit requests to use passes with a date range picker and contact info
- **Manage passes** - Create, edit, and delete your own pass listings
- **Notifications** - Receive notifications when others request your passes
- **Inquiries** - Review and approve/decline pass requests from other users
- **User profiles** - View and edit your profile with personal information (name, phone, location, bio)
- **Account stats** - See your pass count, bookings, and rating at a glance
- **User authentication** - Secure login/registration with session management
- **Responsive design** - Mobile-friendly interface
- **Clean aesthetic** - Minimal, Steamboat Willie-inspired design

## New Features

### User Profile System
- Complete profile management with editable fields
- Profile fields: name, email, phone, location, and bio
- View account statistics (passes listed, total bookings, rating)
- Member since date tracking
- Account deletion with confirmation

### Date Range Picker
- Users can select pass dates using HTML5 calendar inputs
- Automatic date formatting (e.g., "Dec 15-17, 2025" or "Dec 15 - Jan 5, 2025")
- Works across different months and years

### Pass Request System
- Users can submit requests to use other users' passes
- Include requested dates, contact info, and a personal message
- Pass owners receive notifications about new requests
- Approve or decline requests with one click

### Notification System
- Real-time notifications for pass requests
- Auto-archive notifications after requested dates pass (4AM following end date)
- Mark notifications as read
- Track notification status (pending, approved, declined)

## Tech Stack

- **SvelteKit** - Full-stack framework with server-side rendering
- **SQLite** - Local development database
- **Cloudflare D1** - Production database (serverless)
- **Drizzle ORM** - Type-safe database queries with migrations
- **Cloudflare Pages** - Free hosting with auto-deploy on git push
- **Lucide Icons** - Beautiful SVG icons
- **HTML5 Date Input** - Native calendar date picker

## Database Architecture

This project uses a robust database connection pattern:

- **Singleton Pattern** - Maintains a single database connection throughout the application
- **Provider Pattern** - Abstracts database implementations (SQLite for development, D1 for production)
- **Factory Pattern** - Creates the appropriate database provider based on environment

### Database Schema

- **user** - User profiles with authentication info and profile fields (phone, location, bio)
- **account** - User account and authentication provider data
- **session** - Active user sessions with secure tokens
- **passes** - Magic Key pass listings (title, type, price, available dates)
- **inquiries** - Pass requests with dates, contact info, and status
- **notifications** - System notifications for pass activity
- **verification** - Email verification and password reset tokens

Connections are managed automatically:
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

3. Generate and initialize database
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

4. Seed with sample data
```bash
npm run seed
```

5. Start development server
```bash
npm run dev
```

Open http://localhost:5173

### Testing Authentication

1. Register a new account through the UI
2. Create passes and test the full flow
3. Use multiple browsers/tabs to simulate different users
4. Visit `/profile` to view and edit your profile

## Database Management

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

### Seeding

**Seed local database:**
```bash
npm run seed
```

**Generate SQL for production:**
```bash
npm run seed:sql > seed.sql
npx wrangler d1 execute willies-keys-db --remote --file=seed.sql
```

## Project Structure

```
willies-keys/
├── src/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts               # Database client (singleton)
│   │   │   ├── factory.ts              # Database factory
│   │   │   ├── index.ts                # Main database API
│   │   │   ├── schema.ts               # Database schema
│   │   │   ├── seed.ts                 # Seeding script
│   │   │   └── providers/              # Database providers
│   │   │       ├── types.ts            # Provider interfaces
│   │   │       ├── sqlite-provider.ts  # SQLite (dev)
│   │   │       └── d1-provider.ts      # Cloudflare D1 (prod)
│   │   ├── components/
│   │   │   └── DateRangePicker.svelte  # Date range selector component
│   │   └── server/
│   │       └── auth.ts                 # Authentication logic
│   └── routes/
│       ├── +page.svelte                # Homepage (browse passes)
│       ├── +page.server.ts             # Load passes from DB
│       ├── add/                        # Create new pass
│       ├── pass/[id]/                  # Pass details & inquiries
│       ├── admin/                      # User dashboard
│       ├── bookings/                   # User's booking requests
│       ├── requests/                   # Received pass requests
│       ├── profile/                    # User profile & settings
│       ├── notifications/              # View notifications & manage requests
│       ├── login/, signup/             # Auth routes
│       └── ...
├── static/                             # Static assets
├── drizzle/                            # Migrations
├── wrangler.toml                       # Cloudflare config
├── drizzle.config.ts                   # Drizzle config
└── package.json
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

4. Copy database ID to `wrangler.toml`:
```toml
[[d1_databases]]
binding = "willies_keys_db"
database_name = "willies-keys-db"
database_id = "your-database-id-here"
```

5. Run migrations on D1
```bash
npx drizzle-kit generate
npx wrangler d1 execute willies-keys-db --remote --file=./drizzle/[latest-migration].sql
```

### Deploy to Cloudflare Pages

1. Push to GitHub
```bash
git push
```

2. Connect at https://dash.cloudflare.com
   - **Workers & Pages** → **Create application** → **Pages**
   - Import your GitHub repository
   - Framework: **SvelteKit**
   - Build command: `npm run build`
   - Output directory: `.svelte-kit/cloudflare`

3. Add D1 binding in Cloudflare Pages settings
   - **Settings** → **Functions** → **D1 database bindings**
   - Variable: `willies_keys_db`
   - Database: Select `willies-keys-db`

4. Every push to `main` auto-deploys!

## Scripts

```bash
npm run dev              # Start dev server (SQLite)
npm run dev:prod        # Dev server with prod settings
npm run build           # Build for production (D1)
npm run build:dev       # Build for dev (SQLite)
npm run preview         # Preview production build
npm run seed            # Seed local DB with sample data
npm run seed:sql        # Generate SQL for production seeding
```

## Authentication System

Secure user authentication with:

- Password hashing (Bcrypt)
- Session management with secure HttpOnly cookies
- Protected routes for authenticated users only
- User registration and login flows
- Email verification support (framework in place)

## How It Works

### Creating a Pass

1. Login or create an account
2. Go to "Add Pass"
3. Fill in pass details (type, price, available dates)
4. Pass appears on homepage for others to request

### Requesting a Pass

1. Browse available passes
2. Click "Request This Pass"
3. Use the date picker to select your requested dates
4. Enter contact info and message
5. Submit request
6. Pass owner receives notification

### Managing Requests

1. Go to Requests or Bookings page
2. View pending/approved/declined pass requests
3. Approve or decline each request
4. Approved notifications auto-archive after dates pass

### Managing Your Profile

1. Click "Profile" in the sidebar
2. View your profile card with avatar and member since date
3. Click "Edit Profile" to update your information
4. Edit: name, phone, location, and bio (max 160 characters)
5. Save changes or cancel
6. View account stats: passes listed, total bookings, rating
7. Optionally delete your account (permanent action)

## License

MIT

## Credits

Inspired by Steamboat Willie (1928), now in the public domain.
