import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Register user with role after Firebase authentication
export const registerUserWithRole = async (firebaseUser, role, additionalData = {}) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email,
      role: role,
      photoURL: firebaseUser.photoURL,
      ...additionalData
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: error.response?.data?.message || "Registration failed" };
  }
};

// Get user data by Firebase UID
export const getUserByFirebaseUid = async (firebaseUid) => {
  try {
    const response = await axios.get(`${API_URL}/user/${firebaseUid}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, message: error.response?.data?.message || "Failed to fetch user" };
  }
};

// Update user role (admin only)
export const updateUserRole = async (firebaseUid, newRole) => {
  try {
    const response = await axios.put(`${API_URL}/user/${firebaseUid}/role`, {
      role: newRole
    });
    return response.data;
  } catch (error) {
    console.error("Error updating role:", error);
    return { success: false, message: error.response?.data?.message || "Failed to update role" };
  }
};
