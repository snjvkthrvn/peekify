# V0 Follow-Up Prompt: Complete Replay Frontend Implementation

## Context
✅ **Already Completed:**
- Design system tokens in `globals.css` (colors, typography, spacing, shadows, animations)
- Landing page with hero section, album mosaic, and feature cards

## Mission
Implement ALL remaining pages and components for the Replay app following the established Spotify × BeReal design system. Build production-ready, fully functional React components with TypeScript, Tailwind CSS v4, and shadcn/ui.

---

# IMPLEMENTATION CHECKLIST

## Phase 1: Core Shared Components (Build These First)

### 1.1 Album Art Component (`components/shared/album-art.tsx`)
```typescript
// Reusable album art with size variants and gradient extraction
interface AlbumArtProps {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  priority?: boolean
  onClick?: () => void
  showPlayOverlay?: boolean
}

Specifications:
- Size variants: sm (48px), md (120px), lg (200px), xl (400px), hero (100% width, aspect-square)
- Border-radius: radius-lg (20px)
- Shadow: shadow-medium, increases to shadow-glow on hover
- Loading state: Skeleton gradient animation
- Error state: Music note icon placeholder
- Hover: Scale 1.02, show play icon overlay with rgba(0,0,0,0.2)
- Click: Spring animation (scale 0.98 → 1.02 → 1)
- Use Next.js Image component with optimization
- Extract vibrant color for optional gradient prop
```

### 1.2 Profile Picture Component (`components/shared/profile-picture.tsx`)
```typescript
interface ProfilePictureProps {
  src?: string
  username: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showOnlineIndicator?: boolean
  onClick?: () => void
}

Specifications:
- Sizes: xs (24px), sm (32px), md (44px), lg (80px), xl (160px)
- Border-radius: full (perfect circle)
- Border: 2px solid bg-deep
- Fallback: Linear gradient bg with username initial (first letter, Display size, 900 weight)
- Online indicator: Green dot (25% of avatar size) bottom-right with pulse animation
- Loading: Circular skeleton pulse
- Hover: shadow-medium (on clickable variants)
```

### 1.3 Reaction Ring Component (`components/shared/reaction-ring.tsx`)
```typescript
interface ReactionRingProps {
  reactions: Array<{
    userId: string
    username: string
    profilePic: string
    emoji: string
  }>
  maxVisible?: number // default 12
  onViewAll?: () => void
}

Specifications:
- Circular positioning around parent (45% radius from center)
- Reaction bubbles: 36x36px with 3px solid bg-deep border
- Emoji overlay: 18x18px bottom-right of profile pic
- Max visible: 12, then show "+N more" pill
- Even distribution: 30deg intervals around circle
- Animation: Pop-in with spring (scale 0 → 1.1 → 1), stagger 80ms
- Shadow: shadow-medium on each bubble
- "+N More" pill: 36px height, auto width, bg-elevated, rounded-full
```

### 1.4 Reaction Picker Popover (`components/shared/reaction-picker.tsx`)
```typescript
interface ReactionPickerProps {
  onSelect: (emoji: string) => void
  currentReaction?: string
  trigger: React.ReactNode
}

Specifications:
- Emojis: 🔥 ❤️ 💀 😭 🎯 👀 🤔 😍 (8 total)
- Grid: 4 columns × 2 rows, gap 8px
- Each button: 48x48px, radius-md, emoji 28px font-size
- Hover: bg-highlight, scale 1.1
- Active (already reacted): bg-highlight with accent-green border (2px)
- Tap: Spring animation (scale 0.9 → 1.15 → 1)
- Popover: bg-elevated with glassmorphism, radius-lg, padding 12px
- Animation: Scale from 0.9 + fade-in (200ms ease-out)
- Position: Above trigger, centered
```

