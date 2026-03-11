# Authentication Integration Guide

## Configuration

### 1. Environment Variables
Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Change the URL to match your backend's address (default is `localhost:5000` for .NET development).

## Implementation Overview

### Models
All authentication response models are properly typed according to your backend API:

- **UserResponse** - User data structure with all fields (id, email, emailVerified, name, givenName, familyName, picture, locale)
- **SignUpRequest/Response** - Registration with email/password
- **SignInRequest/Response** - Login with email/password
- **PasswordResetRequest/Response** - Password recovery flow

### Service: AuthenticationService
Located at `src/app/auth/services/authentication.service.ts`

**Available Methods:**

1. **signUp(request: SignUpRequest)** → SignUpResponse
   - Registers a new user
   - Returns accessToken, refreshToken, user data

2. **signIn(request: SignInRequest)** → SignInResponse
   - Authenticates user with credentials
   - Returns accessToken, refreshToken, user data

3. **requestPasswordReset(email: string)** → PasswordResetResponse
   - Initiates password recovery process

4. **getGoogleAuthUrl()** → string
   - Returns Google OAuth login URL

5. **exchangeGoogleCode(code: string)** → SignInResponse
   - Exchanges Google authorization code for tokens

6. **verifyGoogleToken(idToken: string)** → UserResponse
   - Verifies Google ID token validity

7. **getCurrentUser(token: string)** → UserResponse
   - Retrieves logged-in user's profile
   - Requires Bearer token in Authorization header

### Store: useAuthenticationStore
Located at `src/app/auth/services/authentication.store.ts`

**Reactive State:**
- `signedIn` - Boolean indicating if user is authenticated
- `user` - Current UserResponse object
- `accessToken` - JWT token for API requests
- `refreshToken` - Token for refreshing access

**Computed Properties:**
- `isSignedIn` - Check authentication status
- `currentUser` - Get full user object
- `currentUserId` - Get user ID
- `currentUserEmail` - Get user email
- `currentAccessToken` - Get access token

**Available Actions:**

```typescript
// Sign in
const authStore = useAuthenticationStore();
const success = await authStore.signIn(new SignInRequest('email@example.com', 'password'));

// Sign up
const success = await authStore.signUp(
  new SignUpRequest('email@example.com', 'password', 'Full Name')
);

// Sign out
await authStore.signOut();

// Password reset
const success = await authStore.requestPasswordReset('email@example.com');

// Google OAuth
const success = await authStore.signInWithGoogleCode(authorizationCode);

// Load user data
const success = await authStore.loadCurrentUser();
```

## Token Management

### Automatic Token Injection
The `authentication.interceptor.ts` automatically includes the access token in all API requests:

```
Authorization: Bearer {accessToken}
```

This happens transparently for all HTTP requests made through the `http` service.

### Token Storage
Tokens are persisted in localStorage:
- `accessToken` - Used for authenticated requests
- `refreshToken` - For token refresh (optional backend feature)
- `expiresIn` - Token expiration time in seconds

### Logout
`signOut()` automatically clears all tokens and redirects to login page.

## Usage Examples

### In Vue Components

```vue
<script setup lang="ts">
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { SignInRequest } from '@/app/auth/model/sign-in/sign-in.request';

const authStore = useAuthenticationStore();

// Check if user is logged in
if (authStore.isSignedIn) {
  console.log('User:', authStore.currentUser?.name);
}

// Sign in
const handleSignIn = async (email: string, password: string) => {
  const request = new SignInRequest(email, password);
  const success = await authStore.signIn(request);
  // User is automatically redirected on successful login
};

// Sign out
const handleSignOut = async () => {
  await authStore.signOut();
};
</script>
```

### In Services/Other Code

```typescript
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

const authStore = useAuthenticationStore();
const token = authStore.currentAccessToken;

// Use token for custom requests or pass to other services
```

## API Endpoints

All endpoints reference the base URL from `VITE_API_URL` environment variable.

### Email/Password Authentication
- `POST /api/v1/auth/sign-up` - Register new user
- `POST /api/v1/auth/sign-in` - Login
- `POST /api/v1/auth/password-reset` - Request password reset

### Google OAuth
- `GET /api/v1/auth/google/url` - Get login URL
- `POST /api/v1/auth/google/token` - Exchange code for tokens
- `POST /api/v1/auth/google/verify` - Verify ID token

### User Data
- `GET /api/v1/me` - Get current user (requires auth)

## Common Issues & Solutions

### "Cannot POST /auth/sign-in"
- Verify backend is running on the correct port
- Check `VITE_API_URL` environment variable
- Ensure backend endpoint is `/api/v1/auth/...` (not `/authentication/...`)

### Tokens not persisting
- Check localStorage is enabled in browser
- Verify tokens are returned correctly from backend

### 401 Unauthorized on protected routes
- Token may have expired
- Implement token refresh using `refreshToken`
- Check Authorization header is being set correctly

## Next Steps

1. Set up your `.env.local` file with correct backend URL
2. Ensure your backend is running on the configured port
3. Test using the SignIn/SignUp components
4. Implement refresh token logic if your backend requires it
5. Add error handling and user feedback in your components
