import { useState, useEffect } from "react";
import { studentService } from "../../services/studentService";

const AttendanceManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedSection, setSelectedSection] = useState("A");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attendance, setAttendance] = useState({});

  // Reload students + existing attendance whenever class/section/date changes
  useEffect(() => {
    loadStudents();
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (students.length > 0) {
      loadExistingAttendance();
    }
  }, [selectedDate, students]);

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

      // Reset attendance marks
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
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/class/${selectedClass}/${selectedSection}?date=${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const existingAttendance = {};
          result.data.students.forEach(studentData => {
            existingAttendance[studentData.student._id] = studentData.status;
          });
          setAttendance(prev => ({ ...prev, ...existingAttendance }));
        }
      }
    } catch (err) {
      console.error("Error loading existing attendance:", err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setError("");

      const attendanceData = Object.entries(attendance)
        .filter(([_, status]) => status !== "not_marked")
        .map(([studentId, status]) => ({ studentId, status }));

      if (attendanceData.length === 0) {
        setError("Please mark attendance for at least one student");
        setSaving(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/mark-attendance`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            class: selectedClass,
            section: selectedSection,
            date: selectedDate,
            attendanceData
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(`Attendance saved for ${attendanceData.length} student(s) on ${new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`);
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(result.message || "Failed to save attendance");
      }

    } catch (err) {
      setError("Failed to save attendance: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status) => {
    const newAttendance = {};
    students.forEach(student => { newAttendance[student._id] = status; });
    setAttendance(prev => ({ ...prev, ...newAttendance }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":    return "badge bg-success";
      case "absent":     return "badge bg-danger";
      case "late":       return "badge bg-warning text-dark";
      case "excused":    return "badge bg-info";
      case "not_marked": return "badge bg-secondary";
      default:           return "badge bg-secondary";
    }
  };

  const stats = {
    total:      students.length,
    present:    students.filter(s => attendance[s._id] === "present").length,
    absent:     students.filter(s => attendance[s._id] === "absent").length,
    late:       students.filter(s => attendance[s._id] === "late").length,
    excused:    students.filter(s => attendance[s._id] === "excused").length,
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
        <p className="text-muted mb-0">Mark daily attendance for a class</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-2"></i>{success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total",      value: stats.total,      color: "primary",   icon: "bi-people-fill" },
          { label: "Present",    value: stats.present,    color: "success",   icon: "bi-check-circle-fill" },
          { label: "Absent",     value: stats.absent,     color: "danger",    icon: "bi-x-circle-fill" },
          { label: "Late",       value: stats.late,       color: "warning",   icon: "bi-clock-fill" },
          { label: "Excused",    value: stats.excused,    color: "info",      icon: "bi-info-circle-fill" },
          { label: "Not Marked", value: stats.not_marked, color: "secondary", icon: "bi-question-circle-fill" },
        ].map(({ label, value, color, icon }) => (
          <div className="col-md-2" key={label}>
            <div className={`card text-center border-${color}`}>
              <div className="card-body">
                <i className={`bi ${icon} text-${color}`} style={{ fontSize: "2rem" }}></i>
                <h3 className="mt-2 mb-0">{value}</h3>
                <small className="text-muted">{label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Class</label>
              <select
                className="form-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {['1','2','3','4','5','6','7','8','9','10'].map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Section</label>
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
            <div className="col-md-3 d-flex gap-2">
              <button
                className="btn btn-success flex-fill"
                onClick={handleSaveAttendance}
                disabled={saving || loading}
              >
                {saving ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                ) : (
                  <><i className="bi bi-save me-2"></i>Save</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Class {selectedClass}-{selectedSection} &nbsp;
            <span className="text-muted fw-normal" style={{ fontSize: '0.9rem' }}>
              {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </h5>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-success btn-sm" onClick={() => markAll("present")}>
              <i className="bi bi-check-all me-1"></i>All Present
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={() => markAll("absent")}>
              <i className="bi bi-x-circle me-1"></i>All Absent
            </button>
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
                  <th>Mark Attendance</th>
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
                      <td className="align-middle"><strong>{student.rollNumber}</strong></td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ width: "35px", height: "35px", fontSize: "14px", flexShrink: 0 }}
                          >
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </div>
                          {student.fullName}
                        </div>
                      </td>
                      <td className="align-middle">
                        <span className={getStatusBadge(attendance[student._id])}>
                          {(attendance[student._id] || 'not_marked').toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="align-middle">
                        <div className="btn-group btn-group-sm">
                          <button
                            className={`btn ${attendance[student._id] === "present" ? "btn-success" : "btn-outline-success"}`}
                            onClick={() => handleStatusChange(student._id, "present")}
                            title="Present"
                          >
                            <i className="bi bi-check-circle"></i> Present
                          </button>
                          <button
                            className={`btn ${attendance[student._id] === "absent" ? "btn-danger" : "btn-outline-danger"}`}
                            onClick={() => handleStatusChange(student._id, "absent")}
                            title="Absent"
                          >
                            <i className="bi bi-x-circle"></i> Absent
                          </button>
                          <button
                            className={`btn ${attendance[student._id] === "late" ? "btn-warning" : "btn-outline-warning"}`}
                            onClick={() => handleStatusChange(student._id, "late")}
                            title="Late"
                          >
                            <i className="bi bi-clock"></i> Late
                          </button>
                          <button
                            className={`btn ${attendance[student._id] === "excused" ? "btn-info" : "btn-outline-info"}`}
                            onClick={() => handleStatusChange(student._id, "excused")}
                            title="Excused"
                          >
                            <i className="bi bi-info-circle"></i> Excused
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      <i className="bi bi-inbox" style={{ fontSize: "2rem" }}></i>
                      <p className="mb-0 mt-2">No students found in Class {selectedClass}-{selectedSection}</p>
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
