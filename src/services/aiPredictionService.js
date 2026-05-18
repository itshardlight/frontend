import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class AIPredictionService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Test prediction for a specific student (for debugging)
  async testStudentPrediction(studentId) {
    try {
      const response = await this.apiClient.get(`/ai-predictions/test-prediction/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to test student prediction');
    }
  }

  // Get formula-based prediction for a specific student
  async getStudentFormulaPrediction(studentId) {
    try {
      const response = await this.apiClient.get(`/ai-predictions/student/${studentId}/formula`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get formula-based prediction');
    }
  }

  // Get AI prediction for a specific student
  async getStudentPrediction(studentId) {
    try {
      const response = await this.apiClient.get(`/ai-predictions/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get student prediction');
    }
  }

  // Analyze all students or specific class
  async analyzeClass(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.class) params.append('class', filters.class);
      if (filters.section) params.append('section', filters.section);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await this.apiClient.get(`/ai-predictions/analyze-class?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to analyze class');
    }
  }

  // Get detailed class insights
  async getClassInsights(className, section) {
    try {
      const response = await this.apiClient.get(`/ai-predictions/class-insights/${className}/${section}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get class insights');
    }
  }

  // Get list of weak/at-risk students
  async getWeakStudents(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.class) params.append('class', filters.class);
      if (filters.section) params.append('section', filters.section);
      if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);

      const response = await this.apiClient.get(`/ai-predictions/weak-students?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get weak students');
    }
  }

  // Bulk analyze multiple students
  async bulkAnalyze(studentIds) {
    try {
      const response = await this.apiClient.post('/ai-predictions/bulk-analyze', {
        studentIds
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to perform bulk analysis');
    }
  }

  // Helper method to get risk level color
  getRiskLevelColor(riskLevel) {
    switch (riskLevel) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  }

  // Helper method to get grade color
  getGradeColor(grade) {
    switch (grade) {
      case 'A+':
      case 'A': return 'success';
      case 'B+':
      case 'B': return 'primary';
      case 'C+':
      case 'C': return 'info';
      case 'D': return 'warning';
      case 'F': return 'danger';
      default: return 'secondary';
    }
  }

  // Helper method to format percentage
  formatPercentage(percentage) {
    return `${percentage.toFixed(1)}%`;
  }

  // Analyze student feedback using AI
  async analyzeFeedback(feedbackText, studentId) {
    try {
      const response = await this.apiClient.post('/ai-predictions/analyze-feedback', {
        feedbackText,
        studentId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to analyze feedback');
    }
  }

  // Generate personalized study plan
  async generateStudyPlan(studentId, targetGrade = 'B+') {
    try {
      const response = await this.apiClient.post('/ai-predictions/generate-study-plan', {
        studentId,
        targetGrade
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate study plan');
    }
  }

  // Check Hugging Face integration status
  async getHuggingFaceStatus() {
    try {
      const response = await this.apiClient.get('/ai-predictions/hf-status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check Hugging Face status');
    }
  }

  // Helper method to get sentiment color
  getSentimentColor(sentiment) {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'danger';
      case 'neutral': return 'secondary';
      default: return 'secondary';
    }
  }

  // Helper method to get sentiment icon
  getSentimentIcon(sentiment) {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      case 'neutral': return '😐';
      default: return '❓';
    }
  }
}

export const aiPredictionService = new AIPredictionService();
export default aiPredictionService;