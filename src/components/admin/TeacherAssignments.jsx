import { useState, useEffect } from "react";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Card,
  PrimaryButton,
  SecondaryButton,
  Badge,
  Select,
  Modal,
  Container,
  LoadingSpinner,
} from "../theme/ThemeComponents.jsx";

export default function TeacherAssignments() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  const [newAssignment, setNewAssignment] = useState({
    teacher_id: "",
    class_ids: [],
    subject_ids: [],
    is_class_teacher: false,
    academic_year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAssignments(),
        fetchTeachers(),
        fetchClasses(),
        fetchSubjects(),
      ]);
    } catch (err) {
      showToast("error", "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        "http://localhost/api/admin/teacher-assignments",
        {
        headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setAssignments(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch(
        "http://localhost/api/admin/available-teachers",
        {
        headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setTeachers(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost/api/classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.status === "success") {
        setClasses(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("http://localhost/api/subjects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.status === "success") {
        setSubjects(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost/api/admin/teacher-assignments",
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teacher_id: newAssignment.teacher_id,
            class_ids: newAssignment.class_ids,
            subject_ids: newAssignment.subject_ids,
            is_class_teacher: newAssignment.is_class_teacher,
            academic_year: newAssignment.academic_year,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        showToast("success", "Teacher assigned successfully");
        setShowAddAssignment(false);
        resetForm();
        fetchAssignments();
      } else {
        showToast("error", data.message || "Failed to assign teacher");
      }
    } catch (err) {
      showToast("error", "Failed to assign teacher");
    }
  };

  const handleRemoveAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to remove this assignment?")) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/api/admin/teacher-assignments",
        {
          method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
          body: JSON.stringify({ id }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        showToast("success", "Assignment removed successfully");
        fetchAssignments();
      } else {
        showToast("error", data.message || "Failed to remove assignment");
      }
    } catch (err) {
      showToast("error", "Failed to remove assignment");
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3000);
  };

  const resetForm = () => {
    setNewAssignment({
      teacher_id: "",
      class_ids: [],
      subject_ids: [],
      is_class_teacher: false,
      academic_year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    });
  };

  const toggleId = (field, id) => {
    setNewAssignment((prev) => {
      const list = Array.isArray(prev[field]) ? prev[field] : [];
      const exists = list.includes(id);
      return {
        ...prev,
        [field]: exists ? list.filter((x) => x !== id) : [...list, id],
      };
    });
  };

  // Group assignments by teacher
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const teacherId = assignment.teacher_id;
    if (!acc[teacherId]) {
      acc[teacherId] = {
        teacher_name: assignment.teacher_name,
        teacher_email: assignment.teacher_email,
        assignments: [],
      };
    }
    acc[teacherId].assignments.push(assignment);
    return acc;
  }, {});

  if (loading) {
    return (
      <Container>
        <Card className="text-center">
          <div className="py-8">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Loading Assignments
            </h3>
            <p className="text-secondary-600">
              Fetching teacher assignment data...
            </p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      {toast.message && (
        <div
          className={`mb-4 px-4 py-2 rounded-xl border ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
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
                <GraduationCap size={20} className="text-secondary-700" />
                Teacher Assignments
              </h2>
              <p className="text-secondary-600">
                Assign teachers to classes and subjects
              </p>
            </div>
            <PrimaryButton
              onClick={() => setShowAddAssignment(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Assign Teacher
            </PrimaryButton>
          </div>
        </Card>

        {/* Assignments by Teacher - compact grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(groupedAssignments).map(([teacherId, data]) => (
            <Card
              key={teacherId}
              className="bg-white border border-secondary-200/70 shadow-sm"
            >
              <div className="mb-3 pb-3 border-b border-secondary-200/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-secondary-900 text-base leading-tight">
                      {data.teacher_name}
                    </h3>
                    <p className="text-xs text-secondary-600 leading-snug">
                      {data.teacher_email}
                    </p>
                  </div>
                  <Badge variant="primary" size="xs">
                    {data.assignments.length}{" "}
                    {data.assignments.length === 1 ? "Item" : "Items"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                {data.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between px-2 py-2 bg-secondary-50/60 rounded-md hover:bg-secondary-100 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <Badge variant="accent" size="xs">
                          {assignment.class_name}
                        </Badge>
                        <span className="text-secondary-300 text-xs">•</span>
                        <Badge variant="secondary" size="xs">
                          {assignment.subject_name}
                        </Badge>
                        {assignment.is_class_teacher && (
                          <>
                            <span className="text-secondary-300 text-xs">
                              •
                            </span>
                            <Badge variant="success" size="xs">
                              Class Teacher
                            </Badge>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] text-secondary-600 truncate">
                        AY: {assignment.academic_year}
                      </p>
                    </div>
                    <SecondaryButton
                      size="xs"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      className="text-error hover:bg-error-light !px-2 !py-1 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                    </SecondaryButton>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {assignments.length === 0 && (
          <Card className="text-center">
            <div className="py-8">
              <div className="text-6xl mb-4 flex items-center justify-center text-secondary-700">
                <GraduationCap size={40} />
              </div>
              <p className="text-lg font-medium text-secondary-900 mb-2">
                No assignments found
              </p>
              <p className="text-secondary-600 mb-4">
                Assign teachers to classes and subjects to get started
              </p>
              <PrimaryButton
                onClick={() => setShowAddAssignment(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Assign Teacher
              </PrimaryButton>
            </div>
          </Card>
        )}
      </div>

      {/* Add Assignment Modal */}
      <Modal
        isOpen={showAddAssignment}
        onClose={() => setShowAddAssignment(false)}
        title="➕ Assign Teacher to Class & Subject"
        size="md"
      >
        <form onSubmit={handleAddAssignment} className="space-y-4">
          <Select
            label="Teacher"
            value={newAssignment.teacher_id}
            onChange={(e) =>
              setNewAssignment({ ...newAssignment, teacher_id: e.target.value })
            }
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </Select>

          <div>
            <p className="block text-sm font-medium text-secondary-700 mb-2">
              Classes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-auto p-2 border border-secondary-200 rounded-lg">
              {classes
                .filter((c) => c.is_active)
                .map((classItem) => (
                  <label
                    key={classItem.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={newAssignment.class_ids.includes(classItem.id)}
                      onChange={() => toggleId("class_ids", classItem.id)}
                    />
                    <span>
                      {classItem.name}{" "}
                      {classItem.section ? `- ${classItem.section}` : ""}
                    </span>
                  </label>
                ))}
            </div>
          </div>

          <div>
            <p className="block text-sm font-medium text-secondary-700 mb-2">
              Subjects
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-auto p-2 border border-secondary-200 rounded-lg">
              {subjects
                .filter((s) => s.is_active)
                .map((subject) => (
                  <label
                    key={subject.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={newAssignment.subject_ids.includes(subject.id)}
                      onChange={() => toggleId("subject_ids", subject.id)}
                    />
                    <span>
                {subject.name} ({subject.code})
                    </span>
                  </label>
            ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_class_teacher"
              checked={newAssignment.is_class_teacher}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  is_class_teacher: e.target.checked,
                })
              }
            />
            <label
              htmlFor="is_class_teacher"
              className="text-sm text-secondary-700"
            >
              Make this teacher the Class Teacher (Form Teacher)
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will assign the selected teacher to
              teach the chosen subject in the selected class.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <SecondaryButton
              type="button"
              onClick={() => setShowAddAssignment(false)}
              className="flex-1"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" className="flex-1">
              ➕ Assign Teacher
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </Container>
  );
}
