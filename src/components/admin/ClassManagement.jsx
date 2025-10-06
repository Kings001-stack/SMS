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

export default function ClassManagement() {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClass, setShowAddClass] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });

  const [newClass, setNewClass] = useState({
    name: '',
    code: '',
    level: 7,
    section: '',
    capacity: 40,
    academic_year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/api/admin/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setClasses(data.data || []);
      }
    } catch (err) {
      showToast('error', 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newClass)
      });

      const data = await response.json();
      if (data.status === 'success') {
        showToast('success', 'Class created successfully');
        setShowAddClass(false);
        resetForm();
        fetchClasses();
      } else {
        showToast('error', data.message || 'Failed to create class');
      }
    } catch (err) {
      showToast('error', 'Failed to create class');
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/api/admin/classes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingClass)
      });

      const data = await response.json();
      if (data.status === 'success') {
        showToast('success', 'Class updated successfully');
        setEditingClass(null);
        fetchClasses();
      } else {
        showToast('error', data.message || 'Failed to update class');
      }
    } catch (err) {
      showToast('error', 'Failed to update class');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost/api/admin/classes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.status === 'success') {
        showToast('success', 'Class deleted successfully');
        fetchClasses();
      } else {
        showToast('error', data.message || 'Failed to delete class');
      }
    } catch (err) {
      showToast('error', 'Failed to delete class');
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 3000);
  };

  const resetForm = () => {
    setNewClass({
      name: '',
      code: '',
      level: 7,
      section: '',
      capacity: 40,
      academic_year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
    });
  };

  const getLevelName = (level) => {
    const levels = {
      7: 'JSS 1',
      8: 'JSS 2',
      9: 'JSS 3',
      10: 'SS 1',
      11: 'SS 2',
      12: 'SS 3'
    };
    return levels[level] || `Level ${level}`;
  };

  if (loading) {
    return (
      <Container>
        <Card className="text-center">
          <div className="py-8">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Loading Classes</h3>
            <p className="text-secondary-600">Fetching class data...</p>
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
                🏫 Class Management
              </h2>
              <p className="text-secondary-600">
                Create and manage school classes dynamically
              </p>
            </div>
            <PrimaryButton onClick={() => setShowAddClass(true)}>
              ➕ Add New Class
            </PrimaryButton>
          </div>
        </Card>

        {/* Classes Grid */}
        <ResponsiveGrid cols={{ xs: 1, md: 2, lg: 3 }} gap="lg">
          {classes.map((classItem) => (
            <Card key={classItem.id} hover className="transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-secondary-900">{classItem.name}</h3>
                  <p className="text-sm text-secondary-600">Code: {classItem.code}</p>
                </div>
                <Badge variant={classItem.is_active ? 'success' : 'error'} size="xs">
                  {classItem.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Level:</span>
                  <span className="text-sm font-medium text-secondary-900">
                    {getLevelName(classItem.level)}
                  </span>
                </div>
                {classItem.section && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600">Section:</span>
                    <span className="text-sm font-medium text-secondary-900">{classItem.section}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Capacity:</span>
                  <span className="text-sm font-medium text-secondary-900">{classItem.capacity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Students:</span>
                  <Badge variant="primary" size="xs">{classItem.student_count || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Teachers:</span>
                  <Badge variant="accent" size="xs">{classItem.teacher_count || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Academic Year:</span>
                  <span className="text-sm text-secondary-900">{classItem.academic_year}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <SecondaryButton
                  size="xs"
                  onClick={() => setEditingClass(classItem)}
                  className="flex-1"
                >
                  ✏️ Edit
                </SecondaryButton>
                <SecondaryButton
                  size="xs"
                  onClick={() => handleDeleteClass(classItem.id)}
                  className="text-error hover:bg-error-light"
                >
                  🗑️ Delete
                </SecondaryButton>
              </div>
            </Card>
          ))}
        </ResponsiveGrid>

        {classes.length === 0 && (
          <Card className="text-center">
            <div className="py-8">
              <div className="text-6xl mb-4">🏫</div>
              <p className="text-lg font-medium text-secondary-900 mb-2">No classes found</p>
              <p className="text-secondary-600 mb-4">Create your first class to get started</p>
              <PrimaryButton onClick={() => setShowAddClass(true)}>
                ➕ Add New Class
              </PrimaryButton>
            </div>
          </Card>
        )}
      </div>

      {/* Add Class Modal */}
      <Modal
        isOpen={showAddClass}
        onClose={() => setShowAddClass(false)}
        title="➕ Add New Class"
        size="md"
      >
        <form onSubmit={handleAddClass} className="space-y-4">
          <Input
            label="Class Name"
            type="text"
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
            placeholder="e.g., JSS 1A"
            required
          />

          <Input
            label="Class Code"
            type="text"
            value={newClass.code}
            onChange={(e) => setNewClass({ ...newClass, code: e.target.value.toUpperCase() })}
            placeholder="e.g., JSS1A"
            required
          />

          <Select
            label="Grade Level"
            value={newClass.level}
            onChange={(e) => setNewClass({ ...newClass, level: parseInt(e.target.value) })}
            required
          >
            <option value={7}>JSS 1 (Grade 7)</option>
            <option value={8}>JSS 2 (Grade 8)</option>
            <option value={9}>JSS 3 (Grade 9)</option>
            <option value={10}>SS 1 (Grade 10)</option>
            <option value={11}>SS 2 (Grade 11)</option>
            <option value={12}>SS 3 (Grade 12)</option>
          </Select>

          <Input
            label="Section (Optional)"
            type="text"
            value={newClass.section}
            onChange={(e) => setNewClass({ ...newClass, section: e.target.value.toUpperCase() })}
            placeholder="e.g., A, B, C"
          />

          <Input
            label="Capacity"
            type="number"
            value={newClass.capacity}
            onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) })}
            min="1"
            required
          />

          <Input
            label="Academic Year"
            type="text"
            value={newClass.academic_year}
            onChange={(e) => setNewClass({ ...newClass, academic_year: e.target.value })}
            placeholder="e.g., 2024/2025"
            required
          />

          <div className="flex gap-3 pt-4">
            <SecondaryButton
              type="button"
              onClick={() => setShowAddClass(false)}
              className="flex-1"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" className="flex-1">
              ➕ Add Class
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        title="✏️ Edit Class"
        size="md"
      >
        {editingClass && (
          <form onSubmit={handleUpdateClass} className="space-y-4">
            <Input
              label="Class Name"
              type="text"
              value={editingClass.name}
              onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
              required
            />

            <Input
              label="Class Code"
              type="text"
              value={editingClass.code}
              onChange={(e) => setEditingClass({ ...editingClass, code: e.target.value.toUpperCase() })}
              required
            />

            <Select
              label="Grade Level"
              value={editingClass.level}
              onChange={(e) => setEditingClass({ ...editingClass, level: parseInt(e.target.value) })}
              required
            >
              <option value={7}>JSS 1 (Grade 7)</option>
              <option value={8}>JSS 2 (Grade 8)</option>
              <option value={9}>JSS 3 (Grade 9)</option>
              <option value={10}>SS 1 (Grade 10)</option>
              <option value={11}>SS 2 (Grade 11)</option>
              <option value={12}>SS 3 (Grade 12)</option>
            </Select>

            <Input
              label="Section (Optional)"
              type="text"
              value={editingClass.section || ''}
              onChange={(e) => setEditingClass({ ...editingClass, section: e.target.value.toUpperCase() })}
            />

            <Input
              label="Capacity"
              type="number"
              value={editingClass.capacity}
              onChange={(e) => setEditingClass({ ...editingClass, capacity: parseInt(e.target.value) })}
              min="1"
              required
            />

            <Input
              label="Academic Year"
              type="text"
              value={editingClass.academic_year}
              onChange={(e) => setEditingClass({ ...editingClass, academic_year: e.target.value })}
              required
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editingClass.is_active}
                onChange={(e) => setEditingClass({ ...editingClass, is_active: e.target.checked })}
              />
              <label htmlFor="is_active" className="text-sm text-secondary-700">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <SecondaryButton
                type="button"
                onClick={() => setEditingClass(null)}
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
