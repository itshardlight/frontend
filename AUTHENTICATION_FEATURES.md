# Authentication Features

## Implemented Features

### 1. Sign Up (Create New Account)
- Users can create a new account with:
  - Full Name
  - Email Address
  - Password (minimum 6 characters)
- Automatic profile creation with display name
- Redirects to dashboard after successful signup

### 2. Login (Use Existing Account)
- Users can login with:
  - Email Address
  - Password
- Session persists using localStorage
- Redirects to dashboard after successful login

### 3. Forgot Password
- Users can reset their password by:
  - Entering their email address
  - Receiving a password reset link via email
  - Clicking the link to create a new password
- Secure Firebase-managed password reset flow

### 4. Google Sign-In
- One-click authentication with Google account
- Automatic profile information retrieval
- No password required
- Works for both new and existing users

### 5. Logout
- Secure logout functionality
- Clears user session
- Redirects to login page

## How to Use

### For New Users:
1. Click "Sign up" on the login page
2. Enter your full name, email, and password
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the dashboard

### For Existing Users:
1. Enter your email and password
2. Click "Login"
3. You'll be redirected to the dashboard

### Forgot Your Password?
1. Click "Forgot Password?" on the login page
2. Enter your email address
3. Click "Send Reset Link"
4. Check your email for the password reset link
5. Click the link and follow instructions to create a new password
6. Return to the login page and sign in with your new password

### Using Google Sign-In:
1. Click "Sign in with Google" button
2. Select your Google account
3. You'll be automatically logged in and redirected to the dashboard

## Technical Details

### Authentication Provider
- **Firebase Authentication** - Google's secure authentication service

### Supported Methods
- Email/Password
- Google OAuth 2.0

### Security Features
- Encrypted password storage
- Secure token-based authentication
- Protected routes (dashboard requires authentication)
- Session management
- Password strength validation (minimum 6 characters)

### User Data Stored
- User ID (Firebase UID)
- Email Address
- Display Name
- Profile Photo (for Google sign-in)

## Error Handling

The application provides user-friendly error messages for:
- Invalid email format
- Weak passwords
- Email already in use
- Wrong password
- User not found
- Network errors
- Popup blocked (for Google sign-in)

## Browser Compatibility

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge
