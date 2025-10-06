import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Plus,
  Edit3,
  PauseCircle,
  Trash2,
  Save,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Card,
  PrimaryButton,
  SecondaryButton,
  Badge,
  Input,
  Select,
  Modal,
  Container,
  ResponsiveGrid,
  LoadingSpinner,
} from "../theme/ThemeComponents.jsx";
import CLASS_LEVELS from "../../constants/classLevels";

export default function UserManagement() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingChildren, setEditingChildren] = useState([]); // holds student IDs for parent edit
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toast, setToast] = useState({ type: "", message: "" });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student",
    class_level: "",
    password: "",
    children: [], // for parent creation
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Load linked children for a given parent ID
  const loadParentChildren = async (parentId) => {
    try {
      const resp = await fetch(
        `http://localhost/api/admin/parent-children?parent_id=${parentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!resp.ok) return setEditingChildren([]);
      const data = await resp.json();
      const arr = (data.data || []).map((c) => c.id);
      setEditingChildren(arr);
    } catch (e) {
      setEditingChildren([]);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const responseData = await response.json();
      const usersData = responseData.data || responseData || [];

      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const u = users.find((x) => x.id === userId);
      if (!u) {
        showToast("error", "User not found");
        return;
      }
      const nextStatus = u.status === "active" ? "suspended" : "active";

      // Backend requires id, name, email, role and accepts class_level/status optionally
      const payload = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        class_level: u.class_level ?? null,
        status: nextStatus,
      };

      const response = await fetch("http://localhost/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user status");
      }

      await fetchUsers();
      showToast(
        "success",
        `User ${nextStatus === "active" ? "activated" : "suspended"} successfully`
      );
    } catch (err) {
      setError(err.message);
      showToast("error", err.message);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3000);
  };

  const validateEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
  const validatePassword = (pwd) => typeof pwd === "string" && pwd.length >= 6;

  // Safely format various date inputs (ISO, MySQL DATETIME, timestamps) without throwing
  const formatDateSafe = (value) => {
    if (!value || value === "0000-00-00 00:00:00") return "N/A";
    // If it's a number-like timestamp
    if (typeof value === "number") {
      const dNum = new Date(value);
      return isNaN(dNum.getTime()) ? "N/A" : dNum.toLocaleDateString();
    }
    // Try native parse first
    let d = new Date(value);
    if (!isNaN(d.getTime())) return d.toLocaleDateString();
    // Try replacing space with 'T' for MySQL-like strings
    d = new Date(String(value).replace(" ", "T"));
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // Client-side validation
      if (!newUser.name.trim()) throw new Error("Name is required");
      if (!validateEmail(newUser.email))
        throw new Error("Valid email is required");
      if (!validatePassword(newUser.password))
        throw new Error("Password must be at least 6 characters");
      if (newUser.role === "student" && !newUser.class_level)
        throw new Error("Class level is required for students");

      const payload = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        class_level: newUser.role === "student" ? newUser.class_level : null,
        password: newUser.password,
      };
      if (newUser.role === "parent") {
        payload.children = newUser.children || [];
      }

      const response = await fetch("http://localhost/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      // Refresh users list
      await fetchUsers();
      setNewUser({
        name: "",
        email: "",
        role: "student",
        class_level: "",
        password: "",
        children: [],
      });
      setShowAddUser(false);
      showToast("success", "User created successfully");
    } catch (err) {
      setError(err.message);
      showToast("error", err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch("http://localhost/api/admin/users", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: userId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete user");
        }

        // Refresh users list
        await fetchUsers();
        showToast("success", "User deleted successfully");
      } catch (err) {
        setError(err.message);
        showToast("error", err.message);
      }
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      // Client-side validation for update
      if (!userData.name?.trim()) throw new Error("Name is required");
      if (!validateEmail(userData.email || ""))
        throw new Error("Valid email is required");
      if (!userData.role) throw new Error("Role is required");
      if (userData.role === "student" && !userData.class_level)
        throw new Error("Class level is required for students");

      // Only include password if provided and valid
      const payload = { ...userData };
      if (!payload.password) {
        delete payload.password;
      } else if (!validatePassword(payload.password)) {
        throw new Error("Password must be at least 6 characters");
      }
      // If editing a parent, include children array explicitly (may be empty)
      if (payload.role === "parent") {
        payload.children = editingChildren;
      } else {
        delete payload.children;
      }

      const response = await fetch("http://localhost/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      // Refresh users list
      await fetchUsers();
      setEditingUser(null);
      setEditingChildren([]);
      showToast("success", "User updated successfully");
    } catch (err) {
      setError(err.message);
      showToast("error", err.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Filter out the current logged-in admin
    const isNotCurrentUser =
      user.id !== currentUser?.user_id && user.email !== currentUser?.email;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return isNotCurrentUser && matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "teacher":
        return "primary";
      case "student":
        return "accent";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Container>
        <Card className="text-center">
          <div className="py-8">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Loading Users
            </h3>
            <p className="text-secondary-600">Fetching user data...</p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      {toast.message && (
        <div
          className={`mb-4 px-4 py-2 rounded-xl border ${toast.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
          role="alert"
        >
          {toast.message}
        </div>
      )}
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2 flex items-center gap-2">
                <UsersIcon size={20} className="text-secondary-700" />
                User Management
              </h2>
              <p className="text-secondary-600">
                Manage system users, roles, and permissions
              </p>
            </div>
            <PrimaryButton
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add New User
            </PrimaryButton>
          </div>
        </Card>

        {/* Filters */}
        <Card
          className="bg-gradient-to-r from-secondary-50 to-primary-50"
          padding="sm"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Users Grid */}
        <ResponsiveGrid cols={{ xs: 1, md: 2, lg: 3 }} gap="lg">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              hover
              className="transition-all duration-200 hover:shadow-red-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">
                      {user.name}
                    </h3>
                    <p className="text-sm text-secondary-600">{user.email}</p>
                  </div>
                </div>
                <Badge
                  variant={user.status === "active" ? "success" : "error"}
                  size="xs"
                >
                  {user.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Role:</span>
                  <Badge variant={getRoleBadgeVariant(user.role)} size="xs">
                    {user.role}
                  </Badge>
                </div>
                {user.class_level && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600">Class:</span>
                    <span className="text-sm font-medium text-secondary-900">
                      {user.class_level}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Joined:</span>
                  <span className="text-sm text-secondary-900">
                    {formatDateSafe(user.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <SecondaryButton
                  size="xs"
                  onClick={async () => {
                    setEditingUser(user);
                    if (user.role === "parent") {
                      await loadParentChildren(user.id);
                    } else {
                      setEditingChildren([]);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Edit3 size={14} />
                  Edit
                </SecondaryButton>
                {user.status === "active" && (
                  <SecondaryButton
                    size="xs"
                    onClick={() => handleToggleStatus(user.id)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <PauseCircle size={14} />
                    Suspend
                  </SecondaryButton>
                )}
                <SecondaryButton
                  size="xs"
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-error hover:bg-error-light flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </SecondaryButton>
              </div>
            </Card>
          ))}
        </ResponsiveGrid>

        {filteredUsers.length === 0 && (
          <Card className="text-center">
            <div className="py-8">
              <div className="text-6xl mb-4 flex items-center justify-center text-secondary-700">
                <UsersIcon size={40} />
              </div>
              <p className="text-lg font-medium text-secondary-900 mb-2">
                No users found
              </p>
              <p className="text-secondary-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        title="Add New User"
        size="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="Enter full name"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="Enter email address"
            required
          />

          <Select
            label="Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="parent">Parent</option>
          </Select>

          {newUser.role === "student" && (
            <Select
              label="Class Level"
              value={newUser.class_level}
              onChange={(e) =>
                setNewUser({ ...newUser, class_level: e.target.value })
              }
              required
            >
              <option value="">Select Class</option>
              {CLASS_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </Select>
          )}

          {newUser.role === "parent" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-700">
                Link Children (Students)
              </label>
              <div className="max-h-48 overflow-y-auto border rounded-xl p-3 space-y-2">
                {users
                  .filter((u) => u.role === "student")
                  .map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={newUser.children.includes(student.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNewUser((prev) => {
                            const set = new Set(prev.children);
                            if (checked) set.add(student.id);
                            else set.delete(student.id);
                            return { ...prev, children: Array.from(set) };
                          });
                        }}
                      />
                      <span>
                        {student.name} ({student.class_level || "N/A"})
                      </span>
                    </label>
                  ))}
                {users.filter((u) => u.role === "student").length === 0 && (
                  <p className="text-sm text-secondary-500">
                    No students available yet.
                  </p>
                )}
              </div>
              <p className="text-xs text-secondary-500">
                Optional: You can also add or change linked children later by
                editing the parent.
              </p>
            </div>
          )}

          <Input
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            placeholder="Enter password"
            required
          />

          <div className="flex gap-3 pt-4">
            <SecondaryButton
              type="button"
              onClick={() => setShowAddUser(false)}
              className="flex-1"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add User
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        size="md"
      >
        {editingUser && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const payload = {
                ...editingUser,
                class_level:
                  editingUser.role === "student"
                    ? editingUser.class_level || ""
                    : null,
              };
              handleUpdateUser(payload);
            }}
            className="space-y-4"
          >
            <Input
              label="Full Name"
              type="text"
              value={editingUser.name || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
              placeholder="Enter full name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={editingUser.email || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              placeholder="Enter email address"
              required
            />

            <Select
              label="Role"
              value={editingUser.role || "student"}
              onChange={(e) => {
                const role = e.target.value;
                setEditingUser({
                  ...editingUser,
                  role,
                  class_level:
                    role === "student" ? editingUser.class_level || "" : "",
                });
                if (role !== "parent") setEditingChildren([]);
              }}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="parent">Parent</option>
            </Select>

            {editingUser.role === "student" && (
              <Select
                label="Class Level"
                value={editingUser.class_level || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    class_level: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Class</option>
                {CLASS_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </Select>
            )}

            {editingUser.role === "parent" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-700">
                  Linked Children (Students)
                </label>
                <div className="max-h-48 overflow-y-auto border rounded-xl p-3 space-y-2">
                  {users
                    .filter((u) => u.role === "student")
                    .map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={editingChildren.includes(student.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEditingChildren((prev) => {
                              const set = new Set(prev);
                              if (checked) set.add(student.id);
                              else set.delete(student.id);
                              return Array.from(set);
                            });
                          }}
                        />
                        <span>
                          {student.name} ({student.class_level || "N/A"})
                        </span>
                      </label>
                    ))}
                  {users.filter((u) => u.role === "student").length === 0 && (
                    <p className="text-sm text-secondary-500">
                      No students available yet.
                    </p>
                  )}
                </div>
                <p className="text-xs text-secondary-500">
                  Optional: You can leave this empty. You can also modify later.
                </p>
              </div>
            )}

            <Input
              label="Password (leave blank to keep current)"
              type="password"
              value={editingUser.password || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, password: e.target.value })
              }
              placeholder="Enter new password"
            />

            <div className="flex gap-3 pt-4">
              <SecondaryButton
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex-1"
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </PrimaryButton>
            </div>
          </form>
        )}
      </Modal>
    </Container>
  );
}
