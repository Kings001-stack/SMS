import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Card,
  PrimaryButton,
  Container,
  ResponsiveGrid,
} from "../theme/ThemeComponents.jsx";
import SUBJECTS from "../../constants/subjects";
import CLASS_LEVELS from "../../constants/classLevels";
import apiService from "../../utils/apiService";

const AssignmentList = () => {
  const { user, token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "",
    due_date: "",
    class_level: "",
  });
  const [editing, setEditing] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [submission, setSubmission] = useState({
    assignment_id: "",
    submission_text: "",
    file: null,
  });
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [teacherClassesError, setTeacherClassesError] = useState("");

  const userRole = user?.role?.toLowerCase();
  const isTeacher = userRole === "teacher";

  useEffect(() => {
    fetchAssignments();
    if (userRole === "student") {
      fetchSubmissions();
    }
    if (isTeacher) {
      fetchTeacherClasses();
    }
  }, [userRole]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost/api/assignments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const result = await response.json();
      setAssignments(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSubmission((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleSubmissionOpen = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmission({
      assignment_id: assignment.id,
      submission_text: "",
      file: null,
    });
    setSubmissionError("");
    setShowSubmitForm(true);
  };

  const handleSubmissionCancel = () => {
    setShowSubmitForm(false);
    setSelectedAssignment(null);
    setSubmission({
      assignment_id: "",
      submission_text: "",
      file: null,
    });
    setSubmissionError("");
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("http://localhost/api/submissions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSubmissions(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const fetchTeacherClasses = async () => {
    try {
      setClassesLoading(true);
      setTeacherClassesError("");
      const response = await fetch("http://localhost/api/resources/teacher-classes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to load assigned classes");
      }

      const data = await response.json();
      const normalized = Array.isArray(data?.data)
        ? data.data.map((tc) => ({
            ...tc,
            subject: (tc.subject || "").trim(),
            class_level: (tc.class_level || "").trim(),
          }))
        : [];
      setTeacherClasses(normalized);
    } catch (err) {
      setTeacherClasses([]);
      setTeacherClassesError(err.message || "Unable to load assigned classes");
    } finally {
      setClassesLoading(false);
    }
  };

  const teacherSubjects = useMemo(() => {
    if (!isTeacher) return SUBJECTS;
    const subjects = new Set();
    teacherClasses.forEach((tc) => {
      const subject = (tc.subject || "").trim();
      if (subject) {
        subjects.add(subject);
      }
    });
    return Array.from(subjects);
  }, [isTeacher, teacherClasses]);

  const teacherClassLevels = useMemo(() => {
    if (!isTeacher) return CLASS_LEVELS;
    const levels = new Set();
    teacherClasses.forEach((tc) => {
      const level = (tc.class_level || "").trim();
      if (level) {
        levels.add(level);
      }
    });
    return Array.from(levels);
  }, [isTeacher, teacherClasses]);

  const getClassOptionsForSubject = (subject) => {
    if (!isTeacher) return CLASS_LEVELS;
    const normalizedSubject = (subject || "").trim().toLowerCase();
    const matches = teacherClasses
      .filter((tc) => (tc.subject || "").trim().toLowerCase() === normalizedSubject)
      .map((tc) => (tc.class_level || "").trim())
      .filter(Boolean);
    if (matches.length) {
      return Array.from(new Set(matches));
    }
    return teacherClassLevels;
  };

  const availableClassLevels = useMemo(() => {
    if (!isTeacher) return CLASS_LEVELS;
    return getClassOptionsForSubject(newAssignment.subject);
  }, [isTeacher, newAssignment.subject, teacherClasses]);

  const handleToggleCreateForm = () => {
    if (!showCreateForm) {
      const defaultSubject = isTeacher ? teacherSubjects[0] || "" : "";
      const defaultClass = isTeacher
        ? (defaultSubject ? getClassOptionsForSubject(defaultSubject)[0] : teacherClassLevels[0]) || ""
        : "";
      setNewAssignment({
        title: "",
        description: "",
        subject: defaultSubject,
        due_date: "",
        class_level: defaultClass,
      });
      setFormError("");
    }
    setShowCreateForm((prev) => !prev);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setFormError("");

    if (isTeacher) {
      const selectedSubject = (newAssignment.subject || "").trim().toLowerCase();
      const selectedClass = (newAssignment.class_level || "").trim().toLowerCase();
      const hasPermission = teacherClasses.some((tc) => {
        const tcSubject = (tc.subject || "").trim().toLowerCase();
        const tcClass = (tc.class_level || "").trim().toLowerCase();
        return tcSubject === selectedSubject && tcClass === selectedClass;
      });

      if (!hasPermission) {
        setFormError(
          "The selected subject and class are not assigned to you. Please choose a combination from your Assigned Classes list."
        );
        return;
      }
    }

    try {
      const response = await fetch("http://localhost/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAssignment),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to create assignment");
      }

      setShowCreateForm(false);
      setNewAssignment({
        title: "",
        description: "",
        subject: "",
        due_date: "",
        class_level: "",
      });
      fetchAssignments();
    } catch (err) {
      setFormError(err.message || "Failed to create assignment");
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      const res = await apiService.deleteAssignment(id);
      if (res.status === "success") {
        setAssignments((prev) => prev.filter((a) => a.id !== id));
      } else {
        throw new Error(res.message || "Delete failed");
      }
    } catch (err) {
      setError(err.message || "Failed to delete assignment");
    }
  };

  const openEdit = (assignment) => {
    setEditing({ ...assignment });
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!editing?.id) return;
    try {
      setUpdating(true);
      const payload = {
        title: editing.title,
        description: editing.description,
        subject: editing.subject,
        class_level: editing.class_level,
        due_date: (editing.due_date || "").slice(0, 10),
      };
      const res = await apiService.updateAssignment(editing.id, payload);
      if (res.status === "success") {
        setAssignments((prev) =>
          prev.map((a) => (a.id === editing.id ? { ...a, ...payload } : a))
        );
        setEditing(null);
      } else {
        throw new Error(res.message || "Update failed");
      }
    } catch (err) {
      setError(err.message || "Failed to update assignment");
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setSubmissionError("");

    if (!submission.submission_text.trim() && !submission.file) {
      setSubmissionError("Please provide submission text or attach a file before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("assignment_id", submission.assignment_id);
      formData.append("submission_text", submission.submission_text);
      if (submission.file) {
        formData.append("file", submission.file);
      }

      const response = await fetch("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to submit assignment");
      }

      setShowSubmitForm(false);
      setSubmission({
        assignment_id: "",
        submission_text: "",
        file: null,
      });
      setSubmissionError("");
      fetchSubmissions();
    } catch (err) {
      setSubmissionError(err.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      const response = await fetch(
        `http://localhost/api/submissions/${submissionId}/grade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ grade, feedback }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to grade submission");
      }

      fetchSubmissions();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (dueDate, submitted = false) => {
    const now = new Date();
    const due = new Date(dueDate);

    if (submitted) return "bg-green-100 text-green-800 border-green-200";
    if (due < now) return "bg-red-100 text-red-800 border-red-200";
    if (due - now < 24 * 60 * 60 * 1000)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getSubmissionStatus = (assignmentId) => {
    return submissions.find((sub) => sub.assignment_id === assignmentId);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading assignments...</p>
            </div>
          </div>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error Loading Assignments
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <PrimaryButton onClick={fetchAssignments}>Try Again</PrimaryButton>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Assignments
            </h1>
            <p className="text-secondary-600 mt-1">
              {userRole === "student"
                ? "View and submit your assignments on time"
                : "Create assignments and grade student submissions"}
            </p>
          </div>

          {(userRole === "teacher" || userRole === "admin") && (
            <PrimaryButton
              onClick={handleToggleCreateForm}
              className="flex items-center gap-2"
            >
              <span>➕</span>
              New Assignment
            </PrimaryButton>
          )}
        </div>

        {/* Create Assignment Form */}
        {showCreateForm && (
          <Card className="bg-primary-50 border-primary-200">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">
              Create New Assignment
            </h3>
            {isTeacher && (
              <div className="mb-4 rounded-lg border border-secondary-200 bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-secondary-800">Assigned Subjects &amp; Classes</h4>
                  {classesLoading && (
                    <span className="text-xs text-secondary-500">Loading…</span>
                  )}
                </div>
                {teacherClassesError && (
                  <p className="text-sm text-red-600">{teacherClassesError}</p>
                )}
                {!classesLoading && !teacherClassesError && teacherClasses.length === 0 && (
                  <p className="text-sm text-secondary-600">
                    No classes have been assigned to you yet. Please contact an administrator to set up your teaching subjects.
                  </p>
                )}
                {!classesLoading && teacherClasses.length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(
                      teacherClasses.reduce((acc, tc) => {
                        const subjectKey = (tc.subject || "Unspecified Subject").trim() || "Unspecified Subject";
                        if (!acc[subjectKey]) acc[subjectKey] = [];
                        const classLevel = (tc.class_level || "Unspecified Class").trim() || "Unspecified Class";
                        if (!acc[subjectKey].includes(classLevel)) {
                          acc[subjectKey].push(classLevel);
                        }
                        return acc;
                      }, {})
                    ).map(([subjectName, classLevels]) => (
                      <div key={`${subjectName}-${classLevels.join("-")}`}>
                        <p className="text-sm font-medium text-secondary-900">{subjectName}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {classLevels.map((level) => (
                            <span
                              key={`${subjectName}-${level}`}
                              className="inline-flex items-center rounded-full bg-secondary-100 px-3 py-1 text-xs text-secondary-700 border border-secondary-200"
                            >
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={newAssignment.subject}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Subject</option>
                    {(isTeacher ? teacherSubjects : SUBJECTS).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Class Level
                  </label>
                  <select
                    value={newAssignment.class_level}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        class_level: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Class</option>
                    {(isTeacher ? availableClassLevels : CLASS_LEVELS).map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newAssignment.due_date}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        due_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <PrimaryButton
                  type="submit"
                  disabled={isTeacher && (classesLoading || teacherClasses.length === 0)}
                >
                  Create Assignment
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormError("");
                  }}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-800 border border-secondary-300 rounded-lg hover:bg-secondary-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Submit Assignment Form */}
        {showSubmitForm && selectedAssignment && (
          <Card className="bg-accent-50 border-accent-200">
            <h3 className="text-lg font-semibold text-accent-900 mb-4">
              Submit Assignment: {selectedAssignment.title}
            </h3>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Your Submission
                </label>
                <textarea
                  value={submission.submission_text}
                  onChange={(e) =>
                    setSubmission({
                      ...submission,
                      submission_text: e.target.value,
                    })
                  }
                  rows={6}
                  placeholder="Type your response (optional if you upload a file)..."
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Optional File Upload
                </label>
                <input
                  type="file"
                  onChange={handleSubmissionFileChange}
                  className="w-full text-sm text-secondary-700"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                />
                {submission.file && (
                  <p className="mt-2 text-xs text-secondary-500">
                    Selected: {submission.file.name} ({Math.round(submission.file.size / 1024)} KB)
                  </p>
                )}
              </div>

              {submissionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submissionError}
                </div>
              )}

              <div className="flex gap-2">
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Assignment"}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={handleSubmissionCancel}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-800 border border-secondary-300 rounded-lg hover:bg-secondary-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  No Assignments
                </h3>
                <p className="text-secondary-600">
                  {userRole === "student"
                    ? "No assignments have been assigned yet. Check back later!"
                    : "Create your first assignment to get started."}
                </p>
              </div>
            </Card>
          ) : (
            assignments.map((assignment) => {
              const studentSubmission = getSubmissionStatus(assignment.id);
              const overdue = isOverdue(assignment.due_date);

              return (
                <Card
                  key={assignment.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-secondary-900">
                          {assignment.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.due_date, !!studentSubmission)}`}
                        >
                          {studentSubmission
                            ? "SUBMITTED"
                            : overdue
                              ? "OVERDUE"
                              : "PENDING"}
                        </span>
                        <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs border">
                          {assignment.subject}
                        </span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs border">
                          {assignment.class_level}
                        </span>
                      </div>

                      <p className="text-secondary-700 mb-3 whitespace-pre-wrap">
                        {assignment.description}
                      </p>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-secondary-500">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <span>Due: {formatDate(assignment.due_date)}</span>
                          {studentSubmission && (
                            <span className="text-green-600">
                              Submitted: {formatDate(studentSubmission.submitted_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {userRole === "student" && !studentSubmission && (
                        <div className="mt-4">
                          <PrimaryButton onClick={() => handleSubmissionOpen(assignment)} size="sm">
                            Submit Assignment
                          </PrimaryButton>
                        </div>
                      )}

                      {userRole === "teacher" && studentSubmission && (
                        <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
                          <h4 className="font-medium text-secondary-900 mb-2">
                            Latest Submission
                          </h4>
                          {studentSubmission.submission_text ? (
                            <p className="text-sm text-secondary-700 mb-2 whitespace-pre-wrap">
                              {studentSubmission.submission_text}
                            </p>
                          ) : (
                            <p className="text-sm text-secondary-500 mb-2">
                              No written response provided.
                            </p>
                          )}
                          {studentSubmission.file_path && (
                            <div className="mb-3 text-sm">
                              <a
                                href={`http://localhost/api/${studentSubmission.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:underline"
                              >
                                Download attachment ({studentSubmission.file_name || "file"})
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Grade"
                              className="px-2 py-1 border border-secondary-300 rounded text-sm w-20"
                              min="0"
                            />
                            <input
                              type="text"
                              placeholder="Feedback"
                              className="px-2 py-1 border border-secondary-300 rounded text-sm flex-1"
                            />
                            <PrimaryButton size="sm">Grade</PrimaryButton>
                          </div>
                        </div>
                      )}

                      {(userRole === "teacher" || userRole === "admin") && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => openEdit(assignment)}
                            className="px-3 py-2 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteAssignment(assignment.id)
                            }
                            className="px-3 py-2 text-red-700 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Edit Assignment</h3>
            <form onSubmit={handleUpdateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editing.title || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editing.description || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={editing.subject || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Subject</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Class Level
                  </label>
                  <select
                    value={editing.class_level || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, class_level: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Class</option>
                    {CLASS_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={(editing.due_date || "").slice(0, 10)}
                  onChange={(e) =>
                    setEditing({ ...editing, due_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-secondary-700 border border-secondary-300 rounded-lg hover:bg-secondary-50"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit" disabled={updating}>
                  {updating ? "Saving..." : "Save Changes"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AssignmentList;
