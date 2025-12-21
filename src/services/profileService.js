import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth header
const createAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const profileService = {
  // Create new profile (Admin only)
  createProfile: async (profileData) => {
    try {
      const response = await axios.post(
        `${API_URL}/profiles`,
        profileData,
        { headers: createAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create profile' };
    }
  },

  // Get profile by ID
  getProfile: async (profileId) => {
    try {
      const response = await axios.get(
        `${API_URL}/profiles/${profileId}`,
        { headers: createAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Get current user's profile
  getMyProfile: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/profiles/me/profile`,
        { headers: createAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Update profile
  updateProfile: async (profileId, updates) => {
    try {
      const response = await axios.put(
        `${API_URL}/profiles/${profileId}`,
        updates,
        { headers: createAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Add achievement (Students only)
  addAchievement: async (profileId, achievement) => {
    try {
      const response = await axios.post(
        `${API_URL}/profiles/${profileId}/achievements`,
        achievement,
        { headers: createAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add achievement' };
    }
  },

  // Update achievement (Students only)
  updateAchievement: async (profileId, achievementId, achievement) => {
    try {
      const response = await axios.put(
        `${API_URL}/profiles/${profileId}/achievements/${achievementId}`,
        achievement,
        { headers: createAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update achievement' };
    }
  },

  // Delete achievement (Students only)
  deleteAchievement: async (profileId, achievementId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/profiles/${profileId}/achievements/${achievementId}`,
        { headers: createAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete achievement' };
    }
  },

  // Get all profiles (Admin/Teachers only)
  getAllProfiles: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(
        `${API_URL}/profiles?${params.toString()}`,
        { headers: createAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profiles' };
    }
  },

  // Update fee information (Fee Department only)
  updateFeeInfo: async (profileId, feeData) => {
    try {
      const response = await axios.put(
        `${API_URL}/profiles/${profileId}`,
        { feeInfo: feeData },
        { headers: createAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update fee information' };
    }
  },

  // Update academic information (Teachers/Admin only)
  updateAcademicInfo: async (profileId, academicData) => {
    try {
      const response = await axios.put(
        `${API_URL}/profiles/${profileId}`,
        { academic: academicData },
        { headers: createAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update academic information' };
    }
  }
};

export default profileService;