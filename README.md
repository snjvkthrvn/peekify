# Replay - Your Daily Music Diary

A Spotify-integrated social music diary that transforms your daily listening into shareable moments. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Automatic Tracking**: Passive Spotify listening tracking throughout the day
- **Daily Reveals**: Get your song of the day at 9:30pm with beautiful animations
- **Visual Calendar**: Archive your daily songs in a stunning calendar view
- **Social Feed**: See what friends are listening to with BeReal-style reactions
- **Profile Stats**: Top tracks, artists, and genres from your Spotify data
- **PWA Support**: Install as a Progressive Web App for offline access
- **Push Notifications**: Browser notifications when your song is ready
- **Real-time Updates**: WebSocket integration for live reactions and comments

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Context + SWR patterns
- **Real-time**: WebSocket
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Spotify Developer account
- Backend API running (see backend setup)

### Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Supabase Redirect URL (for development)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# VAPID Public Key (for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
\`\`\`

### Installation

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

## Project Structure

\`\`\`
├── app/                      # Next.js App Router pages
│   ├── (app)/               # Authenticated app routes
│   ├── auth/                # Authentication pages
│   ├── calendar/            # Calendar view
│   ├── feed/                # Social feed
│   ├── profile/             # User profiles
│   ├── settings/            # Settings page
│   └── onboarding/          # Onboarding flow
├── components/              # React components
│   ├── calendar/            # Calendar components
│   ├── feed/                # Feed components
│   ├── layout/              # Navigation components
│   ├── profile/             # Profile components
│   ├── settings/            # Settings components
│   ├── shared/              # Shared/reusable components
│   └── ui/                  # shadcn/ui components
├── contexts/                # React contexts
│   ├── auth-context.tsx     # Authentication state
│   └── reveal-context.tsx   # Daily reveal state
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
│   ├── api.ts              # API client
│   ├── notifications.ts     # Push notifications
│   ├── tracking.ts          # Spotify tracking
│   ├── websocket.ts         # WebSocket client
│   └── utils.ts             # Helper functions
├── public/                  # Static assets
│   ├── manifest.json        # PWA manifest
│   └── service-worker.js    # Service worker
└── types/                   # TypeScript types

\`\`\`

## Key Features Explained

### Spotify Tracking

The app uses passive tracking to monitor your Spotify listening:
- Polls Spotify API every 2 minutes when tab is visible
- Every 15 minutes when tab is hidden
- Syncs data to backend for persistence
- Stops tracking after 9:30pm

### Daily Reveals

At 9:30pm each day:
- Backend calculates your most-played song
- Push notification sent to your browser
- Animated reveal screen shows your song with stats
- Confetti celebration for first-time reveals

### BeReal-Style Reactions

React to friends' songs with:
- Your profile picture + emoji
- Reactions appear in a ring around album art
- Real-time updates via WebSocket
- 8 emoji options: 🔥 ❤️ 💀 😭 🎯 👀 🤔 😍

### Calendar Archive

Visual music history with:
- Album art grid for each day
- Month navigation
- Hover previews
- Detailed day view with stats
- Aggregate statistics

## API Integration

All API calls go through the backend at `NEXT_PUBLIC_API_URL`. The frontend never stores secrets or Spotify tokens directly.

### Key Endpoints

- `POST /auth/spotify` - Initiate OAuth
- `GET /auth/callback` - Handle OAuth callback
- `GET /feed` - Get friend feed
- `GET /tracking/history` - Get calendar data
- `POST /reactions` - Add reaction to post
- `POST /friends/request` - Send friend request

See `lib/api.ts` for complete API client.

## PWA Features

The app is a Progressive Web App with:
- Installable on mobile and desktop
- Offline support via service worker
- Push notifications
- App shortcuts to Feed and Calendar
- Optimized for mobile-first experience

## Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Chrome Mobile ✅
- Safari iOS 14+ ✅ (limited notifications)

## Performance

- Lighthouse score: >90
- Core Web Vitals: All green
- Initial bundle: <200KB gzipped
- Code splitting for optimal loading
- Image optimization with Next.js Image
- Lazy loading for below-fold content

## Security

- No client-side token storage
- httpOnly cookies for sessions
- CORS configured on backend
- Environment variables for secrets
- XSS protection via React
- CSRF protection on backend

## Contributing

This is a frontend-only implementation. The backend must be implemented separately according to the PRD specifications.

## License

Private project - All rights reserved

## Acknowledgments

- Design inspired by BeReal and Spotify
- UI components from shadcn/ui
- Icons from Lucide React
