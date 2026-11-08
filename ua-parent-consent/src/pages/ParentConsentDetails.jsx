
import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { apiRequest } from "../services/api";

function ParentConsentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [existingResponse, setExistingResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [decision, setDecision] = useState("");
  const [printedName, setPrintedName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const hasSignature = useRef(false);

  // Load consent form and parent's response history
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const [forms, responses] = await Promise.all([
          apiRequest("/parent/consent-forms"),
          apiRequest("/parent/consent-responses"),
        ]);

        const selectedForm = forms.find(
          (item) => String(item.id) === String(id)
        );

        const submittedResponse = responses.find(
          (item) => String(item.formId) === String(id)
        );

        if (active) {
          setForm(selectedForm || null);
          setExistingResponse(submittedResponse || null);
        }
      } catch (error) {
        console.error("Loading error:", error);

        if (active) {
          setLoadError(
            error.message || "Unable to load consent form."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  // Set up signature canvas
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || existingResponse) return;

    const context = canvas.getContext("2d");

    context.strokeStyle = "#172554";
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
  }, [form, existingResponse]);

  // Get pointer position
  const getPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // Start drawing
  const startDrawing = (e) => {
    if (existingResponse || submitting) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");
    const position = getPosition(e);

    e.preventDefault();

    drawingRef.current = true;
    hasSignature.current = true;

    context.beginPath();
    context.moveTo(position.x, position.y);

    canvas.setPointerCapture(e.pointerId);
  };

  // Draw signature
  const draw = (e) => {
    if (!drawingRef.current || existingResponse || submitting) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const position = getPosition(e);

    context.lineTo(position.x, position.y);
    context.stroke();
  };

  // Stop drawing
  const stopDrawing = () => {
    drawingRef.current = false;
  };

  // Clear signature
  const clearSignature = () => {
    if (existingResponse || submitting) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature.current = false;
    drawingRef.current = false;
  };

  // Validate printed name
  const validatePrintedName = () => {
    const cleanName = printedName.trim();

    if (!cleanName) {
      alert("Please enter your printed name.");
      return null;
    }

    if (cleanName.length < 2) {
      alert("Printed name must contain at least 2 characters.");
      return null;
    }

    if (cleanName.length > 120) {
      alert("Printed name cannot exceed 120 characters.");
      return null;
    }

    if (!/^[\p{L}\p{M} .'-]+$/u.test(cleanName)) {
      alert("Printed name contains invalid characters.");
      return null;
    }

    return cleanName;
  };

  // Check whether signature canvas contains drawn content
  const hasValidSignature = () => {
    const canvas = canvasRef.current;

    if (!canvas) return false;

    const context = canvas.getContext("2d");

    const imageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] !== 0) {
        return true;
      }
    }

    return false;
  };

  // Submit consent response
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting || existingResponse) return;

    if (!form) {
      alert("Consent form not found.");
      return;
    }

    if (!decision) {
      alert("Please select Agree or Disagree.");
      return;
    }

    const cleanName = validatePrintedName();

    if (!cleanName) return;

    if (!hasSignature.current || !hasValidSignature()) {
      alert("Please provide your digital signature.");
      return;
    }

    if (!confirmed) {
      alert("Please confirm your information.");
      return;
    }

    try {
      setSubmitting(true);

      const signatureImage = canvasRef.current.toDataURL("image/png");

      const response = await apiRequest(
        `/parent/consent-responses/${form.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            decision,
            printedName: cleanName,
            signature: signatureImage,
          }),
        }
      );

      alert(
        response?.message || "Consent response submitted successfully!"
      );

      navigate("/parent-consent-forms");

    } catch (error) {
      console.error("Submission error:", error);

      alert(error.message || "Unable to submit consent response.");

      setSubmitting(false);
    }
  };

  // Format submission date
  const formatSubmittedDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="parent-consent-details-layout">
        <Sidebar />

        <main className="parent-consent-details-main">
          <div className="parent-consent-details-message">
            <h2>Loading consent form...</h2>
            <p>Please wait while the form is being loaded.</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (loadError || !form) {
    return (
      <div className="parent-consent-details-layout">
        <Sidebar />

        <main className="parent-consent-details-main">
          <div className="parent-consent-details-message">
            <h2>
              {loadError
                ? "Unable to Load Consent Form"
                : "Consent Form Not Found"}
            </h2>

            <p>
              {loadError ||
                "The consent form may have been removed or is unavailable."}
            </p>

            <Link
              to="/parent-consent-forms"
              className="parent-consent-details-back"
            >
              Back to Consent Forms
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="parent-consent-details-layout">
      <Sidebar />

      <main className="parent-consent-details-main">

        {/* Page Header */}
        <header className="parent-consent-details-header">
          <div>
            <Link
              to="/parent-consent-forms"
              className="parent-consent-details-breadcrumb"
            >
              My Consent Forms
            </Link>

            <h1>Consent Form Details</h1>

            <p>
              Review the activity information and your parent or
              guardian consent response.
            </p>
          </div>

          <span className="parent-consent-details-badge">
            {existingResponse ? "Response Submitted" : "Requires Response"}
          </span>
        </header>

        {/* Activity Information */}
        <section className="parent-consent-details-card">
          <div className="parent-consent-details-card-heading">
            <div className="parent-consent-details-icon">
              <span>01</span>
            </div>

            <div>
              <h2>Activity Information</h2>
              <p>Review the details provided by your teacher.</p>
            </div>
          </div>

          <h3 className="parent-consent-details-activity-title">
            {form.title}
          </h3>

          <div className="parent-consent-details-info-grid">
            <div className="parent-consent-details-info-item">
              <span>Class / Section</span>
              <strong>{form.className || "Not specified"}</strong>
            </div>

            <div className="parent-consent-details-info-item">
              <span>Activity Date</span>
              <strong>{form.activityDate || "Not specified"}</strong>
            </div>

            <div className="parent-consent-details-info-item">
              <span>Location</span>
              <strong>{form.location || "Not specified"}</strong>
            </div>

            <div className="parent-consent-details-info-item">
              <span>Submission Deadline</span>
              <strong>{form.deadline || "Not specified"}</strong>
            </div>
          </div>

          <div className="parent-consent-details-description">
            <h3>Activity Description</h3>
            <p>{form.description || "No description provided."}</p>
          </div>

          <div className="parent-consent-details-description">
            <h3>Additional Instructions</h3>
            <p>
              {form.instructions || "No additional instructions provided."}
            </p>
          </div>
        </section>

        {/* Already Submitted Response */}
        {existingResponse ? (
          <section className="parent-consent-details-card">
            <div className="parent-consent-details-card-heading">
              <div className="parent-consent-details-icon">
                <span>02</span>
              </div>

              <div>
                <h2>Your Submitted Response</h2>
                <p>Your response has already been recorded.</p>
              </div>
            </div>

            <div className="parent-consent-details-notice">
              <strong>Response Successfully Submitted</strong>
              <p>
                You have already submitted your consent for this activity.
                Another response cannot be submitted for this form.
              </p>
            </div>

            <div className="parent-consent-details-field">
              <label className="parent-consent-details-label">
                Consent Decision
              </label>

              <strong>
                {existingResponse.decision === "Agree"
                  ? "I Agree"
                  : existingResponse.decision === "Disagree"
                  ? "I Do Not Agree"
                  : existingResponse.decision}
              </strong>
            </div>

            <div className="parent-consent-details-field">
              <label className="parent-consent-details-label">
                Printed Name of Parent / Guardian
              </label>

              <p>{existingResponse.printedName}</p>
            </div>

            <div className="parent-consent-details-field">
              <label className="parent-consent-details-label">
                Submitted Digital Signature
              </label>

              {existingResponse.signature ? (
                <div className="parent-consent-details-signature-box">
                  <img
                    src={existingResponse.signature}
                    alt="Previously submitted parent or guardian signature"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "180px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ) : (
                <p>Signature is not available.</p>
              )}
            </div>

            <div className="parent-consent-details-field">
              <label className="parent-consent-details-label">
                Date Submitted
              </label>

              <p>
                {formatSubmittedDate(existingResponse.submittedAt)}
              </p>
            </div>

            <div className="parent-consent-details-actions">
              <Link
                to="/parent-consent-forms"
                className="parent-consent-details-cancel"
              >
                Back to Consent Forms
              </Link>
            </div>
          </section>
        ) : (
          /* New Consent Submission Form */
          <form
            className="parent-consent-details-card parent-consent-details-form"
            onSubmit={handleSubmit}
          >
            <div className="parent-consent-details-card-heading">
              <div className="parent-consent-details-icon">
                <span>02</span>
              </div>

              <div>
                <h2>Parent / Guardian Consent</h2>
                <p>Complete all required fields below.</p>
              </div>
            </div>

            {/* Decision */}
            <div className="parent-consent-details-field">
              <label className="parent-consent-details-label">
                Consent Decision <span>*</span>
              </label>

              <p className="parent-consent-details-help">
                Please select whether you allow the student to
                participate in this activity.
              </p>

              <div className="parent-consent-details-decisions">
                <label
                  className={`parent-consent-details-decision ${
                    decision === "Agree" ? "selected agree" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="Agree"
                    checked={decision === "Agree"}
                    onChange={(e) => setDecision(e.target.value)}
                    disabled={submitting}
                  />

                  <span className="parent-consent-details-radio"></span>

                  <div>
                    <strong>I Agree</strong>
                    <small>
                      I give permission for the student to participate.
                    </small>
                  </div>
                </label>

                <label
                  className={`parent-consent-details-decision ${
                    decision === "Disagree" ? "selected disagree" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="Disagree"
                    checked={decision === "Disagree"}
                    onChange={(e) => setDecision(e.target.value)}
                    disabled={submitting}
                  />

                  <span className="parent-consent-details-radio"></span>

                  <div>
                    <strong>I Do Not Agree</strong>
                    <small>
                      I do not give permission for the student to participate.
                    </small>
                  </div>
                </label>
              </div>
            </div>

            {/* Printed Name */}
            <div className="parent-consent-details-field">
              <label
                htmlFor="printedName"
                className="parent-consent-details-label"
              >
                Printed Name of Parent / Guardian <span>*</span>
              </label>

              <input
                id="printedName"
                type="text"
                value={printedName}
                onChange={(e) => setPrintedName(e.target.value)}
                placeholder="Enter your complete name"
                autoComplete="name"
                maxLength={120}
                disabled={submitting}
                required
              />

              <small className="parent-consent-details-help">
                Enter the full name of the parent or guardian providing consent.
              </small>
            </div>

            {/* Digital Signature */}
            <div className="parent-consent-details-field">
              <label className="parent-consent-details-label">
                Digital Signature <span>*</span>
              </label>

              <p className="parent-consent-details-help">
                Draw your signature inside the box using your mouse,
                touchpad, or touchscreen.
              </p>

              <div className="parent-consent-details-signature-box">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={200}
                  className="parent-consent-details-canvas"
                  style={{ touchAction: "none" }}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerCancel={stopDrawing}
                  onPointerLeave={stopDrawing}
                />

                <span className="parent-consent-details-signature-hint">
                  Sign here
                </span>
              </div>

              <button
                type="button"
                className="parent-consent-details-clear"
                onClick={clearSignature}
                disabled={submitting}
              >
                Clear Signature
              </button>
            </div>

            {/* Confirmation */}
            <label className="parent-consent-details-confirmation">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={submitting}
              />

              <span>
                I confirm that the information I provided and my
                selected consent decision are correct.
              </span>
            </label>

            {/* Notice */}
            <div className="parent-consent-details-notice">
              <strong>Before submitting</strong>
              <p>
                Please review your decision, printed name, and signature.
                Make sure all information is correct before submitting.
              </p>
            </div>

            {/* Actions */}
            <div className="parent-consent-details-actions">
              <Link
                to="/parent-consent-forms"
                className="parent-consent-details-cancel"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="parent-consent-details-submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Consent"}
              </button>
            </div>
          </form>
        )}

        <footer className="parent-consent-details-footer">
          University of the Assumption | UA E-ParentConsent System
        </footer>
      </main>
    </div>
  );
}

export default ParentConsentDetails;