### 1.5 Button System (`components/ui/button.tsx`)
```typescript
// Update existing button component with new variants

Variants:
1. Primary (CTA):
   - Background: accent-gradient (linear-gradient(135deg, #1DB954 0%, #1ED760 100%))
   - Height: 48px (default), 56px (lg)
   - Padding: 0 32px
   - Border-radius: full
   - Shadow: shadow-subtle, hover → shadow-glow
   - Hover: Scale 1.03, animate gradient
   - Active: Scale 0.97

2. Secondary (Outline):
   - Border: 2px solid text-secondary
   - Color: text-secondary
   - Hover: border/color → text-primary, bg-highlight

3. Ghost:
   - Background: transparent
   - Hover: bg-highlight, color text-primary

4. Destructive:
   - Background: #EF4444 (red)
   - Same as primary otherwise

5. Icon:
   - Size: 40x40px square
   - Background: transparent
   - Hover: bg-highlight, scale 1.05

Loading state: Spinning circle (16px), opacity 0.7
```

---

## Phase 2: Navigation Components

### 2.1 Bottom Navigation (`components/layout/bottom-nav.tsx`)
```typescript
// Mobile only (<768px)

Specifications:
- Position: fixed bottom-0, width 100%
- Height: 72px (includes safe-area padding)
- Background: bg-surface with glassmorphism (backdrop-filter: blur(20px) saturate(180%))
- Border-top: 1px solid rgba(255,255,255,0.05)
- Shadow: shadow-large (upward)
- Safe-area-inset: padding-bottom for notched devices
- Z-index: 100

Tab Items (3 total):
1. Feed - Home icon
2. Calendar - Calendar icon
3. Profile - Profile picture (32x32px, rounded-full)

Tab Styling:
- Layout: Flex column, align-center, gap 4px
- Icon: 24x24px, text-tertiary (inactive), accent-green (active)
- Label: Caption size, only visible on active tab (fade-in 200ms)
- Touch target: 48x48px minimum
- Active: accent-green fill, subtle glow bg-highlight with radius-full
- Animation: Spring scale on tap (0.95 → 1.05 → 1)

Hide on: md breakpoint and above
```

### 2.2 Sidebar Navigation (`components/layout/sidebar-nav.tsx`)
```typescript
// Desktop only (≥768px)

Specifications:
- Position: fixed left-0, height 100vh
- Width: 240px
- Background: bg-surface
- Border-right: 1px solid rgba(255,255,255,0.05)
- Padding: 24px 16px

Logo Section:
- "Replay" text (Display size, 900 weight)
- Music note with circular arrows icon (32x32px, accent-green)
- Margin-bottom: 32px

Nav Items (vertical stack, gap 8px):
- Feed, Calendar, Profile, Settings
- Each: padding 12px 16px, radius-md
- Icon (24x24px) + Label (Body, 600 weight)
- Inactive: text-secondary
- Hover: bg-highlight
- Active:
  - Background: rgba(29, 185, 84, 0.2)
  - Text: accent-green
  - Border-left: 3px solid accent-green
- Transition: all 200ms ease

Logout Button (bottom):
- Position: absolute bottom-24px
- Destructive outline style
- Full width (minus padding)
- Icon: LogOut (16px)

Hide on: Below md breakpoint
```

---

## Phase 3: Feed Page Components

### 3.1 Feed Post Card (`components/feed/post-card.tsx`)
```typescript
interface PostCardProps {
  post: {
    id: string
    user: { username: string; profilePic: string }
    song: { name: string; artist: string; albumArt: string; duration: string }
    playCount: number
    timestamp: string
    reactions: Array<{ userId: string; username: string; profilePic: string; emoji: string }>
    commentCount: number
  }
  onReact: (emoji: string) => void
  onComment: () => void
  onQueue: () => void
  onShare: () => void
}

Specifications:
Container:
- Width: 100% (max 640px centered on desktop)
- Margin: 16px vertical spacing
- Background: bg-elevated
- Border-radius: radius-xl (28px)
- Shadow: shadow-medium, hover → shadow-large with translateY(-4px)
- Padding: 0 (full bleed album art)

Post Header:
- Padding: 16px
- Background: bg-surface
- Layout: Flex row
  - Profile pic (44x44px) + Username (Body Large, 600 weight) + Timestamp (Caption, text-tertiary)
  - Three-dot menu (right)

Album Art Section:
- Aspect-ratio: 1:1 square
- Width: 100%
- Position: relative
- Image: AlbumArt component (hero size)
- Overlay on hover: rgba(0,0,0,0.3) with "View Details"
- ReactionRing component overlaid (bottom-right)

Song Metadata Bar:
- Padding: 16px
- Background: Linear gradient from album-vibrant (20% opacity) → transparent
- Song name: Body Large (600 weight)
- Artist: Body (text-secondary)
- Stats row: Caption (text-tertiary) - play icon + count, dot separator, clock + duration, dot separator, calendar + date

Action Bar:
- Padding: 12px 16px
- Background: bg-surface
- Border-top: 1px solid rgba(255,255,255,0.05)
- Buttons: React (heart icon), Comment (chat + count), Queue (plus icon), Share (arrow)
- Style: Ghost buttons, 40px height, radius-full
- Active react: Filled heart, accent-green
- Hover: bg-highlight
```

