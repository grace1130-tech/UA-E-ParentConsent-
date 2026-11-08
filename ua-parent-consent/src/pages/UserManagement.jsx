
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { apiRequest } from "../services/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");

  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // LOAD USERS FROM POSTGRESQL
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/admin/users");

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // CREATE TEACHER OR ADMIN ACCOUNT
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    setCreating(true);

    try {
      await apiRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });

      alert("User account created successfully!");

      setFullName("");
      setEmail("");
      setPassword("");
      setRole("teacher");
      setShowPassword(false);
      setShowForm(false);

      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setCreating(false);
    }
  };

  // ACTIVATE OR DEACTIVATE ACCOUNT
  const toggleUserStatus = async (user) => {
    const newStatus =
      user.status === "Inactive" ? "Active" : "Inactive";

    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus === "Active" ? "activate" : "deactivate"} ${user.fullName}'s account?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await apiRequest(`/admin/users/${user.id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      alert(`Account ${newStatus.toLowerCase()} successfully!`);

      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to update account status.");
    }
  };

  // SEARCH AND FILTER USERS
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        user.role?.toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // USER STATISTICS
  const counts = {
    total: users.length,
    parents: users.filter(
      (u) => u.role?.toLowerCase() === "parent"
    ).length,
    teachers: users.filter(
      (u) => u.role?.toLowerCase() === "teacher"
    ).length,
    admins: users.filter(
      (u) => u.role?.toLowerCase() === "admin"
    ).length,
    active: users.filter(
      (u) => u.status !== "Inactive"
    ).length,
    inactive: users.filter(
      (u) => u.status === "Inactive"
    ).length,
  };

  return (
    <>
      <AdminSidebar />

      <main className="admin-users-page">
        <div className="admin-users-header">
          <div>
            <span className="admin-users-eyebrow">
              UNIVERSITY OF THE ASSUMPTION
            </span>
            <h1>User Management</h1>
            <p>
              Manage parent, teacher, and administrator accounts.
            </p>
          </div>

          <div className="admin-users-header-icon">👥</div>
        </div>

        {error && (
          <div className="admin-users-error">
            {error}
          </div>
        )}

        {/* STATISTICS */}
        <section className="admin-users-stats">
          <div className="admin-users-stat-card">
            <span>👥</span>
            <div>
              <h3>{counts.total}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="admin-users-stat-card">
            <span>👨‍👩‍👧</span>
            <div>
              <h3>{counts.parents}</h3>
              <p>Parents</p>
            </div>
          </div>

          <div className="admin-users-stat-card">
            <span>🎓</span>
            <div>
              <h3>{counts.teachers}</h3>
              <p>Teachers</p>
            </div>
          </div>

          <div className="admin-users-stat-card">
            <span>🛡️</span>
            <div>
              <h3>{counts.admins}</h3>
              <p>Administrators</p>
            </div>
          </div>
        </section>

        {/* ACCOUNT STATUS */}
        <section className="admin-users-status-summary">
          <div>
            <span className="admin-users-status-dot active"></span>
            <div>
              <h3>{counts.active}</h3>
              <p>Active Accounts</p>
            </div>
          </div>

          <div>
            <span className="admin-users-status-dot inactive"></span>
            <div>
              <h3>{counts.inactive}</h3>
              <p>Inactive Accounts</p>
            </div>
          </div>
        </section>

        {/* USER TABLE SECTION */}
        <section className="admin-users-content">
          <div className="admin-users-content-header">
            <div>
              <h2>Registered Users</h2>
              <p>View and manage all registered accounts.</p>
            </div>

            <button
              className="admin-users-add-button"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "✕ Close Form" : "+ Create Account"}
            </button>
          </div>

          {/* CREATE USER FORM */}
          {showForm && (
            <form
              className="admin-users-create-form"
              onSubmit={handleCreateUser}
            >
              <h3>Create New Account</h3>

              <div className="admin-users-form-grid">
                <div>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label>Password</label>
                  <div className="admin-users-password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 12 characters"
                      minLength={12}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label>Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="admin-users-submit-button"
                disabled={creating}
              >
                {creating ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* SEARCH AND FILTER */}
          <div className="admin-users-toolbar">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="parent">Parents</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* USERS TABLE */}
          <div className="admin-users-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="admin-users-empty">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-users-user-info">
                          <div className="admin-users-avatar">
                            {user.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <strong>{user.fullName}</strong>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span
                          className={`admin-users-role ${user.role?.toLowerCase()}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-users-status ${
                            user.status === "Inactive"
                              ? "inactive"
                              : "active"
                          }`}
                        >
                          {user.status || "Active"}
                        </span>
                      </td>

                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <button
                          className={`admin-users-action-button ${
                            user.status === "Inactive"
                              ? "activate"
                              : "deactivate"
                          }`}
                          onClick={() => toggleUserStatus(user)}
                        >
                          {user.status === "Inactive"
                            ? "Activate"
                            : "Deactivate"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="admin-users-empty">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-users-table-footer">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </section>

        <footer className="admin-users-footer">
          University of the Assumption · E-ParentConsent Portal
        </footer>
      </main>
    </>
  );
}

export default UserManagement;
