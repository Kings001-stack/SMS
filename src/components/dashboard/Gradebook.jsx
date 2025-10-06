import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Edit, Save, X, Search, Filter, Download } from 'lucide-react';
import apiService from '../../utils/apiService';

export default function Gradebook({ title = 'Gradebook' }) {
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assignments
      const assignmentsResponse = await apiService.getAssignments();
      if (assignmentsResponse.status === 'success') {
        setAssignments(assignmentsResponse.data);
      }

      // Fetch grades
      const gradesResponse = await apiService.get('/grades');
      if (gradesResponse.status === 'success') {
        setGrades(gradesResponse.data);
      }

      // Fetch students (this would need a students API endpoint)
      // For now, we'll extract unique students from grades
      const uniqueStudents = [...new Set(gradesResponse.data.map(g => g.student_id))];
      setStudents(uniqueStudents.map(id => {
        const grade = gradesResponse.data.find(g => g.student_id === id);
        return {
          id: id,
          name: grade?.student_name || 'Unknown Student',
          email: grade?.student_email || ''
        };
      }));

    } catch (err) {
      setError('Failed to load gradebook data');
      console.error('Error fetching gradebook data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = (assignmentId, studentId) => {
    const grade = grades.find(g => g.assignment_id === assignmentId && g.student_id === studentId);
    setEditingCell({ assignmentId, studentId });
    setEditingValue(grade?.grade || '');
  };

  const handleCellSave = async () => {
    if (!editingCell) return;

    try {
      const existingGrade = grades.find(g =>
        g.assignment_id === editingCell.assignmentId &&
        g.student_id === editingCell.studentId
      );

      if (existingGrade) {
        // Update existing grade
        await apiService.put(`/grades/${existingGrade.id}`, {
          grade: editingValue,
          comments: existingGrade.comments
        });
      } else {
        // Create new grade
        await apiService.post('/grades', {
          student_id: editingCell.studentId,
          assignment_id: editingCell.assignmentId,
          grade: editingValue,
          comments: ''
        });
      }

      // Refresh grades
      const gradesResponse = await apiService.get('/grades');
      if (gradesResponse.status === 'success') {
        setGrades(gradesResponse.data);
      }

      setEditingCell(null);
      setEditingValue('');
    } catch (err) {
      setError('Failed to save grade');
      console.error('Error saving grade:', err);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const getGradeForCell = (assignmentId, studentId) => {
    return grades.find(g => g.assignment_id === assignmentId && g.student_id === studentId);
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-400';
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper === 'A') return 'text-green-600 font-semibold';
    if (gradeUpper === 'B') return 'text-blue-600 font-semibold';
    if (gradeUpper === 'C') return 'text-yellow-600 font-semibold';
    if (gradeUpper === 'D') return 'text-orange-600 font-semibold';
    if (gradeUpper === 'F') return 'text-red-600 font-semibold';
    // Numeric grades
    const numeric = parseInt(grade);
    if (numeric >= 90) return 'text-green-600 font-semibold';
    if (numeric >= 80) return 'text-blue-600 font-semibold';
    if (numeric >= 70) return 'text-yellow-600 font-semibold';
    if (numeric >= 60) return 'text-orange-600 font-semibold';
    return 'text-red-600 font-semibold';
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
          <p className="text-sm text-gray-600 mt-1">Manage student grades and assignments</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </motion.button>
        </div>
      </div>

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

      {/* Gradebook Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                {assignments.map((assignment) => (
                  <th key={assignment.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col">
                      <span className="truncate max-w-32">{assignment.title}</span>
                      <span className="text-xs text-gray-400">{assignment.subject}</span>
                      <span className="text-xs text-gray-400">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  {assignments.map((assignment) => {
                    const grade = getGradeForCell(assignment.id, student.id);
                    const isEditing = editingCell?.assignmentId === assignment.id &&
                                    editingCell?.studentId === student.id;

                    return (
                      <td key={assignment.id} className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="w-16 px-2 py-1 border rounded focus:ring-2 focus:ring-primary/30 outline-none"
                              placeholder="Grade"
                              autoFocus
                            />
                            <button
                              onClick={handleCellSave}
                              className="p-1 text-green-600 hover:text-green-800"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={handleCellCancel}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`text-sm cursor-pointer hover:bg-gray-100 rounded px-2 py-1 ${getGradeColor(grade?.grade)}`}
                            onClick={() => handleCellEdit(assignment.id, student.id)}
                          >
                            {grade?.grade || '—'}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {/* Calculate average - placeholder */}
                      85%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {assignments.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600">Create assignments first to start grading</p>
        </div>
      )}
    </div>
  );
}
