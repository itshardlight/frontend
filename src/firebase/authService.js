import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "./config";

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: displayName || userCredential.user.email,
        photoURL: userCredential.user.photoURL
      }
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || userCredential.user.email,
        photoURL: userCredential.user.photoURL
      }
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        photoURL: result.user.photoURL
      }
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Update user profile
export const updateUserProfile = async (displayName) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: "No user is currently signed in"
      };
    }

    await updateProfile(user, {
      displayName: displayName
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: displayName,
        photoURL: user.photoURL
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please login instead.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/operation-not-allowed":
      return "Operation not allowed. Please contact support.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing.";
    case "auth/cancelled-popup-request":
      return "Only one popup request is allowed at a time.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by the browser.";
    default:
      return "An error occurred. Please try again.";
  }
};