### 3.2 Feed Page (`app/(app)/feed/page.tsx`)
```typescript
Specifications:
Header (sticky):
- Height: 64px, fixed top-0
- Background: bg-surface with backdrop-blur(20px)
- Border-bottom: 1px solid rgba(255,255,255,0.05)
- Content: "Replay" logo (left), Notification bell + Profile pic (right)
- Shadow: shadow-subtle on scroll

Feed Container:
- Max-width: 640px, centered
- Padding: 16px
- Infinite scroll with IntersectionObserver
- Trigger: 400px from bottom

Empty State:
- Music note with question mark icon (96x96px, text-tertiary)
- "No posts yet" (Display size, text-secondary)
- "Add friends to see their music" (Body, text-tertiary)
- "Invite Friends" button (accent-gradient, radius-full)

Loading:
- 3 PostCard skeletons on initial load
- Spinning Spotify logo (48px) + "Loading..." for pagination
- Fade-in animation (300ms ease-out) for new posts
```

---

## Phase 4: Daily Reveal Modal

### 4.1 Reveal Screen Component (`components/feed/reveal-screen.tsx`)
```typescript
interface RevealScreenProps {
  song: {
    name: string
    artist: string
    albumArt: string
    playCount: number
    listeningTime: string
    rank: number
  }
  onShare: () => void
  onQueue: () => void
  onClose: () => void
}

Specifications:
Modal Overlay:
- Position: fixed, full viewport
- Background: rgba(0,0,0,0.95)
- Backdrop-filter: blur(40px)
- Z-index: 9999
- Animation: Fade-in 600ms ease-out

Reveal Sequence (timed):
Step 1 (0-2s): Countdown
- "3... 2... 1..." (Hero size, 900 weight)
- Color: reveal-yellow (#FFEB3B)
- Scale pulse: 0.8 → 1.2 → 0.8 (loop)

Step 2 (2-4s): Album Art Reveal
- AlbumArt component (xl size: 400px mobile, 600px desktop)
- Scale: 0 → 1.2 → 1 (spring bounce)
- Rotate: -10deg → 10deg → 0 (wiggle)
- Shadow: shadow-glow with album-vibrant
- Confetti: 100 particles, album-vibrant colors, 5s duration

Step 3 (4-5s): Content Slide-In
- Slide up: translateY(100px) → 0
- Opacity: 0 → 1
- Easing: ease-out

Content Layout:
- Song name: Display size, 800 weight, text-center
- Artist: Body Large, text-secondary, text-center
- Stats Row (3 cards):
  - bg-elevated, padding 16px, radius-md
  - Value (Display size) + Label (Caption)
  - Cards: Play count, Listening time, Rank (#2 TOP SONG)

Action Buttons:
- "Share to Feed" (accent-gradient, full width, 56px)
- "Add to Queue" (outline)
- "Close" (ghost, text-tertiary)

Close Behavior:
- Tap outside → dismiss
- Swipe down gesture → slide-out animation
- X button (top-right) → immediate dismiss
```

---

## Phase 5: Calendar Page

