
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { apiRequest } from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    parents: 0,
    teachers: 0,
    admins: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalForms: 0,
    totalResponses: 0,
    agreed: 0,
    disagreed: 0,
  });

  const [consentMonitoring, setConsentMonitoring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setError("");

        const [users, consentStats, monitoring] = await Promise.all([
          apiRequest("/admin/users"),
          apiRequest("/admin/consent-statistics"),
          apiRequest("/admin/consent-monitoring"),
        ]);

        setStats({
          totalUsers: users.length,
          parents: users.filter(
            (u) => u.role?.toLowerCase() === "parent"
          ).length,
          teachers: users.filter(
            (u) => u.role?.toLowerCase() === "teacher"
          ).length,
          admins: users.filter(
            (u) => u.role?.toLowerCase() === "admin"
          ).length,
          activeUsers: users.filter(
            (u) => u.status?.toLowerCase() === "active"
          ).length,
          inactiveUsers: users.filter(
            (u) => u.status?.toLowerCase() === "inactive"
          ).length,
          totalForms: consentStats.totalForms ?? 0,
          totalResponses: consentStats.totalResponses ?? 0,
          agreed: consentStats.agreed ?? 0,
          disagreed: consentStats.disagreed ?? 0,
        });

        setConsentMonitoring(monitoring);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError(
          err.message || "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  const userCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      type: "users",
      description: "All registered accounts",
    },
    {
      title: "Parents",
      value: stats.parents,
      icon: "👨‍👩‍👧",
      type: "parents",
      description: "Parent and guardian accounts",
    },
    {
      title: "Teachers",
      value: stats.teachers,
      icon: "🎓",
      type: "teachers",
      description: "Faculty accounts",
    },
    {
      title: "Administrators",
      value: stats.admins,
      icon: "🛡️",
      type: "admins",
      description: "System administrators",
    },
  ];

  const recordCards = [
    {
      title: "Consent Forms",
      value: stats.totalForms,
      icon: "📄",
      type: "forms",
      description: "Published activities",
    },
    {
      title: "Submitted Responses",
      value: stats.totalResponses,
      icon: "📨",
      type: "responses",
      description: "Parent submissions",
    },
    {
      title: "Agreed",
      value: stats.agreed,
      icon: "✓",
      type: "agreed",
      description: "Consent granted",
    },
    {
      title: "Disagreed",
      value: stats.disagreed,
      icon: "✕",
      type: "disagreed",
      description: "Consent not granted",
    },
  ];

  return (
    <>
      <AdminSidebar />

      <main className="admin-dashboard-redesign">
        <header className="admin-dashboard-header">
          <div>
            <span className="admin-eyebrow">
              UNIVERSITY OF THE ASSUMPTION
            </span>
            <h1>Admin Dashboard</h1>
            <p>
              Monitor system activities, user accounts, and consent records.
            </p>
          </div>

          <div className="admin-header-profile">
            <div className="admin-profile-icon">A</div>
            <div>
              <h4>Administrator</h4>
              <span>System Management</span>
            </div>
          </div>
        </header>

        <section className="admin-welcome-banner">
          <div className="admin-welcome-content">
            <span>ADMINISTRATION PORTAL</span>
            <h2>System Overview</h2>
            <p>
              Welcome to the E-ParentConsent administration workspace.
              Manage user accounts and monitor the system's consent records
              from one place.
            </p>
          </div>

          <div className="admin-welcome-decoration" aria-hidden="true">
            <div className="admin-welcome-seal">UA</div>
          </div>
        </section>

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <div>
              <h2>User Management Overview</h2>
              <p>Summary of registered system accounts.</p>
            </div>
          </div>

          <div className="admin-stat-grid">
            {userCards.map((card) => (
              <div className="admin-stat-card" key={card.type}>
                <div className={`admin-stat-icon ${card.type}`}>
                  {card.icon}
                </div>

                <div className="admin-stat-info">
                  <h3>{loading ? "..." : card.value}</h3>
                  <p>{card.title}</p>
                  <span>{card.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <div>
              <h2>Account Status</h2>
              <p>Current status of registered accounts.</p>
            </div>
          </div>

          <div className="admin-status-grid">
            <div className="admin-status-card">
              <div className="admin-status-icon active">✓</div>
              <div>
                <span>Active Accounts</span>
                <h3>{loading ? "..." : stats.activeUsers}</h3>
                <p>Accounts currently active</p>
              </div>
            </div>

            <div className="admin-status-card">
              <div className="admin-status-icon inactive">✕</div>
              <div>
                <span>Inactive Accounts</span>
                <h3>{loading ? "..." : stats.inactiveUsers}</h3>
                <p>Accounts currently disabled</p>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <div>
              <h2>Consent Records</h2>
              <p>Overview of published forms and parent submissions.</p>
            </div>
          </div>

          <div className="admin-stat-grid">
            {recordCards.map((card) => (
              <div className="admin-stat-card" key={card.type}>
                <div className={`admin-stat-icon ${card.type}`}>
                  {card.icon}
                </div>

                <div className="admin-stat-info">
                  <h3>{loading ? "..." : card.value}</h3>
                  <p>{card.title}</p>
                  <span>{card.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Individual Consent Form Monitoring */}
        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <div>
              <h2>Consent Form Monitoring</h2>
              <p>
                Track parent responses for every published consent form.
              </p>
            </div>
          </div>

          {loading ? (
            <p>Loading consent monitoring records...</p>
          ) : consentMonitoring.length === 0 ? (
            <p>No consent forms have been published yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-monitoring-table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Class</th>
                    <th>Teacher</th>
                    <th>Activity Date</th>
                    <th>Deadline</th>
                    <th>Submitted</th>
                    <th>Agreed</th>
                    <th>Disagreed</th>
                    <th>Pending</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {consentMonitoring.map((form) => (
                    <tr key={form.formId}>
                      <td>{form.title}</td>
                      <td>{form.className}</td>
                      <td>{form.teacherName}</td>
                      <td>{form.activityDate}</td>
                      <td>{form.deadline}</td>
                      <td>{form.totalResponses}</td>
                      <td>{form.agreed}</td>
                      <td>{form.disagreed}</td>
                      <td>{form.pending}</td>
                      <td>{form.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p style={{ fontSize: "12px", marginTop: "12px" }}>
            Note: Pending currently uses all registered parent accounts as
            the expected respondents. It is an estimate until parent-to-class
            and form assignment records are implemented.
          </p>
        </section>

        <section className="admin-management-panel">
          <div className="admin-management-icon">👥</div>

          <div className="admin-management-content">
            <span>ACCOUNT ADMINISTRATION</span>
            <h2>Manage User Accounts</h2>
            <p>
              Create teacher and administrator accounts, search registered
              users, and activate or deactivate accounts.
            </p>
          </div>

          <Link to="/admin-users" className="admin-management-button">
            Manage Users
            <span>→</span>
          </Link>
        </section>

        <footer className="admin-dashboard-footer">
          University of the Assumption · E-ParentConsent Portal
        </footer>
      </main>
    </>
  );
}

export default AdminDashboard;
