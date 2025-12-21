const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AdminAttendanceService {
  // Get authentication headers
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
      // First, get student details to find their class and section
      const studentResponse = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!studentResponse.ok) {
        throw new Error('Failed to fetch student details');
      }

      const studentData = await studentResponse.json();
      const student = studentData.data;

      // Now get attendance data for this student's class
      const queryParams = new URLSearchParams();
      
      // Set default date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      queryParams.append('startDate', filters.startDate || startDate.toISOString().split('T')[0]);
      queryParams.append('endDate', filters.endDate || endDate.toISOString().split('T')[0]);

      const url = `${API_BASE_URL}/attendance/class/${student.class}/${student.section}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch attendance data');
      }

      // Filter records for this specific student and calculate summary
      const studentRecords = data.data.history?.filter(record => 
        record.rollNumber === student.rollNumber
      ) || [];

      // Calculate subject-wise summary
      const subjectSummary = {};
      studentRecords.forEach(record => {
        if (!subjectSummary[record.subject]) {
          subjectSummary[record.subject] = {
            present: 0,
            absent: 0,
            late: 0,
            total: 0
          };
        }
        
        subjectSummary[record.subject].total++;
        if (record.status === 'present') {
          subjectSummary[record.subject].present++;
        } else if (record.status === 'absent') {
          subjectSummary[record.subject].absent++;
        } else if (record.status === 'late') {
          subjectSummary[record.subject].late++;
        }
      });

      // Calculate overall summary
      const totalRecords = studentRecords.length;
      const presentCount = studentRecords.filter(r => r.status === 'present').length;
      const absentCount = studentRecords.filter(r => r.status === 'absent').length;
      const lateCount = studentRecords.filter(r => r.status === 'late').length;
      const overallPercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

      return {
        student: {
          name: `${student.firstName} ${student.lastName}`,
          rollNumber: student.rollNumber,
          class: student.class,
          section: student.section
        },
        summary: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          total: totalRecords,
          percentage: overallPercentage
        },
        subjectSummary: Object.keys(subjectSummary).map(subject => ({
          subject,
          ...subjectSummary[subject],
          percentage: subjectSummary[subject].total > 0 ? 
            Math.round((subjectSummary[subject].present / subjectSummary[subject].total) * 100) : 0
        })),
        records: studentRecords.slice(0, 10) // Last 10 records
      };

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
        subjectSummary: data.subjectSummary,
        hasData: data.records.length > 0
      };
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      // Return empty data instead of throwing error for UI
      return {
        summary: { present: 0, absent: 0, late: 0, total: 0, percentage: 0 },
        subjectSummary: [],
        hasData: false,
        error: error.message
      };
    }
  }

  // Format percentage
  formatPercentage(value) {
    return Math.round(value * 100) / 100;
  }

  // Get status color for UI
  getStatusColor(status) {
    const colors = {
      'present': 'success',
      'absent': 'danger',
      'late': 'warning',
      'excused': 'info'
    };
    return colors[status] || 'secondary';
  }

  // Get percentage color
  getPercentageColor(percentage) {
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'warning';
    return 'danger';
  }
}

export default new AdminAttendanceService();