### 5.1 Calendar Grid Component (`components/calendar/calendar-grid.tsx`)
```typescript
interface CalendarGridProps {
  month: number // 0-11
  year: number
  songsByDate: Record<string, { albumArt: string; songName: string; artist: string }>
  onDayClick: (date: string) => void
  onMonthChange: (month: number, year: number) => void
}

Specifications:
Header:
- Background: bg-surface, padding 24px
- Border-bottom: 1px solid rgba(255,255,255,0.05)

Month Navigation:
- Flex row, space-between
- Previous/Next buttons (ChevronLeft/Right icons, ghost)
- Center: Month/Year (Display size, e.g., "November 2024")
- Next disabled if future month
- Current month: accent-green dot indicator below

Stats Cards (4 cards, equal width):
- bg-elevated, padding 16px, radius-md
- Icon (24px, accent-green) + Value (Display size) + Label (Caption)
- Cards: Days tracked, Total plays, Hours listened, Unique artists

Calendar Grid:
- 7 columns (S M T W T F S)
- Gap: 8px
- Padding: 24px

Day Header:
- Caption size, text-tertiary, text-center
- Padding: 8px

Day Cell (with song):
- Aspect-ratio: 1:1
- Background: Album art (100% cover)
- Overlay: Linear gradient transparent → rgba(0,0,0,0.7)
- Day number: Body Small (600 weight), bottom-left
- Border: 2px solid transparent
- Hover: Border → accent-green, scale 1.05
- Today: Border → reveal-yellow, shadow-glow

Day Cell (empty):
- Background: bg-elevated
- Day number: text-tertiary, centered
- Border: 1px dashed rgba(255,255,255,0.1)

Day Cell (future):
- Background: bg-surface
- Opacity: 0.3
- Cursor: not-allowed
```

### 5.2 Day Detail Modal (`components/calendar/day-detail-modal.tsx`)
```typescript
interface DayDetailModalProps {
  date: string
  song: {
    name: string
    artist: string
    albumArt: string
    playCount: number
    firstPlayTime: string
    lastPlayTime: string
    listeningDuration: string
  }
  onClose: () => void
  onPlayOnSpotify: () => void
  onShare: () => void
}

Specifications:
Modal:
- Bottom sheet on mobile (slide up from bottom)
- Centered on desktop (max-width 600px)
- Background: bg-elevated with glassmorphism
- Border-radius: radius-xl (top corners only on mobile)
- Padding: 24px
- Max-height: 80vh, overflow auto

Content:
- AlbumArt (lg size: 200x200px, radius-lg, shadow-medium)
- Song name: Display size, 800 weight
- Artist: Body Large, text-secondary
- Date: Caption, text-tertiary

Stats Grid (2 columns):
- bg-surface, padding 12px, radius-md, gap 12px
- Stats: Total plays, First play time, Last play time, Listening duration

Action Buttons:
- "Play on Spotify" (accent-gradient, external link icon)
- "Share Day" (outline)
- "Close" (ghost)
```

### 5.3 Calendar Page (`app/(app)/calendar/page.tsx`)
```typescript
Specifications:
- Fetch user's listening history by date range
- CalendarGrid component with current month
- State: selected month/year
- Modal state for DayDetailModal
- Stats calculation from all tracked days
- Loading state: Skeleton grid (7×6 cells)
- Empty state: "Start listening to see your calendar" + Spotify link
```

---

## Phase 6: Profile Page

### 6.1 Profile Header Component (`components/profile/profile-header.tsx`)
```typescript
interface ProfileHeaderProps {
  user: {
    username: string
    bio?: string
    profilePic: string
    isPrivate: boolean
    isOwn: boolean
    isFriend: boolean
  }
  topSongs: Array<{ albumArt: string }> // for gradient
  onEditProfile?: () => void
  onAddFriend?: () => void
  onRemoveFriend?: () => void
  onShare: () => void
}

Specifications:
Hero Section:
- Height: 400px (mobile), 500px (desktop)
- Background: 3-color gradient from top 3 album arts (animated slow pan)
- Overlay: Linear gradient transparent → bg-deep
- Content: bottom-left, padding 24px

Profile Picture:
- Size: 120px (mobile), 160px (desktop)
- Border: 4px solid bg-deep
- Shadow: shadow-large
- Position: translateY(50%) (overlaps content below)

Username:
- Display size, 900 weight
- Margin-top: 16px

Bio:
- Body size, text-secondary
- Max-width: 400px
- Margin-top: 8px

Action Buttons (flex row, gap 12px):
- Own profile: "Edit Profile" (outline)
- Friend: "Remove Friend" (destructive outline)
- Not friend: "Add Friend" (accent-gradient)
- Always: "Share Profile" (ghost, share icon)
```

