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

  // Get all available teachers
  getTeachers: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/timetable/teachers`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch teachers' };
    }
  },

  // Create or update timetable entry
  saveTimetableEntry: async (entryData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/timetable`,
        entryData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save timetable entry' };
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