
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TeacherSidebar from "../components/TeacherSidebar";
import { apiRequest } from "../services/api";

function TeacherResponses() {
  const [responses, setResponses] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/teacher/consent-responses");
      setResponses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load responses.");
    } finally {
      setLoading(false);
    }
  };

  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        (response.parentName || "").toLowerCase().includes(searchValue) ||
        (response.formTitle || "").toLowerCase().includes(searchValue) ||
        (response.className || "").toLowerCase().includes(searchValue);

      const matchesFilter =
        filter === "All" ||
        response.decision?.toLowerCase() === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [responses, search, filter]);

  const agreedCount = responses.filter(
    (response) => response.decision?.toLowerCase() === "agree"
  ).length;

  const disagreedCount = responses.filter(
    (response) => response.decision?.toLowerCase() === "disagree"
  ).length;

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="teacher-responses-layout">
      <TeacherSidebar />

      <main className="teacher-responses-main">
        {/* Page Header */}
        <div className="teacher-responses-header">
          <div>
            <span className="teacher-responses-eyebrow">
              CONSENT MANAGEMENT
            </span>

            <h1>Parent Responses</h1>

            <p>
              View and manage submitted parent consent responses.
            </p>
          </div>

          <button
            className="teacher-responses-refresh"
            onClick={loadResponses}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="teacher-responses-stats">
          <div className="teacher-responses-stat-card">
            <div className="teacher-responses-stat-icon navy">
              TR
            </div>

            <div>
              <p>Total Responses</p>
              <h2>{responses.length}</h2>
            </div>
          </div>

          <div className="teacher-responses-stat-card">
            <div className="teacher-responses-stat-icon green">
              ✓
            </div>

            <div>
              <p>Agreed</p>
              <h2>{agreedCount}</h2>
            </div>
          </div>

          <div className="teacher-responses-stat-card">
            <div className="teacher-responses-stat-icon red">
              ✕
            </div>

            <div>
              <p>Disagreed</p>
              <h2>{disagreedCount}</h2>
            </div>
          </div>
        </div>

        {/* Main Responses Card */}
        <section className="teacher-responses-card">
          <div className="teacher-responses-card-heading">
            <div>
              <h2>Submitted Responses</h2>
              <p>
                Review the decisions submitted by parents or guardians.
              </p>
            </div>

            <span className="teacher-responses-count">
              {filteredResponses.length} Responses
            </span>
          </div>

          {/* Search and Filter */}
          <div className="teacher-responses-toolbar">
            <div className="teacher-responses-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search parent or activity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="teacher-responses-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Responses</option>
              <option value="Agree">Agreed</option>
              <option value="Disagree">Disagreed</option>
            </select>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="teacher-responses-empty">
              <h3>Loading Responses...</h3>
              <p>Please wait while we retrieve the submitted responses.</p>
            </div>
          ) : error ? (
            <div className="teacher-responses-empty">
              <h3>Unable to Load Responses</h3>
              <p>{error}</p>

              <button
                className="teacher-responses-reset"
                onClick={loadResponses}
              >
                Try Again
              </button>
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="teacher-responses-empty">
              <div className="teacher-responses-empty-icon">
                !
              </div>

              <h3>No Responses Found</h3>

              <p>
                {search || filter !== "All"
                  ? "Try changing your search or filter to find responses."
                  : "Parent consent responses will appear here after submission."}
              </p>

              {(search || filter !== "All") && (
                <button
                  className="teacher-responses-reset"
                  onClick={() => {
                    setSearch("");
                    setFilter("All");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="teacher-responses-table-wrapper">
              <table className="teacher-responses-table">
                <thead>
                  <tr>
                    <th>Parent Name</th>
                    <th>Activity</th>
                    <th>Class</th>
                    <th>Decision</th>
                    <th>Date Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredResponses.map((response) => (
                    <tr key={response.id}>
                      <td>{response.parentName || "N/A"}</td>

                      <td className="teacher-responses-activity">
                        {response.formTitle || "N/A"}
                      </td>

                      <td>{response.className || "N/A"}</td>

                      <td>
                        <span
                          className={`teacher-responses-decision ${
                            response.decision?.toLowerCase() === "agree"
                              ? "agree"
                              : "disagree"
                          }`}
                        >
                          {response.decision || "N/A"}
                        </span>
                      </td>

                      <td className="teacher-responses-date">
                        {formatDate(response.submittedAt)}
                      </td>

                      <td>
                        <Link
                          to={`/teacher-response/${response.id}`}
                          className="teacher-responses-view"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="teacher-responses-footer">
          University of the Assumption · E-ParentConsent System
        </footer>
      </main>
    </div>
  );
}

export default TeacherResponses;
