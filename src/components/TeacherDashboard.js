const TeacherDashboard = () => {
  return (
    <>
      {/* Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <i className="bi bi-people-fill" style={{ fontSize: "2rem", color: "#0d6efd" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">My Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="bi bi-book" style={{ fontSize: "2rem", color: "#198754" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">My Classes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="bi bi-file-earmark-text" style={{ fontSize: "2rem", color: "#ffc107" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">Pending Assignments</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <i className="bi bi-calendar-check" style={{ fontSize: "2rem", color: "#0dcaf0" }}></i>
              <h3 className="mt-2 mb-0">0%</h3>
              <small className="text-muted">Today's Attendance</small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-book-half me-2 text-primary"></i>
                My Classes & Subjects
              </h5>
              <p className="text-muted small">View and manage assigned classes</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Class schedules</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Subject details</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Student lists</li>
              </ul>
              <button className="btn btn-primary btn-sm w-100 mt-2">View Classes</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clipboard-check me-2 text-success"></i>
                Attendance Marking
              </h5>
              <p className="text-muted small">Mark and track student attendance</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Daily attendance</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Attendance reports</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Absentee tracking</li>
              </ul>
              <button className="btn btn-success btn-sm w-100 mt-2">Mark Attendance</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-people me-2 text-info"></i>
                Student Profiles
              </h5>
              <p className="text-muted small">View assigned student details</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Student information</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Academic records</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Contact details</li>
              </ul>
              <button className="btn btn-info btn-sm w-100 mt-2">View Students</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-journal-text me-2 text-warning"></i>
                Student Results Management
              </h5>
              <p className="text-muted small">Enter and manage student grades</p>
              <div className="small mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Pending Grades:</span>
                  <span className="badge bg-warning text-dark">5</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Recent Uploads:</span>
                  <span className="badge bg-success">12</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Class Average:</span>
                  <span className="badge bg-info">78.5%</span>
                </div>
              </div>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Test scores</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Assignment marks</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Final grades</li>
              </ul>
              <button className="btn btn-warning btn-sm w-100 mt-2">Upload Results</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-file-earmark-plus me-2 text-danger"></i>
                Assignments & Homework
              </h5>
              <p className="text-muted small">Create and manage assignments</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Create assignments</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Set deadlines</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Review submissions</li>
              </ul>
              <button className="btn btn-danger btn-sm w-100 mt-2">Manage Assignments</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clock-history me-2 text-secondary"></i>
                Class Timetable
              </h5>
              <p className="text-muted small">View your teaching schedule</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Weekly schedule</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Class timings</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Room assignments</li>
              </ul>
              <button className="btn btn-secondary btn-sm w-100 mt-2">View Timetable</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-megaphone me-2" style={{ color: "#6f42c1" }}></i>
                Notices from Admin
              </h5>
              <p className="text-muted small">View school announcements</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Important notices</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Events & meetings</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Policy updates</li>
              </ul>
              <button className="btn btn-sm w-100 mt-2" style={{ backgroundColor: "#6f42c1", color: "white" }}>View Notices</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-chat-dots me-2 text-primary"></i>
                Communication
              </h5>
              <p className="text-muted small">Message students and parents</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Send messages</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Parent communication</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Student queries</li>
              </ul>
              <button className="btn btn-primary btn-sm w-100 mt-2">Open Messages</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;
