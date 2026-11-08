
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save authenticated user information
      const loggedInUser = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(loggedInUser)
      );

      alert("Login successful!");

      // Redirect based on user role
      switch (data.role?.toLowerCase()) {
        case "parent":
          navigate("/parent-dashboard");
          break;

        case "teacher":
          navigate("/teacher-dashboard");
          break;

        case "admin":
          navigate("/admin-dashboard");
          break;

        default:
          localStorage.removeItem("token");
          localStorage.removeItem("loggedInUser");
          setError("Invalid account role.");
      }

    } catch (err) {
      setError(
        err.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

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
              UNIVERSITY PORTAL
            </span>

            <h1>
              Welcome to
              <br />
              UA E-ParentConsent
            </h1>

            <div className="login-gold-line"></div>

            <p>
              A convenient and secure way to manage student
              consent forms, communicate with parents, and
              keep school activities organized.
            </p>
          </div>

          <div className="login-brand-footer">
            <span>EXCELLENCE • SERVICE • COMMUNITY</span>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="login-form-inner">
            <div className="login-mobile-logo">UA</div>

            <span className="login-form-eyebrow">
              ACCOUNT ACCESS
            </span>

            <h2>Welcome Back!</h2>

            <p className="login-description">
              Sign in using your registered account.
            </p>

            {error && (
              <p className="login-error-message">
                {error}
              </p>
            )}

            <form onSubmit={handleLogin}>
              <div className="login-field">
                <label htmlFor="login-email">
                  Email Address
                </label>

                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="login-password">
                  Password
                </label>

                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="login-register">
              <span>Don't have an account?</span>
              <Link to="/register">Create an account</Link>
            </div>

            <div className="login-security-note">
              <span aria-hidden="true">◆</span>
              <p>
                Authorized users only. Please keep your
                account credentials private.
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

export default Login;
