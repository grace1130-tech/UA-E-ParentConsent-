
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { apiRequest } from "../services/api";
import jsPDF from "jspdf";

function ParentConsentForms() {
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load consent forms and parent responses from PostgreSQL
  useEffect(() => {
    let active = true;

    const loadForms = async () => {
      try {
        setLoading(true);
        setError("");

        const [publishedForms, savedResponses] = await Promise.all([
          apiRequest("/parent/consent-forms"),
          apiRequest("/parent/consent-responses"),
        ]);

        const updatedForms = publishedForms.map((form) => {
          const response = savedResponses.find(
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
          setForms(updatedForms);
          setResponses(savedResponses);
        }
      } catch (error) {
        console.error("Loading consent forms error:", error);

        if (active) {
          setError(error.message || "Unable to load consent forms.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadForms();

    return () => {
      active = false;
    };
  }, []);

  // Summary counts
  const pendingCount = forms.filter(
    (form) => form.status === "Pending"
  ).length;

  const submittedCount = forms.length - pendingCount;

  const agreedCount = forms.filter(
    (form) => form.status === "Submitted - Agree"
  ).length;

  // Search and status filtering
  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      const matchesSearch =
        form.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.className?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;

      if (statusFilter === "Pending") {
        matchesStatus = form.status === "Pending";
      } else if (statusFilter === "Agree") {
        matchesStatus = form.status === "Submitted - Agree";
      } else if (statusFilter === "Disagree") {
        matchesStatus = form.status === "Submitted - Disagree";
      }

      return matchesSearch && matchesStatus;
    });
  }, [forms, searchTerm, statusFilter]);

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

  // Generate consent PDF
  const generatePDF = (form, response) => {
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let y = 20;

    const addText = (text, fontSize = 11, bold = false) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(fontSize);

      const lines = pdf.splitTextToSize(
        String(text || ""),
        contentWidth
      );

      const lineHeight = fontSize * 0.45;

      if (y + lines.length * lineHeight > 275) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(lines, margin, y);
      y += lines.length * lineHeight + 4;
    };

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);

    pdf.text(
      "UNIVERSITY OF THE ASSUMPTION",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    y += 9;

    pdf.setFontSize(12);

    pdf.text(
      "PARENT / GUARDIAN DIGITAL CONSENT FORM",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    y += 10;

    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;

    addText("ACTIVITY DETAILS", 13, true);
    addText(`Activity Title: ${form.title}`, 11, true);
    addText(`Class / Section: ${form.className}`);
    addText(`Activity Date: ${formatDate(form.activityDate)}`);
    addText(`Location: ${form.location}`);
    addText(`Submission Deadline: ${formatDate(form.deadline)}`);

    y += 3;

    addText("ACTIVITY DESCRIPTION", 12, true);
    addText(form.description);

    addText("ADDITIONAL INSTRUCTIONS", 12, true);
    addText(form.instructions || "No additional instructions.");

    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;

    addText("PARENT / GUARDIAN CONSENT RESPONSE", 13, true);
    addText(`Printed Name: ${response.printedName}`);
    addText(`Consent Decision: ${response.decision}`);

    addText(
      `Date Submitted: ${new Date(
        response.submittedAt
      ).toLocaleString()}`
    );

    y += 5;

    addText("PARENT / GUARDIAN DIGITAL SIGNATURE", 12, true);

    if (response.signature) {
      if (y + 40 > 275) {
        pdf.addPage();
        y = 20;
      }

      pdf.addImage(
        response.signature,
        "PNG",
        margin,
        y,
        60,
        25
      );

      y += 32;
    } else {
      addText("No signature available.");
    }

    pdf.line(margin, y, pageWidth - margin, y);
    y += 8;

    addText(
      "This document records the consent response submitted through the UA E-ParentConsent System.",
      10
    );

    addText("University of the Assumption", 11, true);
    addText(`Reference Number: ${response.id}`, 10);

    return pdf;
  };

  // Preview PDF
  const previewPDF = (form, response) => {
    try {
      const pdf = generatePDF(form, response);
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);

      setPreviewURL((previousURL) => {
        if (previousURL) {
          URL.revokeObjectURL(previousURL);
        }

        return url;
      });
    } catch (error) {
      console.error("PDF preview error:", error);
      alert("Unable to preview PDF.");
    }
  };

  // Download PDF
  const downloadPDF = (form, response) => {
    try {
      const pdf = generatePDF(form, response);
      pdf.save(`UA-Consent-${response.id}.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Unable to download PDF.");
    }
  };

  // Close PDF preview
  const closePreview = () => {
    setPreviewURL((previousURL) => {
      if (previousURL) {
        URL.revokeObjectURL(previousURL);
      }

      return null;
    });
  };

  // Clean up PDF URL
  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  return (
    <div className="parent-layout">
      <Sidebar />

      <main className="parent-main parent-forms-page">
        <header className="dashboard-header parent-forms-header">
          <div>
            <span className="parent-forms-eyebrow">
              PARENT WORKSPACE
            </span>

            <h1>My Consent Forms</h1>

            <p>
              Review activity details and manage your consent submissions.
            </p>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="parent-forms-summary-grid">
          <div className="parent-forms-summary-card">
            <div className="parent-forms-summary-icon navy">▤</div>

            <div>
              <span>Total Forms</span>
              <h2>{forms.length}</h2>
              <p>Available consent forms</p>
            </div>
          </div>

          <div className="parent-forms-summary-card">
            <div className="parent-forms-summary-icon gold">◷</div>

            <div>
              <span>Pending</span>
              <h2>{pendingCount}</h2>
              <p>Awaiting your response</p>
            </div>
          </div>

          <div className="parent-forms-summary-card">
            <div className="parent-forms-summary-icon green">✓</div>

            <div>
              <span>Submitted</span>
              <h2>{submittedCount}</h2>
              <p>Forms with a response</p>
            </div>
          </div>
        </section>

        {/* Consent Forms Table */}
        <section className="content-card parent-forms-card">
          <div className="parent-forms-card-heading">
            <div>
              <h2>Published Consent Forms</h2>

              <p>
                Review each activity and check your submission status.
              </p>
            </div>

            <span className="parent-forms-count">
              {filteredForms.length} of {forms.length} Forms
            </span>
          </div>

          {/* Search and Filter */}
          <div className="parent-forms-toolbar">
            <div className="parent-forms-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search activity or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="parent-forms-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter consent forms by status"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Agree">Submitted - Agree</option>
              <option value="Disagree">Submitted - Disagree</option>
            </select>
          </div>

          {/* Loading and Error States */}
          {loading ? (
            <div className="parent-forms-empty">
              <h3>Loading Consent Forms...</h3>
              <p>Please wait while your forms are being retrieved.</p>
            </div>
          ) : error ? (
            <div className="parent-forms-empty">
              <h3>Unable to Load Consent Forms</h3>
              <p>{error}</p>

              <button
                type="button"
                className="parent-forms-clear"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : forms.length === 0 ? (
            <div className="parent-forms-empty">
              <div className="parent-forms-empty-icon">▤</div>

              <h3>No Consent Forms Available</h3>

              <p>
                There are currently no published consent forms.
                Please check again later.
              </p>
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="parent-forms-empty">
              <div className="parent-forms-empty-icon">⌕</div>

              <h3>No Matching Forms</h3>

              <p>
                Try another search term or change the status filter.
              </p>

              <button
                type="button"
                className="parent-forms-clear"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="parent-forms-table-wrapper">
              <table className="parent-forms-table">
                <thead>
                  <tr>
                    <th>ACTIVITY</th>
                    <th>CLASS</th>
                    <th>ACTIVITY DATE</th>
                    <th>DEADLINE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredForms.map((form) => {
                    const response = responses.find(
                      (item) =>
                        String(item.formId) === String(form.id)
                    );

                    return (
                      <tr key={form.id}>
                        <td>
                          <div className="parent-forms-title-cell">
                            <div className="parent-forms-file-icon">
                              ▤
                            </div>

                            <div>
                              <strong>{form.title}</strong>
                              <span>Digital Consent Form</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="parent-forms-class">
                            {form.className || "—"}
                          </span>
                        </td>

                        <td>{formatDate(form.activityDate)}</td>
                        <td>{formatDate(form.deadline)}</td>

                        <td>
                          <span
                            className={`parent-forms-status ${
                              form.status === "Pending"
                                ? "pending"
                                : form.status === "Submitted - Agree"
                                ? "agreed"
                                : "disagreed"
                            }`}
                          >
                            <span className="parent-forms-status-dot"></span>
                            {form.status}
                          </span>
                        </td>

                        <td>
                          <div className="parent-forms-actions">
                            <Link
                              to={`/parent-consent-form/${form.id}`}
                              className="parent-forms-view"
                            >
                              {response ? "View Details" : "Respond"}
                            </Link>

                            {response && (
                              <>
                                <button
                                  type="button"
                                  className="parent-forms-pdf"
                                  onClick={() =>
                                    previewPDF(form, response)
                                  }
                                >
                                  Preview PDF
                                </button>

                                <button
                                  type="button"
                                  className="parent-forms-download"
                                  onClick={() =>
                                    downloadPDF(form, response)
                                  }
                                >
                                  Download
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Status Legend */}
          <div className="parent-forms-legend">
            <span>
              <i className="pending-dot"></i> Pending
            </span>

            <span>
              <i className="agreed-dot"></i> Submitted - Agree
            </span>

            <span>
              <i className="disagreed-dot"></i> Submitted - Disagree
            </span>
          </div>
        </section>

        <p className="parent-forms-footer">
          University of the Assumption · Digital Parent Consent System
        </p>

        {/* PDF Preview Modal */}
        {previewURL && (
          <div className="parent-forms-modal-overlay">
            <div className="parent-forms-modal">
              <div className="parent-forms-modal-header">
                <div>
                  <h2>Consent PDF Preview</h2>
                  <p>Review your submitted consent document.</p>
                </div>

                <button
                  type="button"
                  onClick={closePreview}
                  className="parent-forms-modal-close"
                >
                  ✕
                </button>
              </div>

              <iframe
                src={previewURL}
                title="Consent PDF Preview"
                className="parent-forms-pdf-frame"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ParentConsentForms;
