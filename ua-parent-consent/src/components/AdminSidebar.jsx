
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin-dashboard",
      icon: "🏠"
    },
    {
      name: "Manage Users",
      path: "/admin-users",
      icon: "👥"
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <>
      <button
        className="admin-sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">UA</div>
          <div>
            <h2>UA E-Consent</h2>
            <p>Administrator Panel</p>
          </div>
        </div>

        <div className="admin-sidebar-label">MAIN MENU</div>

        <nav className="admin-sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-role">
            <span>👤</span>
            <div>
              <strong>Administrator</strong>
              <small>System Management</small>
            </div>
          </div>

          <button
            className="admin-sidebar-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
