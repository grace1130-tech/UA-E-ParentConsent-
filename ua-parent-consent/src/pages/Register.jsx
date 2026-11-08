
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!fullName.trim() || !normalizedEmail || !password) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: normalizedEmail,
          password: password,
        }),
      });

      alert("Registration successful! You can now log in.");

      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell">

        <section className="login-brand-panel">
          <div className="login-brand-top">
            <div className="login-seal">UA</div>

            <div>
              <span>UNIVERSITY OF THE</span>
              <strong>ASSUMPTION</strong>
            </div>
          </div>

          <div className="login-brand-copy">
            <span className="login-eyebrow">
              PARENT PORTAL
            </span>

            <h1>
              Join the
              <br />
              UA Community
            </h1>

            <div className="login-gold-line"></div>

            <p>
              Create your parent account to conveniently
              access consent forms, respond to school
              activities, and stay connected with the
              University of the Assumption.
            </p>
          </div>

          <div className="login-brand-footer">
            <span>EXCELLENCE • SERVICE • COMMUNITY</span>
          </div>
        </section>

        <section className="login-form-panel register-form-panel">
          <div className="login-form-inner">

            <div className="login-mobile-logo">UA</div>

            <span className="login-form-eyebrow">
              CREATE YOUR ACCOUNT
            </span>

            <h2>Parent Registration</h2>

            <p className="login-description">
              Fill in the information below to get started.
            </p>

            {error && (
              <p className="login-error-message">
                {error}
              </p>
            )}

            <form onSubmit={handleRegister}>

              <div className="login-field">
                <label htmlFor="register-name">
                  Full Name
                </label>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="register-email">
                  Email Address
                </label>

                <input
                  id="register-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="register-password">
                  Password
                </label>

                <input
                  id="register-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="register-confirm-password">
                  Confirm Password
                </label>

                <input
                  id="register-confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
                <span aria-hidden="true">→</span>
              </button>

            </form>

            <div className="login-register">
              <span>Already have an account?</span>
              <Link to="/login">Sign in here</Link>
            </div>

            <div className="login-security-note">
              <span aria-hidden="true">◆</span>
              <p>
                Your account is registered with the Parent role.
                Keep your login credentials private.
              </p>
            </div>

          </div>
        </section>

      </div>

      <p className="login-copyright">
        © {new Date().getFullYear()} University of the Assumption
      </p>
    </main>
  );
}

export default Register;
