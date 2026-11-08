
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "../components/TeacherSidebar";
import { apiRequest } from "../services/api";

function CreateConsentForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    className: "",
    activityDate: "",
    location: "",
    deadline: "",
    instructions: ""
  });

  const [showPreview, setShowPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const today = new Date().toLocaleDateString("en-CA");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handlePreview = (e) => {
    e.preventDefault();

    if (formData.deadline > formData.activityDate) {
      alert("The submission deadline cannot be after the activity date.");
      return;
    }

    setShowPreview(true);
  };

  const handleSave = async (status) => {
    if (publishing) return;

    setPublishing(true);

    try {
      const newForm = await apiRequest(
        `/teacher/consent-forms?status=${status}`,
        {
          method: "POST",
          body: JSON.stringify(formData)
        }
      );

      alert(
        status === "Draft"
          ? "Consent form saved as draft successfully!"
          : "Consent form published successfully!"
      );

      navigate("/teacher-consent-forms", {
        state: { newForm }
      });
    } catch (error) {
      alert(error.message || "Unable to save consent form.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="parent-layout">
      <TeacherSidebar />

      <main className="parent-main create-consent-page">
        <header className="dashboard-header create-consent-header">
          <div>
            <span className="create-consent-eyebrow">
              TEACHER WORKSPACE
            </span>
            <h1>Create Digital Consent Form</h1>
            <p>
              Prepare and publish an activity consent form for parents
              and guardians.
            </p>
          </div>

          <button
            type="button"
            className="create-consent-cancel"
            onClick={() => navigate("/teacher-dashboard")}
          >
            Back to Dashboard
          </button>
        </header>

        {!showPreview ? (
          <section className="create-consent-card">
            <div className="create-consent-card-heading">
              <div className="create-consent-heading-icon">✎</div>
              <div>
                <h2>Consent Form Information</h2>
                <p>
                  Fill in the activity details before creating your form.
                </p>
              </div>
            </div>

            <div className="create-consent-progress">
              <span className="create-consent-step active">1</span>
              <span className="create-consent-progress-line"></span>
              <span className="create-consent-step">2</span>
              <span className="create-consent-progress-label">
                Form Details <span>→</span> Preview
              </span>
            </div>

            <form onSubmit={handlePreview} className="create-consent-form">
              <div className="create-consent-section-title">
                <h3>Basic Information</h3>
                <p>Provide the main details of the activity.</p>
              </div>

              <div className="create-consent-field">
                <label htmlFor="title">Form Title <span>*</span></label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="e.g. Educational Field Trip"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-consent-field">
                <label htmlFor="description">
                  Activity Description <span>*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Explain the purpose and details of the activity..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

              <div className="create-consent-field">
                <label htmlFor="className">
                  Class / Section <span>*</span>
                </label>
                <input
                  id="className"
                  type="text"
                  name="className"
                  placeholder="e.g. BSIT 2A"
                  value={formData.className}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-consent-section-title create-consent-second-section">
                <h3>Activity Schedule and Location</h3>
                <p>Set the activity date and parent submission deadline.</p>
              </div>

              <div className="create-consent-grid">
                <div className="create-consent-field">
                  <label htmlFor="activityDate">
                    Activity Date <span>*</span>
                  </label>
                  <input
                    id="activityDate"
                    type="date"
                    name="activityDate"
                    value={formData.activityDate}
                    onChange={handleChange}
                    min={today}
                    required
                  />
                </div>

                <div className="create-consent-field">
                  <label htmlFor="deadline">
                    Submission Deadline <span>*</span>
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={today}
                    max={formData.activityDate || undefined}
                    required
                  />
                </div>
              </div>

              <div className="create-consent-field">
                <label htmlFor="location">
                  Activity Location <span>*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  placeholder="Enter the activity venue or location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-consent-section-title create-consent-second-section">
                <h3>Additional Information</h3>
                <p>Add reminders or special instructions for parents.</p>
              </div>

              <div className="create-consent-field">
                <label htmlFor="instructions">
                  Additional Instructions
                </label>
                <textarea
                  id="instructions"
                  name="instructions"
                  placeholder="Enter reminders, requirements, or other important information..."
                  value={formData.instructions}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="create-consent-note">
                <span>ⓘ</span>
                <p>
                  Please review all activity details carefully. You will be
                  able to preview the consent form before publishing it.
                </p>
              </div>

              <div className="create-consent-actions">
                <button
                  type="button"
                  className="create-consent-secondary"
                  onClick={() => navigate("/teacher-dashboard")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-consent-primary"
                >
                  Preview Consent Form <span>→</span>
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="create-consent-card">
            <div className="create-consent-card-heading">
              <div className="create-consent-heading-icon">▤</div>
              <div>
                <h2>Review Your Consent Form</h2>
                <p>Check the information below before saving or publishing.</p>
              </div>
            </div>

            <div className="create-consent-progress">
              <span className="create-consent-step completed">✓</span>
              <span className="create-consent-progress-line completed"></span>
              <span className="create-consent-step active">2</span>
              <span className="create-consent-progress-label">
                Form Details <span>→</span> Preview
              </span>
            </div>

            <article className="create-consent-document">
              <div className="create-consent-document-top">
                <div className="create-consent-university-mark">UA</div>
                <div>
                  <h2>UNIVERSITY OF THE ASSUMPTION</h2>
                  <p>Parent / Guardian Digital Consent Form</p>
                </div>
              </div>

              <div className="create-consent-document-divider"></div>

              <div className="create-consent-document-body">
                <span className="create-consent-document-label">
                  ACTIVITY CONSENT FORM
                </span>
                <h2>{formData.title}</h2>

                <div className="create-consent-document-details">
                  <div>
                    <span>CLASS / SECTION</span>
                    <strong>{formData.className}</strong>
                  </div>
                  <div>
                    <span>ACTIVITY DATE</span>
                    <strong>{formData.activityDate}</strong>
                  </div>
                  <div>
                    <span>LOCATION</span>
                    <strong>{formData.location}</strong>
                  </div>
                  <div>
                    <span>SUBMISSION DEADLINE</span>
                    <strong>{formData.deadline}</strong>
                  </div>
                </div>

                <h3>Activity Description</h3>
                <p className="create-consent-document-text">
                  {formData.description}
                </p>

                <h3>Additional Instructions</h3>
                <p className="create-consent-document-text">
                  {formData.instructions || "No additional instructions."}
                </p>

                <div className="create-consent-document-notice">
                  Parent or guardian consent will be collected through the
                  digital consent submission page. Parents or guardians will
                  be asked to provide their printed name, consent decision,
                  and signature.
                </div>
              </div>

              <div className="create-consent-document-footer">
                University of the Assumption · Digital Parent Consent System
              </div>
            </article>

            <div className="create-consent-publish-note">
              <span>✓</span>
              <p>
                You can save this form as a draft for later or publish it
                to make it available to parents.
              </p>
            </div>

            <div className="create-consent-actions">
              <button
                type="button"
                className="create-consent-secondary"
                onClick={() => setShowPreview(false)}
                disabled={publishing}
              >
                ← Edit Form
              </button>

              <button
                type="button"
                className="create-consent-secondary"
                onClick={() => handleSave("Draft")}
                disabled={publishing}
              >
                {publishing ? "Saving..." : "Save as Draft"}
              </button>

              <button
                type="button"
                className="create-consent-primary"
                onClick={() => handleSave("Published")}
                disabled={publishing}
              >
                {publishing ? "Saving..." : "Publish Consent Form"}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default CreateConsentForm;
