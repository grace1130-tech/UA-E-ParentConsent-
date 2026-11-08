
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

  const totalResponses = responses.length;

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
        <div className="teacher-responses-header">
          <div>
            <h1>Parent Responses</h1>
            <p>View and manage submitted parent consent responses.</p>
          </div>

          <button
            className="teacher-responses-refresh"
            onClick={loadResponses}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        <div className="teacher-responses-stats">
          <div className="teacher-responses-stat-card">
            <span>Total Responses</span>
            <h2>{totalResponses}</h2>
          </div>

          <div className="teacher-responses-stat-card">
            <span>Agreed</span>
            <h2>{agreedCount}</h2>
          </div>

          <div className="teacher-responses-stat-card">
            <span>Disagreed</span>
            <h2>{disagreedCount}</h2>
          </div>
        </div>

        <div className="teacher-responses-content">
          <div className="teacher-responses-toolbar">
            <input
              type="text"
              placeholder="Search parent or activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Responses</option>
              <option value="Agree">Agreed</option>
              <option value="Disagree">Disagreed</option>
            </select>
          </div>

          {loading ? (
            <div className="teacher-responses-message">
              Loading responses...
            </div>
          ) : error ? (
            <div className="teacher-responses-error">
              <h3>Unable to Load Responses</h3>
              <p>{error}</p>
              <button onClick={loadResponses}>Try Again</button>
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="teacher-responses-empty">
              <h3>No Responses Found</h3>
              <p>
                Parent consent responses will appear here after submission.
              </p>
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
                      <td>{response.parentName}</td>
                      <td>{response.formTitle}</td>
                      <td>{response.className}</td>
                      <td>
                        <span
                          className={`teacher-responses-status ${
                            response.decision?.toLowerCase() === "agree"
                              ? "agreed"
                              : "disagreed"
                          }`}
                        >
                          {response.decision}
                        </span>
                      </td>
                      <td>{formatDate(response.submittedAt)}</td>
                      <td>
                        <Link
                          to={`/teacher-response/${response.id}`}
                          className="teacher-responses-view"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TeacherResponses;
