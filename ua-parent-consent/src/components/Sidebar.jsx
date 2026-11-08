
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/parent-dashboard",
      icon: "🏠"
    },
    {
      name: "Consent Forms",
      path: "/parent-consent-forms",
      icon: "📄"
    },

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
        className="parent-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <div
          className="parent-sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`parent-sidebar ${isOpen ? "parent-sidebar-open" : ""}`}
      >
        <div className="parent-sidebar-brand">
          <div className="parent-sidebar-logo">UA</div>

          <div>
            <h2>E-ParentConsent</h2>
            <p>University of the Assumption</p>
          </div>
        </div>

        <nav className="parent-sidebar-menu">
          <p className="parent-menu-label">MAIN MENU</p>

          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path
                  ? "parent-menu-item parent-menu-active"
                  : "parent-menu-item"
              }
            >
              <span className="parent-menu-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="parent-sidebar-bottom">
          <div className="parent-sidebar-help">
            <span>ℹ️</span>
            <div>
              <strong>Need assistance?</strong>
              <p>Contact your school administrator.</p>
            </div>
          </div>

          <button
            className="parent-sidebar-logout"
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

export default Sidebar;
