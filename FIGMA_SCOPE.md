# Figma Design Scope Instructions for Replay

## Project Context
**Replay** is a Spotify-integrated social music diary PWA that transforms daily listening into shareable moments. This document defines the scope and requirements for Figma design work to ensure consistency with the codebase.

## Design System Foundation

### Tech Stack Constraints
When working with Figma designs for this project, designs must align with:
- **Next.js 16** (App Router architecture)
- **Tailwind CSS v4** (utility-first styling)
- **Radix UI + shadcn/ui** (accessible component primitives)
- **Framer Motion** (animations and transitions)
- **Mobile-first responsive design** (PWA requirements)

### Component Library Reference
All Figma components should map to existing shadcn/ui components in `/components/ui/`:
- Button, Card, Dialog, DropdownMenu, Input, Label, Select, Tabs, Toast, etc.
- Custom components in `/components/shared/`: AlbumArt, ProfilePicture, ReactionRing, InstallPWAPrompt

## In-Scope Figma Design Work

### 1. Core User Flows
**Daily Reveal Experience (9:30pm)**
- Reveal animation screen with confetti
- Song of the day card with album art and stats
- Toast notification design
- Loading states and skeleton screens

**Social Feed (BeReal-style)**
- Post card layout with album art
- Reaction ring overlay (8 emoji options: 🔥 ❤️ 💀 😭 🎯 👀 🤔 😍)
- Profile picture + emoji reaction bubbles
- Comment section UI
- Infinite scroll loading states

**Calendar Archive**
- Monthly grid view with album art thumbnails
- Hover preview states
- Day detail modal with statistics
- Month navigation controls
- Empty states for days without data

**Profile Pages**
- User profile header with Spotify stats
- Top tracks, artists, and genres display
- Friend list and friend request UI
- Settings page layout

### 2. Mobile-First Components
All designs MUST include:
- **Mobile view** (320px - 768px) as primary design
- **Tablet view** (768px - 1024px)
- **Desktop view** (1024px+)
- **Touch targets** minimum 48x48px
- **Bottom navigation** for mobile (Feed, Calendar, Profile)
- **Sidebar navigation** for desktop

### 3. PWA-Specific Elements
- **Install prompt banner** design
- **Push notification** designs (browser native style)
- **Offline state** screens and messaging
- **Loading indicators** for background sync
- **App icon** designs (72px to 512px sizes)
- **Splash screen** design

### 4. Accessibility Requirements
All Figma designs must demonstrate:
- **Contrast ratios**: WCAG 2.1 AA minimum (AAA preferred)
  - Normal text: 4.5:1
  - Large text: 3:1
  - UI components: 3:1
- **Focus states**: Visible keyboard focus indicators
- **Touch targets**: 48x48px minimum for interactive elements
- **Text scaling**: Readable at 200% zoom
- **Color not sole indicator**: Use icons/text alongside color

### 5. Animation Specifications
When designing animated components, provide:
- **Keyframe breakdowns** for complex animations
- **Timing functions**: ease-in, ease-out, spring parameters
- **Duration**: Specify in milliseconds (matches Framer Motion)
- **Reduced motion alternatives**: Static fallbacks required

### 6. Dark Mode
ALL designs MUST include both:
- **Light mode** variant
- **Dark mode** variant
- Smooth transitions between themes
- Consistent color tokens across modes

## Design Token Requirements

### Colors
Use semantic color naming that maps to Tailwind:
- **Primary**: Spotify green (#1DB954)
- **Background**: bg-background (light/dark variants)
- **Foreground**: text-foreground
- **Muted**: bg-muted, text-muted-foreground
- **Accent**: bg-accent, text-accent-foreground
- **Destructive**: bg-destructive (errors)
- **Border**: border-border

### Typography
Follow system font stack:
- **Font Family**: `font-sans` (system default)
- **Sizes**: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
- **Weights**: font-normal (400), font-medium (500), font-semibold (600), font-bold (700)
- **Line Heights**: leading-none, leading-tight, leading-normal, leading-relaxed

### Spacing
Use Tailwind's 4px spacing scale:
- **4px increments**: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px), 16 (64px)
- **Component padding**: Consistent with shadcn/ui defaults

### Border Radius
- **Default**: rounded-lg (8px) for cards
- **Buttons**: rounded-md (6px)
- **Full**: rounded-full for avatars
- **Images**: rounded-md for album art

## Out of Scope

### Do NOT Design
- **Backend admin interfaces** (no backend UI in this frontend project)
- **Non-mobile-optimized layouts** (mobile-first is mandatory)
- **Complex data visualizations** (keep stats simple and readable)
- **Multi-step onboarding flows** (handled programmatically)
- **Email templates** (notifications are push-only)