### 6.2 Stats Section Component (`components/profile/stats-section.tsx`)
```typescript
interface StatsSectionProps {
  timeRange: '4weeks' | '6months' | 'alltime'
  stats: {
    topTracks: Array<{ albumArt: string; name: string; artist: string; playCount: number }>
    topArtists: Array<{ image: string; name: string; playCount: number }>
    topGenres: Array<{ name: string; percentage: number; color: string }>
  }
  onTimeRangeChange: (range: string) => void
}

Specifications:
Container:
- Background: bg-surface
- Padding: 24px
- Border-top: 1px solid rgba(255,255,255,0.05)

Header:
- "Your Music Stats" (Display size, 800 weight)
- Time Range Tabs: "4 weeks", "6 months", "All time"
- Active tab: accent-green underline (3px thick), font-weight 700

Top Tracks Row:
- Horizontal scroll, gap 16px
- Each card: width 160px, bg-elevated, padding 12px, radius-md
- AlbumArt (136x136px, radius-sm)
- Song name: Body Small, 600 weight, truncate
- Artist: Caption, text-secondary, truncate
- Plays: Caption, text-tertiary

Top Artists Row:
- Same as tracks
- Circular artist images (136x136px, rounded-full)

Top Genres Row:
- Pill badges: bg-elevated, padding 8px 16px, radius-full
- Genre name + percentage (e.g., "Indie Rock • 34%")
- Background: Gradient from genre color
```

### 6.3 Recent Songs Grid (`components/profile/recent-songs.tsx`)
```typescript
interface RecentSongsProps {
  songs: Array<{
    id: string
    albumArt: string
    songName: string
    artist: string
    date: string
  }>
  onSongClick: (id: string) => void
}

Specifications:
Grid:
- Columns: 3 (mobile), 6 (desktop)
- Gap: 12px
- Padding: 24px

Song Cell:
- Aspect-ratio: 1:1
- AlbumArt component (100% cover)
- Border-radius: radius-md
- Overlay on hover:
  - rgba(0,0,0,0.5)
  - Play icon (48x48px, center)
  - Scale 1.05
- Date badge (top-right):
  - bg-deep with 80% opacity
  - Caption size, padding 4px 8px, radius-full
```

### 6.4 Private Profile State (`components/profile/private-profile.tsx`)
```typescript
Specifications:
- Lock icon: 96x96px, text-tertiary
- Heading: "This profile is private" (Display size)
- Body: "Add [username] as a friend to see their music" (Body, text-secondary)
- CTA: "Send Friend Request" (accent-gradient)
- Center vertically in viewport
```

### 6.5 Profile Page (`app/(app)/profile/[username]/page.tsx`)
```typescript
Specifications:
- Dynamic route with username param
- Fetch user data, stats, recent songs
- Conditional rendering:
  - Own profile: Show stats section, edit button
  - Friend: Show stats and songs
  - Private + not friend: Show PrivateProfile component
- Loading state: Skeleton for header + stats
- Error state: User not found page
```

---

## Phase 7: Settings Page

