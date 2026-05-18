const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AdminAttendanceService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get attendance data for a specific student (admin/teacher access)
  async getStudentAttendance(studentId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const url = `${API_BASE_URL}/attendance/student/${studentId}?${queryParams.toString()}`;
      const response = await fetch(url, { method: 'GET', headers: this.getAuthHeaders() });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to fetch attendance data');
      return data.data;

    } catch (error) {
      console.error('Error fetching student attendance:', error);
      throw error;
    }
  }

  // Get attendance summary for quick display (last 30 days)
  async getStudentAttendanceSummary(studentId) {
    try {
      const data = await this.getStudentAttendance(studentId);
      return {
        summary: data.summary,
        hasData: data.records.length > 0
      };
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      return {
        summary: { present: 0, absent: 0, late: 0, total: 0, percentage: 0 },
        hasData: false,
        error: error.message
      };
    }
  }

  // Mark daily attendance for multiple students
  async markAttendance(attendanceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/mark-attendance`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(attendanceData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to mark attendance');
      return result;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  // Get class attendance for a date or date range
  async getClassAttendance(classInfo, filters = {}) {
    try {
      const { class: studentClass, section } = classInfo;
      const queryParams = new URLSearchParams();
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const url = `${API_BASE_URL}/attendance/class/${studentClass}/${section}?${queryParams.toString()}`;
      const response = await fetch(url, { method: 'GET', headers: this.getAuthHeaders() });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to fetch class attendance');
      return data.data;
    } catch (error) {
      console.error('Error fetching class attendance:', error);
      throw error;
    }
  }

  getStatusColor(status) {
    const colors = { present: 'success', absent: 'danger', late: 'warning', excused: 'info' };
    return colors[status] || 'secondary';
  }

  getPercentageColor(percentage) {
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'warning';
    return 'danger';
  }
}

export default new AdminAttendanceService();
