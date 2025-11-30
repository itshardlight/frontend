const ParentDashboard = () => {
  return (
    <>
      {/* Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <i className="bi bi-person-badge" style={{ fontSize: "2rem", color: "#0d6efd" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">My Children</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="bi bi-calendar-check" style={{ fontSize: "2rem", color: "#198754" }}></i>
              <h3 className="mt-2 mb-0">0%</h3>
              <small className="text-muted">Avg Attendance</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="bi bi-cash-coin" style={{ fontSize: "2rem", color: "#ffc107" }}></i>
              <h3 className="mt-2 mb-0">Rs. 0</h3>
              <small className="text-muted">Pending Fees</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <i className="bi bi-envelope" style={{ fontSize: "2rem", color: "#0dcaf0" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">Unread Messages</small>
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
                <i className="bi bi-people me-2 text-primary"></i>
                My Children
              </h5>
              <p className="text-muted small">View children's profiles</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Student profiles</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Class information</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Contact details</li>
              </ul>
              <button className="btn btn-primary btn-sm w-100 mt-2">View Children</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-calendar-check me-2 text-success"></i>
                Child's Attendance
              </h5>
              <p className="text-muted small">Track attendance records</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Daily attendance</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Monthly reports</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Absence reasons</li>
              </ul>
              <button className="btn btn-success btn-sm w-100 mt-2">View Attendance</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-graph-up me-2 text-info"></i>
                Grades & Report Card
              </h5>
              <p className="text-muted small">View academic performance</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Subject grades</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Test scores</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Download reports</li>
              </ul>
              <button className="btn btn-info btn-sm w-100 mt-2">View Grades</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-cash-stack me-2 text-warning"></i>
                Fee Status
              </h5>
              <p className="text-muted small">View and pay school fees</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Fee structure</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Payment history</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Pay online</li>
              </ul>
              <button className="btn btn-warning btn-sm w-100 mt-2">View Fees</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-megaphone me-2 text-danger"></i>
                Notices from School
              </h5>
              <p className="text-muted small">Important announcements</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>School notices</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Event updates</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Holiday alerts</li>
              </ul>
              <button className="btn btn-danger btn-sm w-100 mt-2">View Notices</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-chat-square-text me-2 text-secondary"></i>
                Teacher Remarks
              </h5>
              <p className="text-muted small">Feedback from teachers</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Behavior remarks</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Academic feedback</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Progress notes</li>
              </ul>
              <button className="btn btn-secondary btn-sm w-100 mt-2">View Remarks</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clock-history me-2" style={{ color: "#6f42c1" }}></i>
                Child's Timetable
              </h5>
              <p className="text-muted small">View class schedule</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Weekly schedule</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Class timings</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Subject teachers</li>
              </ul>
              <button className="btn btn-sm w-100 mt-2" style={{ backgroundColor: "#6f42c1", color: "white" }}>View Timetable</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-calendar-event me-2 text-primary"></i>
                Announcements
              </h5>
              <p className="text-muted small">Events, exams, and holidays</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Exam schedules</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>School events</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Holiday calendar</li>
              </ul>
              <button className="btn btn-primary btn-sm w-100 mt-2">View Calendar</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-chat-dots me-2 text-success"></i>
                Contact Teachers/Admin
              </h5>
              <p className="text-muted small">Communicate with school</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Message teachers</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Contact admin</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>View responses</li>
              </ul>
              <button className="btn btn-success btn-sm w-100 mt-2">Open Messages</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParentDashboard;
