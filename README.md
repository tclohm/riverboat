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

The application implements an intelligent calendar system that dynamically tracks booked dates, prevents double-booking, blocks past dates from selection, and maintains data integrity through automatic overlap merging.

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
- Past date blocking (dates before today are disabled and non-selectable)
- Multi-month date range selection with seamless navigation
- Responsive design for mobile and desktop
- Visual indicators for available, past, booked, and selected dates

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
│   │   │   ├── SearchBar.svelte
│   │   │   └── Other components
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

The calendar tracks booking availability using a JSON-based date range system with intelligent date filtering:

```typescript
// Booked dates stored as JSON array
passes.booked_dates = [
  {start: "2025-12-15", end: "2025-12-17"},
  {start: "2025-12-20", end: "2025-12-22"}
]
```

Key capabilities:
- Real-time API fetching of booked dates on component mount
- Automatic merging of overlapping date ranges
- Past date blocking (dates before today disabled and non-selectable)
- Multi-month navigation with disabled previous button in current month
- Date validation prevents selecting past dates, booked dates, or beyond available range
- Responsive calendar component works on mobile and desktop
- Visual feedback with distinct styling for each date state

Date Status Indicators:
- **Available** (White): Open for booking, can select
- **Past** (Grey): Date has already passed, cannot select
- **Booked** (Tan): Already reserved by another user, cannot select
- **Selected** (Orange): Dates you've chosen for your booking

### Authentication

Session-based authentication system:
- Email/password signup and login
- Secure password hashing with bcryptjs
- Session tokens stored in HTTP-only cookies
- User context loaded on page load
- Automatic session validation on each request

Routes:
- `/login` - Sign in to existing account
- `/signup` - Create new account
- `/logout` - Sign out
- `/profile` - Manage profile settings

### Notifications

System notifications for:
- New booking requests from renters
- Request approvals and declines
- Notification management with read and dismiss actions
- Real-time notification count in header
- Persistent notification storage with read/archived status

### Booking Workflow

```
1. Owner creates pass (booked_dates = "[]")
2. Renter views pass and selects available dates
3. Renter submits booking request with message
4. Owner receives notification of new request
5. Owner reviews request at /requests page
6. Owner approves or declines request
7. If approved: dates added to booked_dates
8. Calendar automatically reflects changes
9. Future renters see those dates as booked
10. Requester receives notification of decision
```

### Responsive Design

- Mobile-first approach with Tailwind CSS utilities
- Professional design system with warm, earthy color palette
- Breakpoints: 480px (mobile), 768px (tablet), 968px+ (desktop)
- Touch-friendly calendar interface on mobile devices

## Database Schema

### passes
- id: Primary key (auto-increment)
- title: Pass name and description
- price: Daily rental rate in dollars
- passType: Key type (Dream, Inspire, Enchant, Believe)
- bookedDates: JSON array of {start, end} date ranges
- userId: Reference to pass owner

### user
- id: Primary key (hex string)
- name: Full name
- email: Unique email address
- emailVerified: Email verification status
- phone: Contact phone number
- location: User location
- bio: Profile biography (max 160 chars)
- createdAt: Account creation timestamp
- updatedAt: Last update timestamp

### inquiries
- id: Primary key (auto-increment)
- passId: Reference to pass being booked
- senderUserId: Reference to renter (user making request)
- receiverUserId: Reference to pass owner
- message: Booking request message
- contactInfo: Contact method provided by renter
- requestedDates: Date range string (e.g., "Dec 15-20, 2025")
- status: Request status (pending, approved, rejected)
- read: Read status for renter
- createdAt: Request submission timestamp
- updatedAt: Last status change timestamp

### notifications
- id: Primary key (auto-increment)
- userId: Reference to notification recipient
- passId: Reference to related pass
- type: Notification type (inquiry_new, inquiry_approved, inquiry_rejected)
- title: Notification title
- message: Notification body text
- read: Read status
- archived: Archive status
- metadata: JSON metadata with contextual data
- createdAt: Notification creation timestamp

### sessions
- id: Primary key (hex string)
- userId: Reference to logged-in user
- token: Unique session token
- expiresAt: Session expiration timestamp
- ipAddress: Client IP address
- userAgent: Browser user agent string
- createdAt: Session creation timestamp
- updatedAt: Last activity timestamp

## API Endpoints

### Passes
```
GET /api/passes/[id]/booked-dates
Description: Fetch booked dates for a specific pass
Response: { bookedDates: [{start: "YYYY-MM-DD", end: "YYYY-MM-DD"}, ...] }
```

### Notifications
```
POST /api/notifications/[id]/read
Description: Mark single notification as read

POST /api/notifications/[id]/dismiss
Description: Delete/dismiss a notification

POST /api/notifications/read-all
Description: Mark all unread notifications as read
```

### Inquiries
```
POST /api/inquiries/mark-as-read
Description: Mark inquiry notifications as read
Body: { inquiryIds: number[], status: string }
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
```

### Database Commands

```bash
# Seed database with sample data
npm run seed
```

### Code Standards

- TypeScript for type safety and better IDE support
- Svelte component best practices
- Drizzle ORM for type-safe database access
- Consistent file and folder structure
- Comprehensive error handling on both client and server
- Server-side validation for all user inputs

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
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security

- Secure password hashing with bcryptjs (10 salt rounds)
- HTTP-only session cookies prevent XSS attacks
- CSRF protection via SvelteKit
- Input validation on all forms and API endpoints
- Server-side authorization checks on protected routes
- SQL injection prevention via Drizzle ORM parameterized queries
- Session expiration after 30 days of inactivity

## Data Format

All dates use ISO 8601 format: YYYY-MM-DD

Examples:
- Single date: `2025-12-15`
- Date range: `{start: "2025-12-15", end: "2025-12-20"}`
- Display format: `"Dec 15-20, 2025"`

## Performance Considerations

- Booked dates fetched via API on calendar mount (not on every render)
- JSON storage keeps date data structured and queryable
- Indexed database queries for fast lookups
- Server-side pagination for large data sets
- Component-level caching of availability data

## Troubleshooting

### Calendar not showing dates
- Ensure booked dates API returns valid JSON
- Check browser console for fetch errors
- Verify pass ID is being passed correctly to calendar component

### Past dates still selectable
- Clear browser cache
- Ensure InteractiveCalendar component is up to date
- Check that `today` constant is properly initialized

### Notifications not appearing
- Verify database notifications table has records
- Check that userId matches authenticated user
- Ensure notification read status is correct

## License

MIT

## Support

For issues or questions:
1. Check existing documentation
2. Review troubleshooting section
3. Create detailed issue with reproduction steps
4. Include environment information (Node version, OS, browser)

## Contributing

1. Create feature branch from main
2. Implement changes with TypeScript
3. Test thoroughly in development
4. Submit pull request with detailed description
5. Ensure code follows project standards

---

Last updated: December 2025
