import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const timetableService = {
  // Debug endpoint to test connection
  debug: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/timetable/debug`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Debug test failed' };
    }
  },

  // Get timetable for a specific class and section
  getClassTimetable: async (className, section) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/timetable/class/${className}/${section}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch timetable' };
    }
  },

  // Test endpoint
  testCreate: async (entryData) => {
    try {
      console.log('Testing create with:', entryData);
      const response = await axios.post(
        `${API_BASE_URL}/timetable/test-create`,
        entryData,
        getAuthHeaders()
      );
      console.log('Test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Test error:', error);
      if (error.response) {
        console.error('Test error response:', error.response.data);
        throw error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw { message: 'No response from server. Please check your connection.' };
      } else {
        console.error('Request setup error:', error.message);
        throw { message: 'Failed to test timetable entry' };
      }
    }
  },

  // Create or update timetable entry
  saveTimetableEntry: async (entryData) => {
    try {
      console.log('Sending timetable entry:', entryData);
      const response = await axios.post(
        `${API_BASE_URL}/timetable`,
        entryData,
        getAuthHeaders()
      );
      console.log('Received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw { message: 'No response from server. Please check your connection.' };
      } else {
        console.error('Request setup error:', error.message);
        throw { message: 'Failed to save timetable entry' };
      }
    }
  },

  // Get teacher's schedule
  getTeacherSchedule: async (teacherId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/timetable/teacher/${teacherId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch teacher schedule' };
    }
  },

  // Update timetable entry
  updateTimetableEntry: async (entryId, entryData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/timetable/${entryId}`,
        entryData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update timetable entry' };
    }
  },

  // Delete timetable entry
  deleteTimetableEntry: async (entryId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/timetable/${entryId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete timetable entry' };
    }
  }
};

export default timetableService;