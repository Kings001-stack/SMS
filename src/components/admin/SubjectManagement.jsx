import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
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
  LoadingSpinner
} from '../theme/ThemeComponents.jsx';

export default function SubjectManagement() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });

  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    is_core: false
  });

  const categories = [
    'Science',
    'Languages',
    'Mathematics',
    'Social Studies',
    'Arts',
    'Technology',
    'Physical Education',
    'Commercial',
    'Vocational',
    'Religious Studies'
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/api/admin/subjects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSubjects(data.data || []);
      }
    } catch (err) {
      showToast('error', 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/api/admin/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSubject)
      });

      const data = await response.json();
      if (data.status === 'success') {
        showToast('success', 'Subject created successfully');
        setShowAddSubject(false);
        resetForm();
        fetchSubjects();
      } else {
        showToast('error', data.message || 'Failed to create subject');
      }
    } catch (err) {
      showToast('error', 'Failed to create subject');
    }
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/api/admin/subjects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingSubject)
      });

      const data = await response.json();
      if (data.status === 'success') {
        showToast('success', 'Subject updated successfully');
        setEditingSubject(null);
        fetchSubjects();
      } else {
        showToast('error', data.message || 'Failed to update subject');
      }
    } catch (err) {
      showToast('error', 'Failed to update subject');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost/api/admin/subjects', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.status === 'success') {
        showToast('success', 'Subject deleted successfully');
        fetchSubjects();
      } else {
        showToast('error', data.message || 'Failed to delete subject');
      }
    } catch (err) {
      showToast('error', 'Failed to delete subject');
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 3000);
  };

  const resetForm = () => {
    setNewSubject({
      name: '',
      code: '',
      description: '',
      category: '',
      is_core: false
    });
  };

  if (loading) {
    return (
      <Container>
        <Card className="text-center">
          <div className="py-8">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Loading Subjects</h3>
            <p className="text-secondary-600">Fetching subject data...</p>
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
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
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
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                📚 Subject Management
              </h2>
              <p className="text-secondary-600">
                Create and manage school subjects dynamically
              </p>
            </div>
            <PrimaryButton onClick={() => setShowAddSubject(true)}>
              ➕ Add New Subject
            </PrimaryButton>
          </div>
        </Card>

        {/* Subjects Grid */}
        <ResponsiveGrid cols={{ xs: 1, md: 2, lg: 3 }} gap="lg">
          {subjects.map((subject) => (
            <Card key={subject.id} hover className="transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-secondary-900">{subject.name}</h3>
                  <p className="text-sm text-secondary-600">Code: {subject.code}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant={subject.is_active ? 'success' : 'error'} size="xs">
                    {subject.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {subject.is_core && (
                    <Badge variant="primary" size="xs">
                      Core
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {subject.category && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600">Category:</span>
                    <Badge variant="secondary" size="xs">{subject.category}</Badge>
                  </div>
                )}
                {subject.description && (
                  <div>
                    <span className="text-sm text-secondary-600">Description:</span>
                    <p className="text-sm text-secondary-900 mt-1">{subject.description}</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Teachers:</span>
                  <Badge variant="accent" size="xs">{subject.teacher_count || 0}</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <SecondaryButton
                  size="xs"
                  onClick={() => setEditingSubject(subject)}
                  className="flex-1"
                >
                  ✏️ Edit
                </SecondaryButton>
                <SecondaryButton
                  size="xs"
                  onClick={() => handleDeleteSubject(subject.id)}
                  className="text-error hover:bg-error-light"
                >
                  🗑️ Delete
                </SecondaryButton>
              </div>
            </Card>
          ))}
        </ResponsiveGrid>

        {subjects.length === 0 && (
          <Card className="text-center">
            <div className="py-8">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg font-medium text-secondary-900 mb-2">No subjects found</p>
              <p className="text-secondary-600 mb-4">Create your first subject to get started</p>
              <PrimaryButton onClick={() => setShowAddSubject(true)}>
                ➕ Add New Subject
              </PrimaryButton>
            </div>
          </Card>
        )}
      </div>

      {/* Add Subject Modal */}
      <Modal
        isOpen={showAddSubject}
        onClose={() => setShowAddSubject(false)}
        title="➕ Add New Subject"
        size="md"
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <Input
            label="Subject Name"
            type="text"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            placeholder="e.g., Mathematics"
            required
          />

          <Input
            label="Subject Code"
            type="text"
            value={newSubject.code}
            onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
            placeholder="e.g., MATH"
            required
          />

          <Select
            label="Category"
            value={newSubject.category}
            onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Description
            </label>
            <textarea
              value={newSubject.description}
              onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
              placeholder="Brief description of the subject"
              rows={3}
              className="w-full px-3 py-2 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_core"
              checked={newSubject.is_core}
              onChange={(e) => setNewSubject({ ...newSubject, is_core: e.target.checked })}
            />
            <label htmlFor="is_core" className="text-sm text-secondary-700">
              Core Subject (Required for all students)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <SecondaryButton
              type="button"
              onClick={() => setShowAddSubject(false)}
              className="flex-1"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" className="flex-1">
              ➕ Add Subject
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        title="✏️ Edit Subject"
        size="md"
      >
        {editingSubject && (
          <form onSubmit={handleUpdateSubject} className="space-y-4">
            <Input
              label="Subject Name"
              type="text"
              value={editingSubject.name}
              onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
              required
            />

            <Input
              label="Subject Code"
              type="text"
              value={editingSubject.code}
              onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value.toUpperCase() })}
              required
            />

            <Select
              label="Category"
              value={editingSubject.category || ''}
              onChange={(e) => setEditingSubject({ ...editingSubject, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description
              </label>
              <textarea
                value={editingSubject.description || ''}
                onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
                placeholder="Brief description of the subject"
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_is_core"
                checked={editingSubject.is_core}
                onChange={(e) => setEditingSubject({ ...editingSubject, is_core: e.target.checked })}
              />
              <label htmlFor="edit_is_core" className="text-sm text-secondary-700">
                Core Subject (Required for all students)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_is_active"
                checked={editingSubject.is_active}
                onChange={(e) => setEditingSubject({ ...editingSubject, is_active: e.target.checked })}
              />
              <label htmlFor="edit_is_active" className="text-sm text-secondary-700">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <SecondaryButton
                type="button"
                onClick={() => setEditingSubject(null)}
                className="flex-1"
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" className="flex-1">
                💾 Save Changes
              </PrimaryButton>
            </div>
          </form>
        )}
      </Modal>
    </Container>
  );
}
