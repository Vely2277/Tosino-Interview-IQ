# InterviewIQ Authentication Setup

This update adds user authentication to the InterviewIQ application using Supabase Auth.

## Features Added

- ✅ User registration and login with email/password
- ✅ Google OAuth authentication  
- ✅ Protected routes requiring authentication
- ✅ User session tracking with interview sessions
- ✅ User progress tracking
- ✅ Automatic user profile creation
- ✅ Row-level security for data isolation

## Setup Instructions

### 1. Frontend Setup

1. **Install dependencies** (already done):
   ```bash
   npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared @supabase/ssr
   ```

2. **Environment Variables**:
   - Copy `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```

### 2. Database Setup

1. **Run the SQL schema**:
   - Copy the contents of `database-schema.sql`
   - Paste and execute in your Supabase SQL editor
   - This will create the necessary tables, triggers, and security policies

2. **Configure Authentication**:
   - In Supabase Dashboard → Authentication → Settings
   - Configure redirect URLs:
     - Site URL: `http://localhost:3000`
     - Redirect URLs: `http://localhost:3000/auth/callback`
   
   - For Google OAuth (optional):
     - Enable Google provider in Auth → Providers
     - Add your Google OAuth credentials

### 3. Backend Updates

The backend has been updated to:
- Accept `userId` parameter in session creation
- Link sessions to authenticated users
- Support both authenticated and guest users

### 4. Protected Routes

The following pages now require authentication:
- `/hub` - User dashboard
- `/practice` - Interview practice
- `/interview-mode` - Interview mode selection
- `/voice-interview` - Voice interview
- `/text-interview` - Text interview
- `/cv` - CV management
- `/create-cv` - CV creation
- `/progress` - User progress

### 5. Navigation Updates

- Home page now shows different UI for authenticated vs unauthenticated users
- Login/signup buttons navigate to proper auth pages
- User can sign out from the navigation

## User Flow

1. **New User**:
   - Visits home page
   - Clicks "Get Started" → redirected to signup
   - Creates account → automatically logged in → redirected to hub

2. **Returning User**:
   - Visits home page
   - Clicks "Sign In" → enters credentials → redirected to hub

3. **Protected Access**:
   - Any attempt to access protected routes without authentication redirects to login
   - After successful login, user is redirected to intended page

## Technical Details

### Authentication Context
- `useAuth()` hook provides user state and auth methods
- Automatically syncs with Supabase auth state
- Handles loading states and errors

### Route Protection
- `ProtectedRoute` component wraps pages requiring auth
- Shows loading spinner while checking auth state
- Redirects to login if not authenticated

### User Data
- User profiles automatically created on signup
- Interview sessions linked to user accounts
- Progress tracking per user
- Row-level security ensures data isolation

### Session Integration
- Interview sessions now include `userId`
- Backend creates sessions linked to authenticated users
- Progress updates tied to user accounts

## Testing

1. **Start the applications**:
   ```bash
   # Frontend
   npm run dev
   
   # Backend (in separate terminal)
   cd ../backend
   npm run dev
   ```

2. **Test Authentication**:
   - Visit home page
   - Try signing up with email
   - Try signing in
   - Test Google OAuth (if configured)
   - Verify protected routes redirect when not logged in
   - Check that sessions are created with user IDs

3. **Test Interview Flow**:
   - Login → go to practice → select job → start interview
   - Verify session is created with user ID in backend
   - Complete interview and check progress tracking

## Troubleshooting

- **Auth not working**: Check Supabase environment variables
- **Database errors**: Ensure schema has been run in Supabase
- **Redirect issues**: Verify redirect URLs in Supabase settings
- **Protected routes not working**: Check that ProtectedRoute is properly wrapping components
