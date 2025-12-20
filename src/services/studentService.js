const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

export const studentService = {
  // Get all students with pagination and filtering (public)
  getStudents: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/students/list/public?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return handleResponse(response);
  },

  // Get student by ID
  getStudentById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  // Create new student (public registration)
  createStudent: async (studentData) => {
    const response = await fetch(`${API_BASE_URL}/students/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    });

    return handleResponse(response);
  },

  // Update student (requires authentication)
  updateStudent: async (id, studentData) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData)
    });

    return handleResponse(response);
  },

  // Delete student (requires authentication)
  deleteStudent: async (id) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  // Get student statistics (public)
  getStudentStats: async () => {
    const response = await fetch(`${API_BASE_URL}/students/stats/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return handleResponse(response);
  },

  // Generate unique roll number (public)
  generateRollNumber: async (classValue, section) => {
    const response = await fetch(`${API_BASE_URL}/students/generate-rollnumber`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ class: classValue, section })
    });

    return handleResponse(response);
  }
};

export default studentService;