
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TeacherSidebar from "../components/TeacherSidebar";

function TeacherDashboard() {
  const [consentForms, setConsentForms] = useState([]);
  const [responses, setResponses] = useState([]);

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "null"
  );

  const teacherName = loggedInUser?.fullName || "Teacher";
  const firstName = teacherName.split(" ")[0];

  const initials = teacherName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const savedForms = JSON.parse(
      localStorage.getItem("teacherConsentForms") || "[]"
    );

    const savedResponses = JSON.parse(
      localStorage.getItem("parentConsentResponses") || "[]"
    );

    setConsentForms(savedForms);
    setResponses(savedResponses);
  }, []);

  const totalForms = consentForms.length;

  const totalApproved = responses.filter(
    (response) => response.decision === "Agree"
  ).length;

  const totalDeclined = responses.filter(
    (response) => response.decision === "Disagree"
  ).length;

  const totalPending = Math.max(
    consentForms.reduce((sum, form) => {
      const formResponses = responses.filter(
        (response) => String(response.formId) === String(form.id)
      );

      return sum + Math.max(0, 1 - formResponses.length);
    }, 0),
    0
  );

  const formStatistics = consentForms.map((form) => {
    const formResponses = responses.filter(
      (response) => String(response.formId) === String(form.id)
    );

    const approved = formResponses.filter(
      (response) => response.decision === "Agree"
    ).length;

    const declined = formResponses.filter(
      (response) => response.decision === "Disagree"
    ).length;

    const pending = Math.max(0, 1 - formResponses.length);

    return {
      ...form,
      approved,
      declined,
      pending,
    };
  });

  return (
    <div className="parent-layout">
      <TeacherSidebar />

      <main className="parent-main teacher-dashboard-redesign">

        {/* HEADER */}
        <header className="dashboard-header teacher-new-header">
          <div>
            <span className="teacher-page-label">FACULTY PORTAL</span>
            <h1>Dashboard</h1>
            <p>Manage consent forms and monitor parent responses.</p>
          </div>

          <div className="parent-profile">
            <div className="profile-avatar">
              {initials || "T"}
            </div>

            <div>
              <h4>{teacherName}</h4>
              <span>Faculty Account</span>
            </div>
          </div>
        </header>

        {/* WELCOME BANNER */}
        <section className="teacher-welcome-banner">
          <div className="teacher-welcome-content">
            <span className="teacher-welcome-label">
              UNIVERSITY OF THE ASSUMPTION
            </span>

            <h2>Welcome, {firstName}!</h2>

            <p>
              Your faculty workspace is ready. Create digital
              consent forms, review parent submissions, and
              monitor responses to your school activities.
            </p>

            <Link
              to="/teacher-create-form"
              className="teacher-welcome-button"
            >
              + Create Consent Form
            </Link>
          </div>

          <div className="teacher-welcome-decoration" aria-hidden="true">
            <div className="teacher-welcome-seal">UA</div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="teacher-stat-section">
          <div className="teacher-section-title">
            <h2>Response Overview</h2>
            <p>A summary of your consent form activities.</p>
          </div>

          <div className="summary-grid teacher-new-summary-grid">

            <div className="summary-card teacher-stat-card">
              <div className="teacher-stat-icon teacher-forms-icon">
                📄
              </div>
              <div>
                <h3>{totalForms}</h3>
                <p>Total Forms</p>
                <span>Published activities</span>
              </div>
            </div>

            <div className="summary-card teacher-stat-card">
              <div className="teacher-stat-icon teacher-approved-icon">
                ✓
              </div>
              <div>
                <h3>{totalApproved}</h3>
                <p>Agreed Responses</p>
                <span>Parent consent received</span>
              </div>
            </div>

            <div className="summary-card teacher-stat-card">
              <div className="teacher-stat-icon teacher-pending-icon">
                ⏳
              </div>
              <div>
                <h3>{totalPending}</h3>
                <p>Pending Responses</p>
                <span>Awaiting response</span>
              </div>
            </div>

            <div className="summary-card teacher-stat-card">
              <div className="teacher-stat-icon teacher-declined-icon">
                ✕
              </div>
              <div>
                <h3>{totalDeclined}</h3>
                <p>Disagreed Responses</p>
                <span>Responses received</span>
              </div>
            </div>

          </div>
        </section>

        {/* FORM MANAGEMENT */}
        <section className="teacher-create-section">
          <div className="teacher-create-icon">✎</div>

          <div className="teacher-create-text">
            <h2>Consent Form Management</h2>
            <p>
              Prepare and publish digital consent forms
              for parents and guardians.
            </p>
          </div>

          <Link
            to="/teacher-create-form"
            className="teacher-create-button"
          >
            Create New Form
            <span>→</span>
          </Link>
        </section>

        {/* RECENT FORMS */}
        <section className="content-card teacher-new-card">
          <div className="section-heading">
            <div>
              <span className="teacher-card-eyebrow">
                ACTIVITY MANAGEMENT
              </span>

              <h2>Recent Consent Forms</h2>

              <p>
                Monitor parent responses for your published activities.
              </p>
            </div>

            <span className="total-label">
              {totalForms} Forms
            </span>
          </div>

          {formStatistics.length > 0 ? (
            <div className="table-container">
              <table className="teacher-consent-table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Class</th>
                    <th>Activity Date</th>
                    <th>Agreed</th>
                    <th>Disagreed</th>
                    <th>Pending</th>
                  </tr>
                </thead>

                <tbody>
                  {formStatistics.map((form) => (
                    <tr key={form.id}>
                      <td>
                        <strong>{form.title}</strong>
                      </td>

                      <td>{form.className || "—"}</td>

                      <td>{form.activityDate || "—"}</td>

                      <td>
                        <span className="teacher-table-number teacher-number-approved">
                          {form.approved}
                        </span>
                      </td>

                      <td>
                        <span className="teacher-table-number teacher-number-declined">
                          {form.declined}
                        </span>
                      </td>

                      <td>
                        <span className="teacher-table-number teacher-number-pending">
                          {form.pending}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="teacher-empty-state">
              <div>📄</div>
              <h3>No Consent Forms Yet</h3>
              <p>
                You haven't published any consent forms.
                Create your first form to get started.
              </p>

              <Link
                to="/teacher-create-form"
                className="teacher-empty-button"
              >
                Create Your First Form
              </Link>
            </div>
          )}
        </section>

        <footer className="teacher-dashboard-footer">
          University of the Assumption · E-ParentConsent Portal
        </footer>

      </main>
    </div>
  );
}

export default TeacherDashboard;