### 7.1 Settings Page (`app/(app)/settings/page.tsx`)
```typescript
Specifications:
Layout:
- Max-width: 600px, centered
- Padding: 24px

Header:
- "Settings" (Display size, 800 weight)
- Subtitle: "Manage your Replay experience" (Body, text-secondary)

Section: Account
Form fields (vertical stack, gap 16px):
- Username input:
  - Label: Body Small, 600 weight
  - Input: bg-elevated, 48px height, radius-md, padding 12px 16px
  - Border: 1px solid rgba(255,255,255,0.1)
  - Focus: Border → accent-green (2px)
  - onChange handler

- Bio textarea:
  - Same styling, height 120px
  - Character count: Caption, text-tertiary (150/150)

- Privacy toggle:
  - Label: "Private Profile" + description
  - Switch component (accent-green when active)

- Save button:
  - accent-gradient, full width, 48px height
  - Disabled when no changes (opacity 0.5)
  - Loading state when saving

Section: Notifications
Toggle list (flex row, space-between each):
- Daily Reveals toggle
- Friend Requests toggle
- New Reactions toggle
- Weekly Recaps toggle

Reveal Time Picker:
- Time selector input (default 9:30 PM)
- bg-elevated, radius-md

Section: Danger Zone
- Background: rgba(239, 68, 68, 0.1)
- Border: 1px solid rgba(239, 68, 68, 0.3)
- Radius: radius-md, padding 24px
- Heading: "Danger Zone" (Body Large, 700 weight, #EF4444)
- "Delete Account" button (destructive)
- Confirmation modal on click
```

### 7.2 Delete Confirmation Modal
```typescript
Specifications:
- Title: "Are you absolutely sure?" (Display size, text-center)
- Body: Warning text about data deletion
- Buttons:
  - "Cancel" (outline, full width)
  - "Yes, delete my account" (destructive, full width)
- Animation: Scale-in (300ms ease-out)
```

---

## Phase 8: Toast Notifications

### 8.1 Toast Component (Update existing)
```typescript
Specifications:
Container:
- Position: fixed, bottom 24px (mobile: 88px to clear nav), right 24px
- Max-width: 400px
- Z-index: 9999

Toast Card:
- Background: bg-elevated with glassmorphism
- Border: 1px solid rgba(255,255,255,0.1)
- Border-radius: radius-lg
- Padding: 16px
- Shadow: shadow-large
- Min-height: 64px

Layout:
- Flex row, gap 12px
- Icon (24px): Success (checkmark, accent-green), Error (X, #EF4444), Info (i, text-secondary)
- Content: Title (Body, 600 weight) + Description (Body Small, text-secondary)
- Close button: X icon (16px, ghost)

Animation:
- Enter: Slide-in from right + fade-in (300ms ease-out)
- Exit: Slide-out to right + fade-out (200ms ease-in)
- Progress bar: 3px height, accent-green, width 100% → 0% over 5s

Stacking:
- Multiple toasts: Vertical stack, 8px gap
- Max visible: 3
```

---

## Phase 9: Auth Pages

### 9.1 Login Page (`app/auth/login/page.tsx`)
```typescript
Specifications:
Layout:
- Full viewport height
- Background: bg-deep

Content (centered):
- Logo: "Replay" (Hero size, 900 weight)
- Tagline: "BeReal for music" (Body Large, text-secondary)
- "Continue with Spotify" button:
  - accent-gradient, 56px height, 300px width
  - Spotify icon (white, left-aligned)
  - Hover: scale 1.05, shadow-glow
  - Click: Redirect to /auth/login API

Privacy Info:
- Small text (Caption): "By continuing, you agree to our Terms and Privacy Policy"
- Links: text-secondary, underline on hover

Footer:
- Bottom 24px: Privacy, Terms, Support links
```

### 9.2 Callback Page (`app/auth/callback/page.tsx`)
```typescript
Specifications:
- Loading state: Spinning Spotify logo (96px) + "Connecting to Spotify..."
- Success: Redirect to /feed
- Error: Show error message + "Try Again" button
- Minimum display time: 1.5s (for smooth UX)
```

---

## Phase 10: Error & Static Pages

### 10.1 404 Page (`app/not-found.tsx`)
```typescript
Specifications:
- Center content
- Icon: Broken record (96px, text-tertiary)
- "404: Page not found" (Display size)
- "This page doesn't exist" (Body, text-secondary)
- "Go Home" button (accent-gradient)
```

