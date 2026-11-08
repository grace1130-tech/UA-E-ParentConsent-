
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function TeacherSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/teacher-dashboard",
      icon: "🏠"
    },
    {
      name: "My Consent Forms",
      path: "/teacher-consent-forms",
      icon: "📄"
    },
    {
      name: "Parent Responses",
      path: "/teacher-responses",
      icon: "👥"
    }
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <>
      <button
        className="teacher-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <div
          className="teacher-sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`teacher-sidebar ${
          isOpen ? "teacher-sidebar-open" : ""
        }`}
      >
        <div className="teacher-sidebar-brand">
          <div className="teacher-sidebar-logo">UA</div>

          <div>
            <h2>E-ParentConsent</h2>
            <p>University of the Assumption</p>
          </div>
        </div>

        <nav className="teacher-sidebar-menu">
          <p className="teacher-menu-label">TEACHER MENU</p>

          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path
                  ? "teacher-menu-item teacher-menu-active"
                  : "teacher-menu-item"
              }
            >
              <span className="teacher-menu-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="teacher-sidebar-bottom">
          <div className="teacher-sidebar-help">
            <span>ℹ️</span>
            <div>
              <strong>Need assistance?</strong>
              <p>Contact your school administrator.</p>
            </div>
          </div>

          <button
            className="teacher-sidebar-logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default TeacherSidebar;
