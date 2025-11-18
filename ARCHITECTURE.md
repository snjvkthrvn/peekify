# Replay Frontend Architecture

## Overview

Replay is a production-ready Progressive Web App (PWA) built with Next.js 16, TypeScript, and modern React patterns. This document outlines the architecture, patterns, and best practices used throughout the codebase.

## Core Technologies

### Framework & Language
- **Next.js 16**: App Router with React Server Components
- **TypeScript 5**: Full type safety across the application
- **React 19**: Latest features including Activity API

### Styling & UI
- **Tailwind CSS v4**: Utility-first CSS with custom theme
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built, customizable components
- **Framer Motion**: Smooth animations and transitions

### State Management
- **React Query (TanStack Query)**: Server state management, caching, and synchronization
- **React Context**: Auth state and theme management
- **Local State**: Component-level state with useState/useReducer

### Data Fetching
- **React Query**: All API calls with intelligent caching
- **WebSocket**: Real-time updates for feed, reactions, and notifications
- **Optimistic Updates**: Instant UI feedback before server confirmation

## Project Structure

\`\`\`
replay-frontend/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Authenticated layout group
│   │   └── layout.tsx           # Spotify tracker & WebSocket init
│   ├── auth/                    # Authentication pages
│   │   ├── login/
│   │   └── callback/
│   ├── calendar/                # Music calendar view
│   ├── feed/                    # Social feed
│   ├── profile/[username]/      # User profiles (dynamic)
│   ├── settings/                # User settings
│   ├── layout.tsx               # Root layout with providers
│   ├── error.tsx                # Error boundary
│   ├── not-found.tsx            # 404 page
│   └── globals.css              # Global styles & design tokens
│
├── components/
│   ├── calendar/                # Calendar-specific components
│   │   ├── calendar-grid.tsx   # Monthly calendar grid
│   │   ├── calendar-day.tsx    # Individual day cell
│   │   └── day-detail-modal.tsx
│   ├── feed/                    # Feed-specific components
│   │   ├── post-card.tsx       # Main post card with reactions
│   │   └── reveal-screen.tsx   # 9:30pm reveal animation
│   ├── layout/                  # Navigation & layout
│   │   ├── bottom-nav.tsx      # Mobile bottom navigation
│   │   └── sidebar-nav.tsx     # Desktop sidebar
│   ├── profile/                 # Profile components
│   ├── settings/                # Settings components
│   ├── shared/                  # Reusable components
│   │   ├── album-art.tsx       # Optimized album images
│   │   ├── profile-picture.tsx
│   │   ├── reaction-ring.tsx   # BeReal-style reaction overlay
│   │   └── install-pwa-prompt.tsx
│   ├── ui/                      # shadcn/ui primitives
│   └── error-boundary.tsx       # Class-based error boundary
│
├── contexts/
│   ├── auth-context.tsx         # Authentication state
│   ├── query-provider.tsx       # React Query wrapper
│   ├── theme-context.tsx        # Dark/light theme
│   └── reveal-context.tsx       # Daily reveal modal state
│
├── hooks/
│   ├── use-spotify-tracker.ts   # Spotify playback tracking
│   ├── use-toast.ts             # Toast notifications
│   └── use-mobile.tsx           # Mobile detection
│
├── lib/
│   ├── api.ts                   # API client with typed endpoints
│   ├── websocket.ts             # WebSocket hook with React Query
│   ├── query-client.ts          # React Query configuration
│   ├── notifications.ts         # Web Push notifications
│   ├── tracking.ts              # Spotify tracking logic
│   ├── sentry.ts                # Error tracking (Sentry)
│   └── utils.ts                 # Utility functions (cn, etc.)
│
├── types/
│   └── index.ts                 # TypeScript type definitions
│
└── public/
    ├── manifest.json            # PWA manifest
    ├── service-worker.js        # Service worker
    └── icons/                   # PWA icons (various sizes)
\`\`\`

## Architecture Patterns

### 1. Data Fetching Strategy

**React Query for All API Calls**
- Automatic caching and background refetching
- Optimistic updates for mutations
- Automatic retry and error handling
- Query invalidation for real-time sync

\`\`\`typescript
// Example: Feed with infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['feed'],
  queryFn: ({ pageParam = 1 }) => feedApi.getFeed(pageParam),
  getNextPageParam: (lastPage) => lastPage.hasMore ? page + 1 : undefined,
})
\`\`\`

**WebSocket for Real-time Updates**
- Connected at app layout level
- Triggers React Query invalidation on events
- Automatic reconnection with exponential backoff

\`\`\`typescript
// WebSocket triggers query refetch
case 'feed:new_post':
  queryClient.invalidateQueries({ queryKey: ['feed'] })
  break
\`\`\`

### 2. Authentication Flow

1. User clicks "Connect with Spotify"
2. Redirects to backend `/auth/spotify`
3. Backend handles OAuth, returns to `/auth/callback?code=...`
4. Frontend exchanges code for session
5. AuthContext stores user state
6. Protected routes check auth via context

### 3. PWA Architecture

**Service Worker Strategy**
- **Static Assets**: Cache-first with fallback
- **API Requests**: Network-first with cache fallback
- **Images**: Cache-first for album art
- **Offline Page**: Served when network unavailable

**Push Notifications**
- VAPID keys for Web Push
- Firebase Cloud Messaging integration
- Service worker handles notification clicks

### 4. Performance Optimizations

**Image Optimization**
- Next.js Image component with priority loading
- AVIF/WebP formats with automatic fallback
- Lazy loading for below-the-fold images
- Blur placeholder for album art

**Code Splitting**
- Route-based splitting (automatic)
- Dynamic imports for heavy components
- Tree-shaking for unused code

**React Query Caching**
- 1-minute stale time for feeds
- 5-minute garbage collection
- Background refetching on window focus

### 5. Accessibility (WCAG 2.1 AA)

**Keyboard Navigation**
- Focus management with visible indicators
- Skip-to-content link
- Proper tab order

**Screen Reader Support**
- Semantic HTML (main, nav, article, section)
- ARIA labels and roles
- Live regions for dynamic content
- Alt text for all images

**Visual Accessibility**
- High contrast colors (AAA on most text)
- Reduced motion support
- Focus visible states
- Large touch targets (48x48px minimum)

## State Management Layers

### 1. Server State (React Query)
- Feed posts, user profiles, calendar data
- Friends list, reactions, comments
- Cached and automatically synchronized

### 2. Client State (React Context)
- Authentication status and user data
- Theme preference (dark/light)
- Reveal modal state

### 3. URL State
- Current page/route
- Profile username
- Calendar month/year

### 4. Local Component State
- Form inputs
- Modal open/close
- Loading states

## API Integration

**Base URL**: `process.env.NEXT_PUBLIC_API_URL`

**Endpoints**:
- `/auth/*` - Authentication
- `/users/*` - User management
- `/tracking/*` - Spotify tracking data
- `/feed` - Social feed
- `/friends/*` - Friend management
- `/posts/:id/react` - Reactions
- `/posts/:id/comments` - Comments

**Request Format**:
- Credentials: `include` (cookies)
- Content-Type: `application/json`
- Authorization: Session-based (httpOnly cookies)

## Deployment Checklist

### Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL
- [ ] `NEXT_PUBLIC_WS_URL` - WebSocket URL
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Push notification key
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Error tracking (optional)

### Build Optimizations
- [ ] Remove console.logs in production
- [ ] Enable React Compiler
- [ ] Optimize images (AVIF/WebP)
- [ ] Generate sitemap
- [ ] Configure CSP headers

### PWA Requirements
- [ ] Generate all icon sizes (72-512px)
- [ ] Test service worker caching
- [ ] Verify offline functionality
- [ ] Test install prompt

### Performance Targets
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 100
- [ ] First Contentful Paint: < 1.8s
- [ ] Largest Contentful Paint: < 2.5s
- [ ] Cumulative Layout Shift: < 0.1

## Best Practices

### Component Organization
1. Server Components by default
2. Client Components only when needed (`"use client"`)
3. Separate presentational and container components
4. Co-locate related components

### TypeScript Usage
1. Strict mode enabled
2. No implicit any
3. Proper type imports
4. Interface over type for extensibility

### Error Handling
1. Error boundaries for component errors
2. React Query error handling for API errors
3. Toast notifications for user-facing errors
4. Sentry for production error tracking

### Testing Strategy
1. Unit tests for utilities and hooks
2. Integration tests for API interactions
3. E2E tests for critical user flows
4. Accessibility audits

## Security Considerations

1. **CSRF Protection**: Session-based auth with httpOnly cookies
2. **XSS Prevention**: React escapes by default, no dangerouslySetInnerHTML
3. **Content Security Policy**: Restrict script sources
4. **HTTPS Only**: Force HTTPS in production
5. **Rate Limiting**: Backend handles rate limiting
6. **Input Validation**: Server-side validation is primary

## Future Enhancements

1. **Offline-First**: IndexedDB for local data storage
2. **Background Sync**: Queue reactions when offline
3. **Push Notifications**: Real-time alerts for new posts
4. **Analytics**: Track user engagement
5. **A/B Testing**: Feature flag system
6. **i18n**: Multi-language support

## Contributing

When adding new features:
1. Follow existing patterns (React Query, component structure)
2. Add TypeScript types
3. Ensure accessibility (ARIA, keyboard nav)
4. Optimize images and performance
5. Add error handling
6. Update this documentation
