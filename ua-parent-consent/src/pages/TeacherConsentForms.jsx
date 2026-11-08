
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TeacherSidebar from "../components/TeacherSidebar";
import { apiRequest } from "../services/api";

function TeacherConsentForms() {
  const [forms, setForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/teacher/consent-forms");

        setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load consent forms.");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const publishedCount = forms.filter(
    (form) => form.status === "Published"
  ).length;

  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      const matchesSearch =
        form.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.className?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || form.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [forms, searchTerm, statusFilter]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="parent-layout">
      <TeacherSidebar />

      <main className="parent-main teacher-forms-page">
        <header className="dashboard-header teacher-forms-header">
          <div>
            <span className="teacher-forms-eyebrow">
              TEACHER WORKSPACE
            </span>
            <h1>My Consent Forms</h1>
            <p>
              View, organize, and monitor your published digital consent forms.
            </p>
          </div>

          <Link to="/teacher-create-form" className="teacher-forms-create">
            <span>+</span> Create New Form
          </Link>
        </header>

        <section className="teacher-forms-summary">
          <div className="teacher-forms-summary-icon">▤</div>
          <div>
            <span>Total Consent Forms</span>
            <h2>{forms.length}</h2>
            <p>{publishedCount} currently published</p>
          </div>
          <div className="teacher-forms-summary-decoration">UA</div>
        </section>

        <section className="content-card teacher-forms-card">
          <div className="teacher-forms-card-heading">
            <div>
              <h2>Published Forms</h2>
              <p>All consent forms you have created.</p>
            </div>

            <span className="teacher-forms-count">
              {filteredForms.length} of {forms.length} Forms
            </span>
          </div>

          <div className="teacher-forms-toolbar">
            <div className="teacher-forms-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search by form title or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="teacher-forms-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {loading ? (
            <div className="teacher-forms-empty">
              <h3>Loading Consent Forms...</h3>
              <p>Please wait while we retrieve your forms.</p>
            </div>
          ) : error ? (
            <div className="teacher-forms-empty">
              <h3>Unable to Load Forms</h3>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : forms.length === 0 ? (
            <div className="teacher-forms-empty">
              <div className="teacher-forms-empty-icon">▤</div>
              <h3>No Consent Forms Yet</h3>
              <p>
                You haven't published any consent forms. Create your first
                form to get started.
              </p>
              <Link to="/teacher-create-form" className="teacher-forms-create">
                + Create Your First Form
              </Link>
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="teacher-forms-no-results">
              <h3>No Matching Forms</h3>
              <p>Try changing your search or status filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="teacher-forms-table-wrapper">
              <table className="teacher-forms-table">
                <thead>
                  <tr>
                    <th>FORM TITLE</th>
                    <th>CLASS / SECTION</th>
                    <th>ACTIVITY DATE</th>
                    <th>DEADLINE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredForms.map((form) => (
                    <tr key={form.id}>
                      <td>
                        <div className="teacher-forms-title-cell">
                          <div className="teacher-forms-file-icon">▤</div>
                          <div>
                            <strong>{form.title}</strong>
                            <span>
                              Created{" "}
                              {form.createdAt
                                ? new Date(form.createdAt).toLocaleDateString(
                                    "en-PH"
                                  )
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="teacher-forms-class">
                          {form.className || "—"}
                        </span>
                      </td>

                      <td>{formatDate(form.activityDate)}</td>

                      <td>{formatDate(form.deadline)}</td>

                      <td>
                        <span
                          className={`teacher-forms-status ${
                            form.status === "Published"
                              ? "published"
                              : "draft"
                          }`}
                        >
                          <span className="teacher-forms-status-dot"></span>
                          {form.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="teacher-forms-footer">
          University of the Assumption · Digital Parent Consent System
        </p>
      </main>
    </div>
  );
}

export default TeacherConsentForms;
