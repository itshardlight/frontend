import { useState, useEffect } from "react";
import { studentService } from "../../services/studentService";

const AttendanceManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState("9");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attendance, setAttendance] = useState({});

  // Load students when class/section changes
  useEffect(() => {
    loadStudents();
    loadExistingAttendance();
  }, [selectedClass, selectedSection, selectedDate, selectedSubject, selectedPeriod]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await studentService.getStudents({
        class: selectedClass,
        section: selectedSection
      });
      
      const studentList = response.data || [];
      setStudents(studentList);
      
      // Initialize attendance state
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

  const loadExistingAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/class/${selectedClass}/${selectedSection}?date=${selectedDate}&subject=${selectedSubject}&period=${selectedPeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const existingAttendance = {};
          
          result.data.students.forEach(studentData => {
            if (studentData.attendance) {
              existingAttendance[studentData.student._id] = studentData.attendance.status;
            } else {
              existingAttendance[studentData.student._id] = "not_marked";
            }
          });
          
          setAttendance(existingAttendance);
        }
      }
    } catch (err) {
      console.error("Error loading existing attendance:", err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSaveAttendance = async () => {
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

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/mark-attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class: selectedClass,
          section: selectedSection,
          date: selectedDate,
          subject: selectedSubject,
          period: selectedPeriod,
          attendanceData
        })
      });

      const result = await response.json();

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
      case "present": return "badge bg-success";
      case "absent": return "badge bg-danger";
      case "late": return "badge bg-warning text-dark";
      case "excused": return "badge bg-info";
      case "not_marked": return "badge bg-secondary";
      default: return "badge bg-secondary";
    }
  };

  const stats = {
    total: students.length,
    present: students.filter(s => attendance[s._id] === "present").length,
    absent: students.filter(s => attendance[s._id] === "absent").length,
    late: students.filter(s => attendance[s._id] === "late").length,
    excused: students.filter(s => attendance[s._id] === "excused").length,
    not_marked: students.filter(s => attendance[s._id] === "not_marked").length,
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-1">
          <i className="bi bi-calendar-check me-2 text-primary"></i>
          Attendance Management
        </h2>
        <p className="text-muted mb-0">Mark and track student attendance</p>
      </div>

      {/* Messages */}
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
          <div className="card text-center border-primary">
            <div className="card-body">
              <i className="bi bi-people-fill text-primary" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.total}</h3>
              <small className="text-muted">Total</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center border-success">
            <div className="card-body">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.present}</h3>
              <small className="text-muted">Present</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center border-danger">
            <div className="card-body">
              <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.absent}</h3>
              <small className="text-muted">Absent</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center border-warning">
            <div className="card-body">
              <i className="bi bi-clock-fill text-warning" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.late}</h3>
              <small className="text-muted">Late</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center border-info">
            <div className="card-body">
              <i className="bi bi-info-circle-fill text-info" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.excused}</h3>
              <small className="text-muted">Excused</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center border-secondary">
            <div className="card-body">
              <i className="bi bi-question-circle-fill text-secondary" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.not_marked}</h3>
              <small className="text-muted">Not Marked</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
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
              >
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
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-primary w-100"
                onClick={handleSaveAttendance}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Students - Class {selectedClass}-{selectedSection}</h5>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-success btn-sm"
                onClick={() => {
                  const newAttendance = {};
                  students.forEach(student => {
                    newAttendance[student._id] = "present";
                  });
                  setAttendance({ ...attendance, ...newAttendance });
                }}
              >
                <i className="bi bi-check-all me-1"></i>All Present
              </button>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  const newAttendance = {};
                  students.forEach(student => {
                    newAttendance[student._id] = "absent";
                  });
                  setAttendance({ ...attendance, ...newAttendance });
                }}
              >
                <i className="bi bi-x-circle me-1"></i>All Absent
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
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
                        <span className={getStatusBadge(attendance[student._id])}>
                          {attendance[student._id]?.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="align-middle">
                        <div className="btn-group btn-group-sm">
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
                    <td colSpan="4" className="text-center py-4 text-muted">
                      <i className="bi bi-inbox" style={{ fontSize: "2rem" }}></i>
                      <p className="mb-0 mt-2">No students found in this class</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManager;