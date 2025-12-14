# Willie's Keys - Pass Sharing Platform

A web application that enables pass owners to list their unused passes and renters to book them for specific dates. Built with SvelteKit, TypeScript, Drizzle ORM, and SQLite.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Deployment](#deployment)

## Overview

Willie's Keys is a modern pass-sharing marketplace. Pass owners can create listings for their passes with daily rates, manage booking requests, and track approvals. Renters can search available passes, book specific date ranges, and manage their reservations.

The application implements an intelligent calendar system that dynamically tracks booked dates, preventing double-booking while maintaining data integrity through automatic overlap merging.

## Features

### Pass Owners
- Create and manage pass listings with title, type, and daily pricing
- View interactive calendar showing real-time booking status
- Manage incoming booking requests from renters
- Approve or decline booking requests
- Receive notifications for new requests and changes
- Maintain detailed profile with location and contact information

### Renters
- Browse all available passes with comprehensive search and filtering
- View interactive calendar with real-time availability
- Submit booking requests with specific date ranges
- Receive notifications on request status changes
- Track all bookings and reservation history
- Manage personal profile and contact details

### Smart Calendar System
- Real-time availability tracking based on approved bookings
- Automatic date blocking upon booking approval
- Intelligent merging of overlapping date ranges
- Responsive design for mobile and desktop
- Support for multi-month date selections

## Tech Stack

- **Frontend**: Svelte 4, SvelteKit 2
- **Language**: TypeScript 5.0+
- **Database**: SQLite with better-sqlite3
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **Authentication**: Session-based with bcryptjs
- **API**: REST with SvelteKit server routes

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd willies-keys

# Install dependencies
npm install
```

### Database Setup

```bash
# Seed database with sample data
npm run seed
```

### Development

```bash
# Start development server
npm run dev
```

Server runs at http://localhost:5173

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
willies-keys/
├── src/
│   ├── app.css              # Global styles
│   ├── app.d.ts             # TypeScript definitions
│   ├── app.html             # HTML template
│   ├── hooks.server.ts       # Server-side hooks
│   │
│   ├── lib/
│   │   ├── components/       # Reusable components
│   │   │   ├── Calendar.svelte
│   │   │   ├── InteractiveCalendar.svelte
│   │   │   ├── DateRangePicker.svelte
│   │   │   ├── NotificationsMenu.svelte
│   │   │   └── SearchBar.svelte
│   │   │
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── client.ts
│   │   │   ├── factory.ts
│   │   │   ├── schema.ts
│   │   │   ├── seed.ts
│   │   │   └── providers/
│   │   │
│   │   └── server/
│   │       ├── auth.ts
│   │       └── dateUtils.ts
│   │
│   └── routes/
│       ├── +page.svelte      # Homepage
│       ├── +layout.svelte    # Main layout
│       ├── api/              # API endpoints
│       ├── login/            # Authentication
│       ├── signup/
│       ├── logout/
│       ├── admin/            # Owner dashboard
│       ├── add/              # Create pass
│       ├── pass/[id]/        # Pass details
│       ├── requests/         # Manage requests
│       ├── bookings/         # View bookings
│       └── profile/          # User profile
│
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Core Features

### Smart Calendar System

The calendar tracks booking availability using a JSON-based date range system:

```typescript
// Booked dates stored as JSON array
passes.booked_dates = [
  {start: "2025-12-15", end: "2025-12-17"},
  {start: "2025-12-20", end: "2025-12-22"}
]
```

Key capabilities:
- Real-time API fetching of booked dates
- Automatic merging of overlapping ranges
- Responsive calendar component
- Strict date validation

### Authentication

Session-based authentication system:
- Email/password signup and login
- Secure password hashing with bcryptjs
- Session tokens stored in HTTP-only cookies
- User context loaded on page load

Routes:
- `/login` - Sign in
- `/signup` - Create account
- `/logout` - Sign out
- `/profile` - Manage profile

### Notifications

System notifications for:
- New booking requests
- Request approvals and declines
- Notification management with read/dismiss actions

### Booking Workflow

```
1. Owner creates pass (booked_dates = "[]")
2. Renter submits booking request
3. Owner reviews requests at /requests
4. Owner approves/declines
5. If approved: dates added to booked_dates
6. Calendar automatically reflects changes
7. Future users see those dates as unavailable
```

### Responsive Design

- Mobile-first approach
- Tailwind CSS utilities
- Professional design system
- Breakpoints: 480px, 768px, 968px+

## Database Schema

### passes
- id: Primary key
- title: Pass name
- price: Daily rate
- passType: Key type (Dream, Inspire, Enchant, Believe)
- bookedDates: JSON array of date ranges
- userId: Owner reference

### users
- id: Primary key
- name: Full name
- email: Unique email address
- password: Hashed (in accounts table)
- phone: Contact number
- location: User location
- bio: Profile bio
- Timestamps for creation/updates

### inquiries
- id: Primary key
- passId: Reference to pass
- senderUserId: Requester
- receiverUserId: Pass owner
- message: Request message
- contactInfo: Contact details
- requestedDates: Date range string
- status: pending, approved, rejected
- read: Read status
- Timestamps

### notifications
- id: Primary key
- userId: Recipient
- passId: Related pass
- type: inquiry, booking
- title: Notification title
- message: Notification body
- read: Read status
- archived: Archive status
- metadata: JSON metadata

### sessions
- id: Primary key
- userId: Session owner
- token: Unique session token
- expiresAt: Expiration date
- ipAddress: Client IP
- userAgent: Browser info
- Timestamps

## API Endpoints

### Passes
```
GET /api/passes/[id]/booked-dates
Returns: { bookedDates: [{start, end}, ...] }
```

### Notifications
```
POST /api/notifications/[id]/read
POST /api/notifications/[id]/dismiss
POST /api/notifications/read-all
```

### Inquiries
```
POST /api/inquiries/mark-as-read
```

## Development

### Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Format code
npm run format

# Lint code
npm run lint
```

### Database Commands

```bash
# Seed database
npm run seed

# Fresh seed (reset)
npm run seed:fresh
```

### Code Standards

- TypeScript for type safety
- Svelte best practices
- Drizzle ORM for database access
- Consistent file structure
- Comprehensive error handling

## Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

### Cloudflare Workers + D1

The application supports Cloudflare D1 database:
- D1Provider automatically used in production
- Environment variables from platform.env
- Compatible with Workers environment

### Environment Variables

```
VITE_API_URL=https://your-domain.com
DATABASE_URL=sqlite:./local.db
SESSION_SECRET=your-secret-key
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

## Security

- Secure password hashing with bcryptjs
- HTTP-only session cookies
- CSRF protection via SvelteKit
- Input validation on all forms
- Server-side authorization checks
- SQL injection prevention via Drizzle ORM

## Testing

```bash
# Run test suite
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Data Format

All dates use ISO 8601 format: YYYY-MM-DD

Example:
- Single date: 2025-12-15
- Date range: {start: "2025-12-15", end: "2025-12-20"}
- Display format: "Dec 15-20, 2025"

## Performance Considerations

- Booked dates fetched via API on calendar mount
- JSON storage keeps data structured and queryable
- Indexed database queries for speed
- Component-level caching of availability data

## License

MIT

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create detailed issue with reproduction steps
3. Include environment information (Node version, OS, browser)

## Contributing

1. Create feature branch from main
2. Implement changes with TypeScript
3. Test thoroughly with test suite
4. Submit pull request with detailed description

---

Last updated: December 2025
