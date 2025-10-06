import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import axios from 'axios';
import SUBJECTS from '../../constants/subjects';
import CLASS_LEVELS from '../../constants/classLevels';

export default function ClassManager({ isOpen, onClose }) {
  const { user, token } = useAuth();
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    class_level: '',
    subject: '',
    is_primary: false
  });
  const [submitting, setSubmitting] = useState(false);

  // Centralized class levels

  useEffect(() => {
    if (isOpen) {
      fetchTeacherClasses();
    }
  }, [isOpen]);

  const fetchTeacherClasses = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost/api/resources/teacher-classes', { headers });

      if (response.data.success) {
        setTeacherClasses(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch teacher classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    
    if (!formData.class_level || !formData.subject) {
      alert('Please select both class level and subject');
      return;
    }

    try {
      setSubmitting(true);
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        teacher_id: user.id,
        class_level: formData.class_level,
        subject: formData.subject,
        is_primary: formData.is_primary
      };

      const response = await axios.post('http://localhost/api/resources/assign-class', payload, { headers });

      if (response.data.success) {
        alert('Class assignment added successfully!');
        setShowAddForm(false);
        setFormData({ class_level: '', subject: '', is_primary: false });
        fetchTeacherClasses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add class assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveClass = async (classId) => {
    if (!confirm('Are you sure you want to remove this class assignment?')) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(`http://localhost/api/resources/teacher-classes/${classId}`, { headers });

      if (response.data.success) {
        alert('Class assignment removed successfully!');
        fetchTeacherClasses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove class assignment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Manage Your Classes</h3>
            <p className="text-sm text-gray-600 mt-1">
              Add or remove class assignments to control which classes you can share resources with
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">
            <p className="font-medium">Error loading classes</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={fetchTeacherClasses}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Classes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Your Current Classes</h4>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add New Class
                </button>
              </div>

              {teacherClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-3a1 1 0 011-1h4a1 1 0 011 1v3M9 21h6" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">No classes assigned</p>
                  <p className="text-sm mt-1">Add your first class to start sharing resources</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Class
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacherClasses.map((tc) => (
                    <div key={tc.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {tc.class_level}
                            </span>
                            {tc.is_primary && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                Primary
                              </span>
                            )}
                          </div>
                          <h5 className="font-medium text-gray-900">{tc.subject}</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {tc.student_count} students enrolled
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Added: {new Date(tc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveClass(tc.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Remove class assignment"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Class Form */}
            {showAddForm && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Class Assignment</h4>
                <form onSubmit={handleAddClass} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class Level *
                      </label>
                      <select
                        value={formData.class_level}
                        onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Class Level</option>
                        {CLASS_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Subject</option>
                        {SUBJECTS.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_primary}
                        onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Primary teacher for this class/subject
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Primary teachers have additional responsibilities and permissions
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setFormData({ class_level: '', subject: '', is_primary: false });
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Adding...' : 'Add Class'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">How Class Assignments Work</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You can only share resources with classes you're assigned to</li>
                <li>• Primary teachers have additional oversight for their classes</li>
                <li>• Students can only see resources shared with their specific class</li>
                <li>• Admins can assign any teacher to any class</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
