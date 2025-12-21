import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { studentService } from "../services/studentService";

const Attendance = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attendance, setAttendance] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // Load current user
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Load students when class/section changes
  useEffect(() => {
    if (selectedClass !== "all") {
      loadStudents();
      loadExistingAttendance(); // Load existing attendance for the selected date
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedClass, selectedSection, selectedDate, selectedSubject, selectedPeriod]);

  // Load existing attendance when date/subject/period changes
  useEffect(() => {
    if (selectedClass !== "all" && students.length > 0) {
      loadExistingAttendance();
    }
  }, [selectedDate, selectedSubject, selectedPeriod, students]);

  const loadExistingAttendance = async () => {
    if (selectedClass === "all" || students.length === 0) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/class/${selectedClass}/${selectedSection === "all" ? "A" : selectedSection}?date=${selectedDate}&subject=${selectedSubject}&period=${selectedPeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update attendance state with existing data
          const existingAttendance = {};
          
          result.data.students.forEach(studentData => {
            if (studentData.attendance) {
              existingAttendance[studentData.student._id] = studentData.attendance.status;
            } else {
              existingAttendance[studentData.student._id] = "not_marked";
            }
          });
          
          setAttendance(existingAttendance);
          
          if (Object.values(existingAttendance).some(status => status !== "not_marked")) {
            setSuccess(`Loaded existing attendance for ${selectedDate} - ${selectedSubject} Period ${selectedPeriod}`);
            setTimeout(() => setSuccess(""), 3000);
          }
        }
      }
    } catch (err) {
      console.error("Error loading existing attendance:", err);
      // Don't show error to user as this is background loading
    }
  };

  const loadAttendanceHistory = async () => {
    if (selectedClass === "all") {
      setError("Please select a specific class to view history");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get last 30 days of attendance for this class
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/class/${selectedClass}/${selectedSection === "all" ? "A" : selectedSection}?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Use the history data from the updated API response
          const historyData = result.data.history || [];
          setAttendanceHistory(historyData);
          setShowHistoryModal(true);
        }
      }
    } catch (err) {
      setError("Failed to load attendance history: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = {};
      if (selectedClass !== "all") params.class = selectedClass;
      if (selectedSection !== "all") params.section = selectedSection;
      
      const response = await studentService.getStudents(params);
      const studentList = response.data || [];
      
      setStudents(studentList);
      
      // Initialize attendance state with "not_marked" for all students
      const initialAttendance = {};
      studentList.forEach(student => {
        initialAttendance[student._id] = "not_marked";
      });
      setAttendance(initialAttendance);
      
    } catch (err) {
      setError("Failed to load students: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleTestEndpoint = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/test`, {
        method: 'GET'
      });
      
      const result = await response.json();
      console.log("🧪 Test endpoint result:", result);
      setSuccess("Test endpoint working: " + result.message);
    } catch (err) {
      console.error("🧪 Test endpoint failed:", err);
      setError("Test endpoint failed: " + err.message);
    }
  };

  const handleTestMarkEndpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/test-mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          test: "data",
          class: selectedClass,
          section: selectedSection
        })
      });
      
      const result = await response.json();
      console.log("🧪 Test mark endpoint result:", result);
      setSuccess("Test mark endpoint working: " + result.message);
    } catch (err) {
      console.error("🧪 Test mark endpoint failed:", err);
      setError("Test mark endpoint failed: " + err.message);
    }
  };

  const handleSaveAttendance = async () => {
    if (!currentUser) {
      setError("Please login to mark attendance");
      return;
    }

    if (!['admin', 'teacher'].includes(currentUser.role)) {
      setError("Only teachers and admins can mark attendance");
      return;
    }

    if (selectedClass === "all") {
      setError("Please select a specific class to mark attendance");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Prepare attendance data
      const attendanceData = Object.entries(attendance)
        .filter(([_, status]) => status !== "not_marked")
        .map(([studentId, status]) => ({
          studentId,
          status,
          timeIn: status === "present" || status === "late" ? new Date().toISOString() : null
        }));

      if (attendanceData.length === 0) {
        setError("Please mark attendance for at least one student");
        setLoading(false);
        return;
      }

      // Call API to save attendance
      const token = localStorage.getItem('token');
      console.log("🔐 Token exists:", !!token);
      console.log("📤 Sending attendance data:", {
        class: selectedClass,
        section: selectedSection === "all" ? "A" : selectedSection,
        date: selectedDate,
        subject: selectedSubject,
        period: selectedPeriod,
        attendanceData
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/mark-attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class: selectedClass,
          section: selectedSection === "all" ? "A" : selectedSection,
          date: selectedDate,
          subject: selectedSubject,
          period: selectedPeriod,
          attendanceData
        })
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response headers:", response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error("❌ Non-JSON response:", textResponse);
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("📥 Response data:", result);

      if (result.success) {
        setSuccess(`Attendance saved successfully for ${attendanceData.length} students!`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to save attendance");
      }

    } catch (err) {
      setError("Failed to save attendance: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return "badge bg-success";
      case "absent":
        return "badge bg-danger";
      case "late":
        return "badge bg-warning text-dark";
      case "excused":
        return "badge bg-info";
      case "not_marked":
        return "badge bg-secondary";
      default:
        return "badge bg-secondary";
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: filteredStudents.length,
    present: filteredStudents.filter(s => attendance[s._id] === "present").length,
    absent: filteredStudents.filter(s => attendance[s._id] === "absent").length,
    late: filteredStudents.filter(s => attendance[s._id] === "late").length,
    excused: filteredStudents.filter(s => attendance[s._id] === "excused").length,
    not_marked: filteredStudents.filter(s => attendance[s._id] === "not_marked").length,
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-calendar-check me-2 text-primary"></i>
            Attendance Management
          </h2>
          <p className="text-muted mb-0">Mark and track student attendance</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          {currentUser && (
            <span className="badge bg-primary">
              <i className="bi bi-person-circle me-1"></i>
              {currentUser.fullName} ({currentUser.role})
            </span>
          )}
          <div className="d-flex gap-2">
            <button className="btn btn-outline-info btn-sm" onClick={handleTestEndpoint}>
              <i className="bi bi-bug me-1"></i>Test API
            </button>
            <button className="btn btn-outline-warning btn-sm" onClick={handleTestMarkEndpoint}>
              <i className="bi bi-bug me-1"></i>Test Mark
            </button>
            <button className="btn btn-outline-info btn-sm" onClick={loadAttendanceHistory}>
              <i className="bi bi-clock-history me-1"></i>View History
            </button>
          </div>
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <i className="bi bi-people-fill text-primary" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.total}</h3>
              <small className="text-muted">Total Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.present}</h3>
              <small className="text-muted">Present</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card shadow-sm border-danger">
            <div className="card-body text-center">
              <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.absent}</h3>
              <small className="text-muted">Absent</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="bi bi-clock-fill text-warning" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.late}</h3>
              <small className="text-muted">Late</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <i className="bi bi-info-circle-fill text-info" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.excused}</h3>
              <small className="text-muted">Excused</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card shadow-sm border-secondary">
            <div className="card-body text-center">
              <i className="bi bi-question-circle-fill text-secondary" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.not_marked}</h3>
              <small className="text-muted">Not Marked</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="all">Select Class</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Section</label>
              <select
                className="form-select"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={selectedClass === "all"}
              >
                <option value="all">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Period</label>
              <select
                className="form-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="1">Period 1</option>
                <option value="2">Period 2</option>
                <option value="3">Period 3</option>
                <option value="4">Period 4</option>
                <option value="5">Period 5</option>
                <option value="6">Period 6</option>
                <option value="7">Period 7</option>
                <option value="8">Period 8</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Search Student</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Student Attendance
              {Object.values(attendance).some(status => status !== "not_marked" && status !== undefined) && (
                <span className="badge bg-info ms-2">
                  <i className="bi bi-database me-1"></i>
                  Data from Database
                </span>
              )}
            </h5>
            {selectedClass !== "all" && (
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-success btn-sm"
                  onClick={() => {
                    const newAttendance = {};
                    filteredStudents.forEach(student => {
                      newAttendance[student._id] = "present";
                    });
                    setAttendance({ ...attendance, ...newAttendance });
                  }}
                >
                  <i className="bi bi-check-all me-1"></i>Mark All Present
                </button>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    const newAttendance = {};
                    filteredStudents.forEach(student => {
                      newAttendance[student._id] = "absent";
                    });
                    setAttendance({ ...attendance, ...newAttendance });
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i>Mark All Absent
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="card-body p-0">
          {selectedClass === "all" ? (
            <div className="text-center py-5">
              <i className="bi bi-arrow-up-circle text-muted" style={{ fontSize: "3rem" }}></i>
              <p className="text-muted mt-2 mb-0">Please select a class to view students</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student._id}>
                        <td className="align-middle">
                          <strong>{student.rollNumber}</strong>
                        </td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                                 style={{ width: "35px", height: "35px", fontSize: "14px" }}>
                              {student.firstName?.[0]}{student.lastName?.[0]}
                            </div>
                            {student.fullName}
                          </div>
                        </td>
                        <td className="align-middle">
                          <span className="badge bg-info">{student.class}-{student.section}</span>
                        </td>
                        <td className="align-middle">
                          <small>{student.email}</small>
                        </td>
                        <td className="align-middle">
                          <span className={getStatusBadge(attendance[student._id])}>
                            {attendance[student._id]?.toUpperCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td className="align-middle">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className={`btn ${attendance[student._id] === "present" ? "btn-success" : "btn-outline-success"}`}
                              onClick={() => handleStatusChange(student._id, "present")}
                              title="Present"
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                            <button
                              className={`btn ${attendance[student._id] === "absent" ? "btn-danger" : "btn-outline-danger"}`}
                              onClick={() => handleStatusChange(student._id, "absent")}
                              title="Absent"
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                            <button
                              className={`btn ${attendance[student._id] === "late" ? "btn-warning" : "btn-outline-warning"}`}
                              onClick={() => handleStatusChange(student._id, "late")}
                              title="Late"
                            >
                              <i className="bi bi-clock"></i>
                            </button>
                            <button
                              className={`btn ${attendance[student._id] === "excused" ? "btn-info" : "btn-outline-info"}`}
                              onClick={() => handleStatusChange(student._id, "excused")}
                              title="Excused"
                            >
                              <i className="bi bi-info-circle"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        <i className="bi bi-inbox" style={{ fontSize: "2rem" }}></i>
                        <p className="mb-0 mt-2">
                          {searchTerm ? `No students found matching "${searchTerm}"` : "No students found in this class"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">
              Showing {filteredStudents.length} students
              {searchTerm && ` (filtered by "${searchTerm}")`}
            </span>
            {selectedClass !== "all" && filteredStudents.length > 0 && (
              <button 
                className="btn btn-primary"
                onClick={handleSaveAttendance}
                disabled={loading || !currentUser || !['admin', 'teacher'].includes(currentUser?.role)}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>Save Attendance
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History Modal */}
      {showHistoryModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-clock-history me-2"></i>
                  Attendance History - Class {selectedClass}-{selectedSection === "all" ? "All" : selectedSection}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowHistoryModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {attendanceHistory.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-calendar-x text-muted" style={{ fontSize: "3rem" }}></i>
                    <p className="text-muted mt-2">No attendance history found for the last 30 days.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Subject</th>
                          <th>Period</th>
                          <th>Student</th>
                          <th>Roll No</th>
                          <th>Status</th>
                          <th>Time In</th>
                          <th>Marked At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceHistory.map((record, index) => (
                          <tr key={index}>
                            <td>{new Date(record.date).toLocaleDateString()}</td>
                            <td className="fw-bold">{record.subject}</td>
                            <td>
                              <span className="badge bg-secondary">{record.period}</span>
                            </td>
                            <td>{record.studentName}</td>
                            <td><strong>{record.rollNumber}</strong></td>
                            <td>
                              <span className={`badge ${
                                record.status === 'present' ? 'bg-success' :
                                record.status === 'absent' ? 'bg-danger' :
                                record.status === 'late' ? 'bg-warning' : 'bg-info'
                              }`}>
                                {record.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              {record.timeIn ? new Date(record.timeIn).toLocaleTimeString() : '-'}
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(record.markedAt).toLocaleString()}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowHistoryModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;