### Technical Limitations
- **No custom fonts** (system fonts only for performance)
- **No video backgrounds** (performance constraints)
- **No complex SVG animations** (use Framer Motion instead)
- **No auto-playing audio** (browser restrictions)

## Handoff Requirements

### When Delivering Figma Designs
1. **Component naming**: Match React component names exactly
   - Example: `PostCard` in Figma → `<PostCard>` in React

2. **Auto Layout**: Use Figma Auto Layout to match Flexbox/Grid behavior
   - Padding, gap, and alignment should be explicit

3. **Variants**: Create component variants for:
   - States: default, hover, active, disabled, loading
   - Sizes: sm, md, lg
   - Themes: light, dark

4. **Export assets**:
   - Icons as SVG (optimized)
   - Images at 1x, 2x, 3x for different pixel densities
   - Album art placeholders at 300x300px

5. **Annotations**: Include notes for:
   - Interactive behaviors (expand, collapse, swipe)
   - Animations (duration, easing, trigger)
   - Conditional logic (show/hide based on state)

### Design Review Checklist
Before finalizing any Figma design:
- [ ] Mobile, tablet, desktop views included
- [ ] Light and dark mode variants
- [ ] All interactive states (hover, active, focus, disabled)
- [ ] Loading and error states
- [ ] Empty states (no data, no network)
- [ ] Accessibility annotations (ARIA labels, roles)
- [ ] Animation specifications documented
- [ ] Touch target sizes verified (48x48px min)
- [ ] Contrast ratios checked (WCAG AA minimum)
- [ ] Component naming matches codebase

## Design-to-Code Workflow

### Recommended Process
1. **Design in Figma**: Create high-fidelity mockups with variants
2. **Review with developer**: Validate technical feasibility
3. **Export specs**: Use Figma Dev Mode for precise measurements
4. **Implement with shadcn/ui**: Leverage existing components
5. **Refine with Tailwind**: Apply utility classes matching design tokens
6. **Add Framer Motion**: Implement animations per spec
7. **Test accessibility**: Verify keyboard nav, screen readers, contrast

### Tools for Handoff
- **Figma Dev Mode**: For inspecting spacing, typography, colors
- **Figma to Code plugins**: Generate initial Tailwind classes (review before using)
- **Contrast checker plugins**: Verify accessibility in Figma

## Spotify-Specific Design Guidelines

### Album Art
- **Size**: 300x300px minimum (Spotify standard)
- **Aspect ratio**: Always 1:1 (square)
- **Border radius**: rounded-md (6px)
- **Fallback**: Gray placeholder with music icon

### Music Data Display
- **Track name**: Bold, text-base to text-lg
- **Artist name**: Regular, text-sm, muted color
- **Play counts**: Small, muted, with icon
- **Duration**: MM:SS format

### BeReal-Style Reactions
- **Reaction ring**: Circular layout around album art
- **Profile pictures**: 32px diameter, circular
- **Emoji overlay**: 16px, bottom-right of profile pic
- **Max reactions visible**: 8 (expandable)

## Performance Considerations

### Image Optimization
- Use **Next.js Image component** specs in design
- Provide **blur placeholder** data for album art
- Design for **lazy loading** (skeleton screens)

### Bundle Size
- Keep **custom icons** minimal (use Lucide React library)
- Avoid **multiple font weights** (limit to 2-3 weights)

## Reference Materials

### Inspiration Sources
- **BeReal**: Reaction ring UI and daily reveal concept
- **Spotify**: Album art presentation and music stats
- **Apple Music**: Calendar grid and archive views
- **Instagram**: Story/reveal animations

### Design Systems to Reference
- **shadcn/ui**: https://ui.shadcn.com (exact component library)
- **Tailwind UI**: For layout patterns
- **Radix UI**: For accessibility patterns

## Questions to Ask Before Designing

1. **Does this component exist in shadcn/ui?** (Reuse before creating custom)
2. **Is this mobile-first?** (Start with 375px width)
3. **Does it work in dark mode?** (Both themes required)
4. **Can a keyboard user navigate this?** (Focus states visible)
5. **What's the loading state?** (Always design loading/error/empty)
6. **Is the touch target large enough?** (48x48px minimum)
7. **Does it respect reduced motion?** (Provide static alternative)

## Success Metrics for Figma Work

Designs are considered complete when:
- ✅ All viewport sizes included (mobile, tablet, desktop)
- ✅ Light and dark themes designed
- ✅ Interactive states documented
- ✅ Accessibility verified (contrast, focus, touch targets)
- ✅ Component naming matches React components
- ✅ Animation specs provided (if applicable)
- ✅ Developer review completed
- ✅ Handoff includes exported assets and tokens

---

**Last Updated**: 2025-11-18
**Maintained by**: Design & Engineering Team
**Questions?**: Reference ARCHITECTURE.md for technical implementation details
