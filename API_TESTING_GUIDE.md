# Peekify API Testing Guide

## Quick Start

### Option 1: Postman (Desktop/Web)

1. **Download Postman**: https://www.postman.com/downloads/
2. **Import the collection**:
   - Open Postman
   - Click "Import" (top left)
   - Drag `Peekify_API_Collection.postman_collection.json` into the window
   - Click "Import"

3. **Set up your environment**:
   - The collection uses two variables:
     - `base_url`: Already set to `https://peekify.onrender.com`
     - `auth_token`: Empty by default (you'll fill this after logging in)

4. **Test it**:
   - Expand "Health Checks" folder
   - Click "Basic Health Check"
   - Click "Send" button
   - You should see a success response!

### Option 2: Thunder Client (VS Code Extension)

1. **Install Thunder Client**:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Thunder Client"
   - Click Install

2. **Import the collection**:
   - Click Thunder Client icon in sidebar
   - Click "Collections" tab
   - Click menu (⋮) → "Import"
   - Select `Peekify_API_Collection.postman_collection.json`

3. **Set environment variable**:
   - Click "Env" tab
   - Create new environment
   - Add variable: `auth_token` (leave empty for now)
   - The `base_url` is already configured in the collection

## Getting Your Auth Token

### Step 1: Login with Spotify

**In Postman/Thunder Client:**
1. Open `Authentication` → `Login with Spotify`
2. Copy the request URL
3. **Paste it in your browser** (not in Postman!)
4. Log in with your Spotify account
5. After successful login, you'll see a JSON response with a `token` field

**Alternative (Browser):**
Just visit: https://peekify.onrender.com/auth/login

### Step 2: Save the Token

Copy the JWT token from the response and:

**In Postman:**
1. Click "Collections" tab
2. Click "Peekify API Collection"
3. Click "Variables" tab
4. Paste your token in the `auth_token` Current Value
5. Click "Save"

**In Thunder Client:**
1. Click "Env" tab
2. Select your environment
3. Paste token in `auth_token` value
4. Click "Save"

### Step 3: Test Authentication

Try the `Authentication` → `Get Current User` request. You should see your profile!

## Testing Workflow

### 1. Health Checks (No Auth Required)
Start here to verify all services are running:
- ✅ Basic Health Check
- ✅ Test All Services
- ✅ Test Database, Redis, Supabase, Firebase, Spotify

### 2. Authentication
- 🔐 Login with Spotify (use browser!)
- 👤 Get Current User
- 🚪 Logout

### 3. User Management
- 📋 Get My Profile
- ✏️ Update My Profile (change display name)
- 🖼️ Upload Avatar (select an image file)
- 👁️ Get User by ID (view public profile)

### 4. Listening History
**Important:** Sync from Spotify first!
1. 🔄 **Sync from Spotify** - Fetches your recent tracks
2. 📜 Get Listening History - View stored tracks
3. 📊 Get Listening Stats - See your statistics

### 5. Feed & Social Features
1. 📰 Get Global Feed (see all posts)
2. ✍️ Create Feed Post - Track/Recap/Milestone
3. Get a feed item ID from the response
4. 💬 Add Comment (replace `:feedItemId` in URL)
5. ❤️ Add Reaction (replace `:feedItemId` in URL)
6. 📝 Get Comments

### 6. Notifications
1. 🔔 Subscribe to Push Notifications (need FCM token)
2. 📬 Get My Subscriptions
3. 🧪 Send Test Notification
4. 🔕 Unsubscribe

## Tips & Tricks

### Editing Path Variables
Some endpoints have `:feedItemId` or `:userId` in the URL:
- **Postman**: Click "Params" tab → edit "Path Variables"
- **Thunder Client**: Replace directly in the URL

### Testing Rate Limits
Try sending the same request 20+ times quickly to test rate limiting:
- Auth endpoints: 5 requests per 15 minutes
- Standard endpoints: 100 requests per minute
- Sync endpoint: 10 requests per minute

### WebSocket Testing
The collection doesn't include WebSocket testing. For real-time features:
1. Use the HTML file from the testing guide
2. Or install a WebSocket client extension
3. Connect to: `wss://peekify.onrender.com`
4. Send auth token in connection: `{ "auth": { "token": "YOUR_TOKEN" } }`

### Common Issues

**401 Unauthorized:**
- Your token expired (7-day expiry)
- Token not set in environment variables
- Token not copied correctly (no spaces!)

**404 Not Found:**
- Check the endpoint URL
- Replace `:feedItemId` or `:userId` with actual UUIDs

**429 Too Many Requests:**
- You hit the rate limit
- Wait a few minutes and try again

**500 Internal Server Error:**
- Check "Test All Services" to see if backend services are running
- Check backend logs on Render.com

## Example Test Flow

Here's a complete test workflow:

```
1. Health Check → Basic Health Check
   ✅ Backend is running

2. Health Check → Test All Services
   ✅ All services connected

3. Authentication → Login with Spotify (in browser)
   ✅ Got JWT token → Save to auth_token variable

4. Authentication → Get Current User
   ✅ See your profile data

5. Listening History → Sync from Spotify
   ✅ Imported recent tracks

6. Listening History → Get Listening History
   ✅ See your tracks in database

7. Listening History → Get Listening Stats
   ✅ See listening statistics

8. Feed & Social → Create Feed Post - Track
   ✅ Created post, got feed item ID

9. Feed & Social → Get Global Feed
   ✅ See your post in the feed

10. Feed & Social → Add Comment (use feed item ID)
    ✅ Comment added

11. Feed & Social → Add Reaction (use feed item ID)
    ✅ Reaction added

12. User Management → Update My Profile
    ✅ Display name changed

13. Notifications → Send Test Notification
    ✅ Notification sent (if subscribed)
```

## Next Steps

- **Automate tests**: Convert these to automated tests with Jest/Supertest
- **Monitor performance**: Check response times
- **Test edge cases**: Invalid data, missing fields, wrong types
- **Load testing**: Use tools like k6 or Artillery
- **Share with team**: Export and share this collection

---

**Collection Location:** `/home/user/peekify/Peekify_API_Collection.postman_collection.json`

**Backend URL:** https://peekify.onrender.com

**Questions?** Check the backend code in `/backend/src/` for implementation details.
