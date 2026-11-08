
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiRequest } from "../services/api";

function ParentDashboard() {
  const [consentForms, setConsentForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "null"
  );

  const parentName = loggedInUser?.fullName || "Parent / Guardian";
  const firstName = parentName.split(" ")[0];

  const initials = parentName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Load consent forms and submitted responses from PostgreSQL
  useEffect(() => {
    let active = true;

    const fetchConsentForms = async () => {
      try {
        setLoading(true);
        setError("");

        const [formsData, responsesData] = await Promise.all([
          apiRequest("/parent/consent-forms"),
          apiRequest("/parent/consent-responses"),
        ]);

        const forms = Array.isArray(formsData) ? formsData : [];
        const responses = Array.isArray(responsesData)
          ? responsesData
          : [];

        const updatedForms = forms.map((form) => {
          const response = responses.find(
            (item) => String(item.formId) === String(form.id)
          );

          return {
            ...form,
            status: response
              ? `Submitted - ${response.decision}`
              : "Pending",
          };
        });

        if (active) {
          setConsentForms(updatedForms);
        }
      } catch (err) {
        console.error("Parent dashboard loading error:", err);

        if (active) {
          setError(err.message || "Unable to load consent forms.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchConsentForms();

    return () => {
      active = false;
    };
  }, []);

  // Summary statistics
  const pendingCount = consentForms.filter(
    (form) => form.status === "Pending"
  ).length;

  const approvedCount = consentForms.filter(
    (form) => form.status === "Submitted - Agree"
  ).length;

  const declinedCount = consentForms.filter(
    (form) => form.status === "Submitted - Disagree"
  ).length;

  // Status styling
  const getStatusClass = (status) => {
    if (status === "Pending") return "parent-status-pending";
    if (status === "Submitted - Agree") return "parent-status-approved";
    if (status === "Submitted - Disagree") return "parent-status-declined";
    return "";
  };

  // Format dates
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="parent-layout">
      <Sidebar />

      <main className="parent-main parent-dashboard-redesign">

        {/* PAGE HEADER */}
        <header className="dashboard-header parent-new-header">
          <div>
            <span className="parent-page-label">PARENT PORTAL</span>
            <h1>Dashboard</h1>
            <p>
              Manage consent forms and stay connected with school activities.
            </p>
          </div>

          <div className="parent-profile">
            <div className="profile-avatar">{initials || "P"}</div>
            <div>
              <h4>{parentName}</h4>
              <span>Parent / Guardian</span>
            </div>
          </div>
        </header>

        {/* WELCOME BANNER */}
        <section className="parent-welcome-banner">
          <div className="parent-welcome-content">
            <span className="parent-welcome-label">
              UNIVERSITY OF THE ASSUMPTION
            </span>

            <h2>Welcome, {firstName}!</h2>

            <p>
              Your parent portal is ready. Review consent forms,
              submit your responses, and stay updated on upcoming
              university activities.
            </p>
          </div>

          <div className="parent-welcome-decoration" aria-hidden="true">
            <div className="parent-welcome-seal">UA</div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="parent-summary-section">
          <div className="parent-section-title">
            <div>
              <h2>Consent Overview</h2>
              <p>A quick summary of your consent form activity.</p>
            </div>
          </div>

          <div className="summary-grid parent-summary-grid">

            <div className="summary-card parent-stat-card">
              <div className="parent-stat-icon pending-icon">📄</div>
              <div>
                <h3>{pendingCount}</h3>
                <p>Pending Forms</p>
                <span>Awaiting your response</span>
              </div>
            </div>

            <div className="summary-card parent-stat-card">
              <div className="parent-stat-icon approved-icon">✓</div>
              <div>
                <h3>{approvedCount}</h3>
                <p>Agreed Forms</p>
                <span>Consent submitted</span>
              </div>
            </div>

            <div className="summary-card parent-stat-card">
              <div className="parent-stat-icon declined-icon">✕</div>
              <div>
                <h3>{declinedCount}</h3>
                <p>Disagreed Forms</p>
                <span>Response submitted</span>
              </div>
            </div>

          </div>
        </section>

        {/* CONSENT FORMS */}
        <section className="content-card parent-new-card">
          <div className="section-heading">
            <div>
              <span className="parent-card-eyebrow">YOUR ACTIVITIES</span>
              <h2>My Consent Forms</h2>
              <p>
                Review the consent forms published by your child's teacher.
              </p>
            </div>

            <span className="total-label">
              {consentForms.length} Forms
            </span>
          </div>

          {loading ? (
            <div className="parent-empty-state">
              <h3>Loading Consent Forms...</h3>
              <p>Please wait while we retrieve published forms.</p>
            </div>
          ) : error ? (
            <div className="parent-empty-state">
              <h3>Unable to Load Consent Forms</h3>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : consentForms.length > 0 ? (
            <div className="table-container">
              <table className="parent-consent-table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Class</th>
                    <th>Activity Date</th>
                    <th>Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {consentForms.map((form) => (
                    <tr key={form.id}>
                      <td>
                        <strong>{form.title}</strong>
                      </td>
                      <td>{form.className || "—"}</td>
                      <td>{formatDate(form.activityDate)}</td>
                      <td>{formatDate(form.deadline)}</td>
                      <td>
                        <span
                          className={`parent-status-pill ${getStatusClass(form.status)}`}
                        >
                          {form.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="parent-empty-state">
              <div className="parent-empty-icon">📄</div>
              <h3>No Consent Forms Yet</h3>
              <p>
                There are currently no published consent forms.
                Please check again later.
              </p>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="parent-dashboard-footer">
          University of the Assumption · E-ParentConsent Portal
        </footer>

      </main>
    </div>
  );
}

export default ParentDashboard;
