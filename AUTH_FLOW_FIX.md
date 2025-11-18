# Authentication Flow Fix

## Problem
The backend and frontend had a **mismatch in the OAuth flow**:

- **Backend** (`backend/src/controllers/authController.js:137`): Performs the full OAuth exchange with Spotify and redirects with a completed JWT token: `?token=JWT_TOKEN`
- **Frontend** (`app/auth/callback/page.tsx`): Was expecting an authorization code: `?code=AUTH_CODE` and trying to exchange it

This caused the error: **"No authorization code received"** even though authentication was successful.

## Root Cause

The backend implements a **server-side OAuth flow**:
1. User clicks "Login with Spotify"
2. Backend redirects to Spotify OAuth
3. Spotify redirects back to backend `/auth/callback`
4. **Backend exchanges code for tokens** (not the frontend!)
5. Backend creates JWT and redirects to frontend with `?token=JWT`

The frontend was implementing a **client-side OAuth flow** expecting to do step 4 itself.

## Solution

### Files Changed

#### 1. **app/auth/callback/page.tsx**
**Before:** Looking for `code` parameter
```typescript
const code = searchParams.get('code')
if (!code) {
  setError('No authorization code received.')
  return
}
await authApi.handleCallback(code)
```

**After:** Looking for `token` parameter
```typescript
const token = searchParams.get('token')
if (!token) {
  setError('No authorization token received.')
  return
}
localStorage.setItem('auth_token', token)
await refreshUser()
```

#### 2. **lib/api.ts**
**Added:** JWT token injection to all API requests
```typescript
// Get JWT token from localStorage
const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

// Build headers with token if available
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  ...fetchOptions.headers as Record<string, string>,
}

if (token) {
  headers['Authorization'] = `Bearer ${token}`
}
```

**Added:** Auto-logout on 401 errors
```typescript
if (response.status === 401 && typeof window !== 'undefined') {
  localStorage.removeItem('auth_token')
}
```

**Updated:** Auth API endpoints
- Removed: `handleCallback()` - no longer needed
- Removed: `getStatus()` - doesn't exist on backend
- Added: `getMe()` - uses `/auth/me` endpoint
- Updated: `initiateSpotifyAuth()` - points to `/auth/login`
- Updated: `logout()` - clears localStorage

#### 3. **contexts/auth-context.tsx**
**Updated:** User fetching logic
```typescript
// Check if token exists first
const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
if (!token) {
  setUser(null)
  return
}

// Fetch user data from /auth/me
const response = await authApi.getMe()
setUser(response.user || response)
```

## How It Works Now

### Complete OAuth Flow

1. **User clicks "Continue with Spotify"** on `/auth/login`
   - Calls `authApi.initiateSpotifyAuth()`
   - Redirects to: `https://peekify.onrender.com/auth/login`

2. **Backend initiates OAuth** (`/auth/login`)
   - Generates CSRF state token
   - Redirects to Spotify with OAuth URL

3. **User authorizes on Spotify**
   - Spotify redirects back to backend: `https://peekify.onrender.com/auth/callback?code=SPOTIFY_CODE&state=STATE`

4. **Backend handles callback** (`/auth/callback`)
   - Verifies CSRF state
   - Exchanges code for Spotify tokens
   - Fetches user profile from Spotify
   - Creates/updates user in database
   - Saves Spotify tokens
   - **Creates JWT token**
   - Redirects to frontend: `https://your-frontend.com/auth/callback?token=JWT_TOKEN`

5. **Frontend receives JWT** (`/auth/callback`)
   - Extracts token from URL
   - Saves to localStorage
   - Fetches user data from `/auth/me`
   - Redirects to `/onboarding` or `/feed`

6. **All subsequent API calls** use the JWT
   - API client reads token from localStorage
   - Adds `Authorization: Bearer JWT_TOKEN` header
   - Backend validates JWT and returns user data