### 10.2 Offline Page (`app/offline/page.tsx`)
```typescript
Specifications:
- Wifi-off icon (96px, text-tertiary)
- "You're offline" (Display size)
- "Reconnect to see your music" (Body, text-secondary)
- "Retry" button (accent-gradient)
- Show last cached feed if available with "Offline" badge
```

---

## Implementation Guidelines

### Code Quality Requirements:
1. **TypeScript**: Use strict types, no `any`
2. **Accessibility**: ARIA labels on all interactive elements, semantic HTML
3. **Responsive**: Mobile-first, test all breakpoints
4. **Performance**: Lazy load images, code split heavy components
5. **Error Handling**: Try-catch blocks, error boundaries, fallback UI
6. **Loading States**: Skeleton screens for initial loads, spinners for actions
7. **Animations**: Framer Motion for complex, CSS for simple (respect prefers-reduced-motion)
8. **Consistency**: Use design tokens from globals.css, never hardcode colors

### Component Patterns:
- Use shadcn/ui primitives (Dialog, Popover, Select, Switch, etc.)
- Lucide React for all icons
- Next.js Image for all images
- React Query for data fetching (if applicable)
- Form validation with react-hook-form + zod

### File Structure:
```
components/
├── ui/             # shadcn primitives (existing)
├── layout/         # Navigation components
├── feed/           # Feed-specific components
├── calendar/       # Calendar-specific components
├── profile/        # Profile-specific components
├── shared/         # Reusable across pages
└── settings/       # Settings components

app/
├── (app)/          # Authenticated routes
│   ├── feed/
│   ├── calendar/
│   ├── profile/[username]/
│   └── settings/
├── auth/
│   ├── login/
│   └── callback/
└── page.tsx        # Landing (already done)
```

### Testing Checklist:
- [ ] All pages render without errors
- [ ] Mobile navigation works (bottom nav visible <768px)
- [ ] Desktop navigation works (sidebar visible ≥768px)
- [ ] All hover states work on desktop
- [ ] All tap states work on mobile
- [ ] Animations play smoothly (60fps)
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Empty states display correctly
- [ ] Forms validate properly
- [ ] Modals close properly (outside click, X button, escape key)
- [ ] Keyboard navigation works (tab, arrow keys, enter/space, escape)
- [ ] Screen reader announces content correctly
- [ ] Dark mode looks good (default)
- [ ] Colors meet WCAG AA contrast requirements

---

## Priority Order

Build in this order for optimal development flow:

1. ✅ Design tokens (done)
2. ✅ Landing page (done)
3. **Phase 1**: Core shared components (Album Art, Profile Pic, Buttons, Reaction Ring, Reaction Picker)
4. **Phase 2**: Navigation (Bottom Nav, Sidebar)
5. **Phase 3**: Feed page + Post Card
6. **Phase 4**: Daily Reveal Modal
7. **Phase 5**: Calendar page + components
8. **Phase 6**: Profile page + components
9. **Phase 7**: Settings page
10. **Phase 8**: Toast notifications
11. **Phase 9**: Auth pages
12. **Phase 10**: Error/static pages

---

## Success Criteria

The implementation is complete when:
- ✅ All 10 phases are implemented
- ✅ All components match the design specifications exactly
- ✅ Responsive design works on mobile (375px), tablet (768px), desktop (1440px)
- ✅ All interactions are smooth and delightful
- ✅ Accessibility is WCAG AA compliant
- ✅ No console errors or warnings
- ✅ Components are reusable and well-typed
- ✅ Code follows React/Next.js best practices

---

## Final Notes

This is a **production-ready** implementation. Every component should:
- Feel like Spotify and BeReal had a baby
- Make music the hero (album art is always largest, most prominent)
- Be minimal and clean (no unnecessary chrome)
- Have delightful interactions (spring animations, smooth transitions)
- Work perfectly on mobile (touch-optimized, safe areas respected)
- Be accessible to everyone (keyboard nav, screen readers, high contrast)

**The UI should feel alive, responsive, and music-obsessed.**

Let's build something beautiful! 🎵✨
