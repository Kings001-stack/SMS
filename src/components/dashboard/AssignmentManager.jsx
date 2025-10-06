import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Clock,
  Users,
  FileText,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import apiService from "../../utils/apiService";

export default function AssignmentManager({ title = "Assignments" }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [allowedSubjects, setAllowedSubjects] = useState([]);
  const [allowedClasses, setAllowedClasses] = useState([]);

  // Fetch assignments on component mount
  useEffect(() => {
    fetchAssignments();
    fetchAssignmentMeta();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAssignments();
      if (response.status === "success") {
        setAssignments(response.data);
      }
    } catch (err) {
      setError("Failed to load assignments");
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentMeta = async () => {
    try {
      const meta = await apiService.get("/teacher/assignment-meta");
      if (meta?.status === "success") {
        setAllowedSubjects(
          Array.isArray(meta.data?.subjects) ? meta.data.subjects : []
        );
        setAllowedClasses(
          Array.isArray(meta.data?.class_levels) ? meta.data.class_levels : []
        );
      }
    } catch (e) {
      // Non-fatal: keep defaults if meta fails
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    const assignmentData = {
      title: event.target.title.value,
      description: event.target.description.value,
      subject: event.target.subject.value,
      class_level: event.target.class_level.value,
      due_date: event.target.due_date.value,
    };

    try {
      setCreating(true);
      const response = await apiService.createAssignment(assignmentData);
      if (response.status === "success") {
        setAssignments([response.data, ...assignments]);
        // Reset form
        event.target.reset();
        // Close modal (you might want to add modal state management)
      }
    } catch (err) {
      setError("Failed to create assignment");
      console.error("Error creating assignment:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await apiService.deleteAssignment(assignmentId);
      setAssignments(assignments.filter((a) => a.id !== assignmentId));
    } catch (err) {
      setError("Failed to delete assignment");
      console.error("Error deleting assignment:", err);
    }
  };

  const openEdit = (assignment) => {
    setEditing({ ...assignment });
    const dlg = document.getElementById("edit-modal");
    if (dlg) dlg.showModal();
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editing?.id) return;
    try {
      setUpdating(true);
      const payload = {
        title: event.target.title.value,
        description: event.target.description.value,
        subject: event.target.subject.value,
        class_level: event.target.class_level.value,
        due_date: event.target.due_date.value,
      };
      const res = await apiService.updateAssignment(editing.id, payload);
      if (res.status === "success") {
        setAssignments((prev) =>
          prev.map((a) => (a.id === editing.id ? { ...a, ...payload } : a))
        );
        const dlg = document.getElementById("edit-modal");
        if (dlg) dlg.close();
        setEditing(null);
      }
    } catch (err) {
      setError("Failed to update assignment");
      console.error("Error updating assignment:", err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return "bg-red-100 text-red-800"; // Overdue
    if (daysUntilDue <= 3) return "bg-yellow-100 text-yellow-800"; // Due soon
    return "bg-green-100 text-green-800"; // Active
  };

  const getStatusText = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return "overdue";
    if (daysUntilDue === 0) return "due today";
    if (daysUntilDue === 1) return "due tomorrow";
    if (daysUntilDue <= 3) return `due in ${daysUntilDue} days`;
    return "active";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage student assignments
          </p>
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark flex items-center gap-2"
          onClick={() => document.getElementById("create-modal").showModal()}
        >
          <Plus size={16} />
          Create Assignment
        </motion.button>
      </div>

      {/* Create Modal */}
      <dialog id="create-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create New Assignment</h3>
          <form onSubmit={handleCreate} className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                name="title"
                type="text"
                required
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                placeholder="Enter assignment title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                rows="3"
                placeholder="Assignment description and instructions"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  required
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  <option value="">Select Subject</option>
                  {(allowedSubjects.length > 0
                    ? allowedSubjects
                    : [
                        "Mathematics",
                        "Science",
                        "English",
                        "History",
                        "Geography",
                        "Literature",
                      ]
                  ).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Class Level
                </label>
                <select
                  name="class_level"
                  required
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  <option value="">Select Class</option>
                  {(allowedClasses.length > 0
                    ? allowedClasses
                    : ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"]
                  ).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                name="due_date"
                type="date"
                required
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => document.getElementById("create-modal").close()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Assignment"}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Assignment Cards */}
      <div className="space-y-4">
        {assignments.map((assignment, index) => (
          <motion.div
            key={assignment.id}
            className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assignment.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.due_date)}`}
                  >
                    {getStatusText(assignment.due_date)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {assignment.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {assignment.class_level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {assignment.description}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-blue-600">
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => openEdit(assignment)}
                  className="p-2 text-gray-400 hover:text-green-600"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(assignment.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-gray-600">
                    {assignment.total_students || 25} students
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-orange-400" />
                  <span className="text-gray-600">
                    {assignment.submission_count || 0} submitted
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-600">
                  {new Date(assignment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {assignments.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No assignments yet
          </h3>
          <p className="text-gray-600">
            Create your first assignment to get started
          </p>
        </div>
      )}

      {/* Edit Modal */}
      <dialog id="edit-modal" className="modal">
        <div className="modal-box">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">Edit Assignment</h3>
            <button
              onClick={() => {
                document.getElementById("edit-modal").close();
                setEditing(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          {editing && (
            <form onSubmit={handleUpdate} className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  name="title"
                  type="text"
                  defaultValue={editing.title}
                  required
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editing.description}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <select
                    name="subject"
                    defaultValue={editing.subject}
                    required
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                  >
                    {(allowedSubjects.length > 0
                      ? allowedSubjects
                      : [
                          "Mathematics",
                          "Science",
                          "English",
                          "History",
                          "Geography",
                          "Literature",
                        ]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Class Level
                  </label>
                  <select
                    name="class_level"
                    defaultValue={editing.class_level}
                    required
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                  >
                    {(allowedClasses.length > 0
                      ? allowedClasses
                      : ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"]
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Due Date
                </label>
                <input
                  name="due_date"
                  type="date"
                  defaultValue={editing.due_date?.slice(0, 10)}
                  required
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    document.getElementById("edit-modal").close();
                    setEditing(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </div>
  );
}
