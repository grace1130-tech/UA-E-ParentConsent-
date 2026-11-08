
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import TeacherSidebar from "../components/TeacherSidebar";
import { apiRequest } from "../services/api";
import jsPDF from "jspdf";

function TeacherResponseDetails() {
  const { id } = useParams();

  const [response, setResponse] = useState(null);
  const [consentForm, setConsentForm] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load selected response from PostgreSQL
  useEffect(() => {
    const loadResponse = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/teacher/consent-responses");

        const selectedResponse = data.find(
          (item) => String(item.id) === String(id)
        );

        if (!selectedResponse) {
          setResponse(null);
          setConsentForm(null);
          return;
        }

        setResponse(selectedResponse);

        // Activity information is included in the response DTO.
        // Additional fields are retrieved from the teacher's forms.
        try {
          const forms = await apiRequest("/teacher/consent-forms");

          const selectedForm = forms.find(
            (form) => String(form.id) === String(selectedResponse.formId)
          );

          setConsentForm(selectedForm || null);
        } catch (formError) {
          console.error("Loading consent form error:", formError);
          setConsentForm(null);
        }
      } catch (err) {
        console.error("Loading response error:", err);
        setError(err.message || "Unable to load response.");
        setResponse(null);
      } finally {
        setLoading(false);
      }
    };

    loadResponse();
  }, [id]);

  // Clean up temporary PDF preview URL
  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Generate complete consent PDF
  const generatePDF = () => {
    if (!response) return null;

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
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

      if (y + lines.length * lineHeight > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(lines, margin, y);
      y += lines.length * lineHeight + 4;
    };

    // University heading
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

    // Activity details
    addText("ACTIVITY DETAILS", 13, true);

    addText(
      `Activity Title: ${consentForm?.title || response.formTitle}`,
      11,
      true
    );

    if (consentForm) {
      addText(`Class / Section: ${consentForm.className}`);
      addText(`Activity Date: ${consentForm.activityDate}`);
      addText(`Location: ${consentForm.location}`);
      addText(`Submission Deadline: ${consentForm.deadline}`);

      y += 3;

      addText("ACTIVITY DESCRIPTION", 12, true);
      addText(consentForm.description);

      addText("ADDITIONAL INSTRUCTIONS", 12, true);
      addText(
        consentForm.instructions || "No additional instructions."
      );
    } else {
      addText("Original activity details are no longer available.");
    }

    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Parent response
    addText("PARENT / GUARDIAN CONSENT RESPONSE", 13, true);

    addText(`Parent Name: ${response.parentName}`);
    addText(`Printed Name: ${response.printedName}`);
    addText(`Consent Decision: ${response.decision}`);
    addText(`Date Submitted: ${formatDate(response.submittedAt)}`);

    y += 5;

    addText("PARENT / GUARDIAN DIGITAL SIGNATURE", 12, true);

    if (response.signature) {
      if (y + 40 > pageHeight - 20) {
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

    if (y + 25 > pageHeight - 20) {
      pdf.addPage();
      y = 20;
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

  // Download PDF
  const downloadPDF = () => {
    try {
      const pdf = generatePDF();

      if (pdf) {
        pdf.save(`UA-Consent-${response.id}.pdf`);
      }
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Unable to download PDF. Please try again.");
    }
  };

  // Preview PDF
  const previewPDF = () => {
    try {
      const pdf = generatePDF();

      if (pdf) {
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        setPreviewURL(url);
      }
    } catch (error) {
      console.error("PDF preview error:", error);
      alert("Unable to preview PDF. Please try again.");
    }
  };

  // Close preview
  const closePreview = () => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }

    setPreviewURL(null);
  };

  if (loading) {
    return (
      <div className="teacher-response-details-layout">
        <TeacherSidebar />

        <main className="teacher-response-details-main">
          <div className="teacher-response-details-message">
            <h2>Loading response...</h2>
            <p>Please wait while the response is being loaded.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="teacher-response-details-layout">
        <TeacherSidebar />

        <main className="teacher-response-details-main">
          <div className="teacher-response-details-message">
            <h2>
              {error ? "Unable to Load Response" : "Response Not Found"}
            </h2>

            <p>
              {error ||
                "The selected parent response is unavailable or may have been removed."}
            </p>

            <Link
              to="/teacher-responses"
              className="teacher-response-details-back"
            >
              Back to Responses
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="teacher-response-details-layout">
      <TeacherSidebar />

      <main className="teacher-response-details-main">

        {/* Header */}
        <header className="teacher-response-details-header">
          <div>
            <Link
              to="/teacher-responses"
              className="teacher-response-details-breadcrumb"
            >
              Parent Consent Responses
            </Link>

            <h1>Response Details</h1>

            <p>
              Review the submitted consent information and digital signature.
            </p>
          </div>

          <span
            className={`teacher-response-details-status ${
              response.decision === "Agree" ? "agree" : "disagree"
            }`}
          >
            {response.decision || "Unknown"}
          </span>
        </header>

        {/* Activity Information */}
        <section className="teacher-response-details-card">
          <div className="teacher-response-details-card-heading">
            <div className="teacher-response-details-icon">01</div>

            <div>
              <h2>Activity Information</h2>
              <p>Details of the consent form submitted by the parent.</p>
            </div>
          </div>

          <h3 className="teacher-response-details-activity-title">
            {consentForm?.title || response.formTitle}
          </h3>

          {consentForm ? (
            <>
              <div className="teacher-response-details-info-grid">
                <div className="teacher-response-details-info-item">
                  <span>Class / Section</span>
                  <strong>{consentForm.className || "Not specified"}</strong>
                </div>

                <div className="teacher-response-details-info-item">
                  <span>Activity Date</span>
                  <strong>{consentForm.activityDate || "Not specified"}</strong>
                </div>

                <div className="teacher-response-details-info-item">
                  <span>Location</span>
                  <strong>{consentForm.location || "Not specified"}</strong>
                </div>

                <div className="teacher-response-details-info-item">
                  <span>Submission Deadline</span>
                  <strong>{consentForm.deadline || "Not specified"}</strong>
                </div>
              </div>

              <div className="teacher-response-details-description">
                <h3>Activity Description</h3>
                <p>
                  {consentForm.description || "No description provided."}
                </p>
              </div>

              <div className="teacher-response-details-description">
                <h3>Additional Instructions</h3>
                <p>
                  {consentForm.instructions ||
                    "No additional instructions provided."}
                </p>
              </div>
            </>
          ) : (
            <p className="teacher-response-details-missing">
              The original consent form details are no longer available.
            </p>
          )}
        </section>

        {/* Parent Response */}
        <section className="teacher-response-details-card">
          <div className="teacher-response-details-card-heading">
            <div className="teacher-response-details-icon">02</div>

            <div>
              <h2>Parent / Guardian Response</h2>
              <p>Information recorded during consent submission.</p>
            </div>
          </div>

          <div className="teacher-response-details-response-grid">
            <div className="teacher-response-details-response-item">
              <span>Parent Name</span>
              <strong>{response.parentName || "Not available"}</strong>
            </div>

            <div className="teacher-response-details-response-item">
              <span>Printed Name</span>
              <strong>{response.printedName || "Not provided"}</strong>
            </div>

            <div className="teacher-response-details-response-item">
              <span>Consent Decision</span>

              <strong
                className={`teacher-response-details-decision ${
                  response.decision === "Agree" ? "agree" : "disagree"
                }`}
              >
                {response.decision || "Unknown"}
              </strong>
            </div>

            <div className="teacher-response-details-response-item">
              <span>Date Submitted</span>
              <strong>{formatDate(response.submittedAt)}</strong>
            </div>

            <div className="teacher-response-details-response-item">
              <span>Reference Number</span>
              <strong>{response.id}</strong>
            </div>
          </div>
        </section>

        {/* Digital Signature */}
        <section className="teacher-response-details-card">
          <div className="teacher-response-details-card-heading">
            <div className="teacher-response-details-icon">03</div>

            <div>
              <h2>Parent Digital Signature</h2>
              <p>Signature image submitted with the response.</p>
            </div>
          </div>

          {response.signature ? (
            <div className="teacher-response-details-signature">
              <img
                src={response.signature}
                alt="Parent or guardian digital signature"
              />
              <span>Submitted Digital Signature</span>
            </div>
          ) : (
            <p className="teacher-response-details-missing">
              No digital signature is available for this response.
            </p>
          )}
        </section>

        {/* PDF Actions */}
        <section className="teacher-response-details-pdf-card">
          <div>
            <h2>Consent Document</h2>
            <p>
              Preview or download the complete consent record as a PDF.
            </p>
          </div>

          <div className="teacher-response-details-pdf-actions">
            <button
              type="button"
              onClick={previewPDF}
              className="teacher-response-details-preview"
            >
              Preview PDF
            </button>

            <button
              type="button"
              onClick={downloadPDF}
              className="teacher-response-details-download"
            >
              Download Complete Consent PDF
            </button>
          </div>
        </section>

        <div className="teacher-response-details-bottom">
          <Link to="/teacher-responses">
            ← Back to Responses
          </Link>
        </div>

        <footer className="teacher-response-details-footer">
          University of the Assumption | UA E-ParentConsent System
        </footer>

        {/* PDF Preview Modal */}
        {previewURL && (
          <div className="teacher-response-details-modal">
            <div className="teacher-response-details-modal-content">
              <div className="teacher-response-details-modal-header">
                <h2>Consent PDF Preview</h2>

                <button type="button" onClick={closePreview}>
                  Close Preview
                </button>
              </div>

              <iframe
                src={previewURL}
                title="Consent PDF Preview"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TeacherResponseDetails;