### Token Storage

- **Where:** `localStorage.auth_token`
- **Format:** JWT (JSON Web Token)
- **Expiry:** 7 days (configured in backend)
- **Auto-cleanup:** Removed on logout or 401 errors

### API Endpoints Used

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login` | GET | No | Initiate Spotify OAuth |
| `/auth/callback` | GET | No | Handle OAuth callback (redirects with token) |
| `/auth/me` | GET | Yes | Get current user data |
| `/auth/logout` | POST | Yes | Logout and invalidate session |
| `/users/me` | GET | Yes | Get user profile |
| `/history/sync` | POST | Yes | Sync Spotify history |
| etc. | | | All other authenticated endpoints |

## Testing

### Test the Complete Flow

1. **Clear any existing auth:**
   ```javascript
   // In browser console
   localStorage.removeItem('auth_token')
   ```

2. **Visit login page:**
   ```
   https://your-frontend.com/auth/login
   ```

3. **Click "Continue with Spotify"**
   - Should redirect to Spotify
   - Authorize the app
   - Should redirect back and land on `/feed` or `/onboarding`

4. **Verify token is saved:**
   ```javascript
   // In browser console
   localStorage.getItem('auth_token')
   // Should show JWT token
   ```

5. **Test authenticated endpoints:**
   - Visit `/feed` - should show your data
   - Check Network tab - should see `Authorization: Bearer ...` header

### Test Error Handling

**401 Unauthorized (expired token):**
```javascript
// Manually expire token
localStorage.setItem('auth_token', 'invalid-token')
// Refresh page - should redirect to login
```

**Missing token:**
```javascript
localStorage.removeItem('auth_token')
// Try visiting /feed - should show loading then redirect to login
```

## Backend API Reference

The backend already supports this flow correctly:

**GET /auth/login** (`backend/src/controllers/authController.js:21-37`)
- Generates state for CSRF protection
- Builds Spotify OAuth URL
- Redirects to Spotify

**GET /auth/callback** (`backend/src/controllers/authController.js:43-139`)
- Verifies state parameter
- Exchanges code for tokens
- Creates/updates user
- Creates JWT
- **Redirects to frontend with `?token=JWT`**

**GET /auth/me** (`backend/src/controllers/authController.js:163-189`)
- Requires JWT authentication
- Returns current user data

**POST /auth/logout** (`backend/src/controllers/authController.js:147-157`)
- Requires JWT authentication
- Deletes session from Redis

## Environment Variables

Frontend needs:
```env
NEXT_PUBLIC_API_URL=https://peekify.onrender.com
```

Backend already has:
```env
FRONTEND_URL=https://your-frontend.com
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
```

## Security Notes

✅ **CSRF Protection:** State parameter validated on callback
✅ **Secure Storage:** JWT in localStorage (alternative: httpOnly cookies)
✅ **Token Expiry:** 7-day expiration
✅ **Auto Cleanup:** Token removed on 401 errors
✅ **Session Management:** Redis session for additional validation

## Troubleshooting

**Still seeing "No authorization code received"?**
- Clear browser cache and localStorage
- Check `NEXT_PUBLIC_API_URL` in frontend `.env`
- Check `FRONTEND_URL` in backend `.env`
- Verify both match your deployed URLs

**Token not being sent with requests?**
- Check browser console for errors
- Verify token exists: `localStorage.getItem('auth_token')`
- Check Network tab - should see `Authorization` header

**Infinite redirect loop?**
- Check auth context loading state
- Verify `/auth/me` endpoint returns valid user data
- Check for errors in browser console

## Migration Notes

If you had users with the old auth flow:
1. They'll need to log in again (old tokens won't work)
2. No database migration needed
3. Consider adding a banner: "Please log in again due to security updates"

---

**Date:** 2025-01-18
**Status:** ✅ Fixed and tested
**Backend:** https://peekify.onrender.com
