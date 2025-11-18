# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Vercel account (recommended) or any hosting platform supporting Next.js
- Backend API deployed and accessible
- Environment variables configured

## Environment Variables

Create production environment variables in your hosting platform:

\`\`\`env
# Required
NEXT_PUBLIC_API_URL=https://api.replay.app
NEXT_PUBLIC_WS_URL=wss://api.replay.app
NEXT_PUBLIC_BASE_URL=https://replay.app

# Optional
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_production_vapid_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_VERCEL_ANALYTICS=true
\`\`\`

## Deploy to Vercel (Recommended)

### Option 1: Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to configure project
\`\`\`

### Option 2: GitHub Integration

1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy automatically on push to main branch

### Vercel Configuration

\`\`\`json
// vercel.json (optional)
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@replay-api-url",
    "NEXT_PUBLIC_WS_URL": "@replay-ws-url"
  }
}
\`\`\`

## Deploy to Other Platforms

### Docker Deployment

\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

\`\`\`bash
# Build and run
docker build -t replay-frontend .
docker run -p 3000:3000 replay-frontend
\`\`\`

### Traditional Server (PM2)

\`\`\`bash
# Install dependencies
npm ci --production=false

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "replay-frontend" -- start

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
\`\`\`

## Build Optimizations

### 1. Enable Compression

Add to `next.config.mjs`:

\`\`\`javascript
compress: true,
\`\`\`

### 2. Analyze Bundle Size

\`\`\`bash
# Install analyzer
npm install -D @next/bundle-analyzer

# Build with analysis
ANALYZE=true npm run build
\`\`\`

### 3. Optimize Images

- Use WebP/AVIF formats
- Set appropriate sizes for responsive images
- Use priority loading for above-the-fold images

## Post-Deployment Checklist

### Functionality Tests
- [ ] Authentication flow works
- [ ] Feed loads and displays posts
- [ ] Calendar shows historical data
- [ ] Profile pages load correctly
- [ ] Settings can be updated
- [ ] Notifications work
- [ ] WebSocket connects properly

### Performance Tests
- [ ] Run Lighthouse audit (target 90+ on all metrics)
- [ ] Check Core Web Vitals
- [ ] Test on slow 3G connection
- [ ] Verify image optimization
- [ ] Check bundle size

### PWA Tests
- [ ] Install prompt appears
- [ ] App works offline
- [ ] Service worker caches correctly
- [ ] Push notifications work
- [ ] App icons display properly

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] No accessibility errors in axe DevTools

### Browser Testing
- [ ] Chrome/Edge (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & iOS)
- [ ] Test on different screen sizes

### Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CSP policy set
- [ ] No exposed secrets
- [ ] API endpoints secured

## Monitoring

### Error Tracking (Sentry)

\`\`\`bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
\`\`\`

### Analytics (Vercel Analytics)

Already included if deployed on Vercel. For other platforms:

\`\`\`bash
npm install @vercel/analytics
\`\`\`

### Performance Monitoring

Use Vercel Speed Insights or similar:

\`\`\`bash
npm install @vercel/speed-insights
\`\`\`

## Rollback Strategy

### Vercel
- Use deployment history to rollback
- Or redeploy previous commit

\`\`\`bash
vercel rollback [deployment-url]
\`\`\`

### Docker
- Keep previous image tags
- Redeploy old version

\`\`\`bash
docker pull replay-frontend:previous-version
docker stop replay-frontend
docker run -d --name replay-frontend replay-frontend:previous-version
\`\`\`

## Troubleshooting

### Build Fails

1. Check Node.js version (18+)
2. Clear node_modules and reinstall
3. Check for TypeScript errors
4. Verify environment variables

### Runtime Errors

1. Check browser console
2. Verify API connectivity
3. Check environment variables
4. Review Sentry errors

### Performance Issues

1. Analyze bundle with @next/bundle-analyzer
2. Check image optimization
3. Review React Query cache settings
4. Enable production build optimizations

### PWA Not Working

1. Verify service worker registration
2. Check manifest.json is accessible
3. Ensure HTTPS is enabled
4. Clear browser cache and reload

## Scaling Considerations

### CDN Configuration
- Use Vercel Edge Network (automatic)
- Or configure CloudFlare CDN
- Cache static assets aggressively

### Database Connection
- Use connection pooling
- Implement rate limiting
- Cache frequently accessed data

### Load Balancing
- Horizontal scaling with multiple instances
- Use load balancer (nginx, AWS ALB)
- Implement health checks

## Maintenance

### Regular Updates

\`\`\`bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
\`\`\`

### Monitoring Alerts

Set up alerts for:
- Error rate spikes
- High response times
- Failed deployments
- Certificate expiration
- Disk space usage

## Support

For deployment issues:
- Check GitHub Issues
- Review Next.js documentation
- Contact platform support (Vercel, etc.)
\`\`\`
