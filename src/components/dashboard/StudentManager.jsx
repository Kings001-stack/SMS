import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Mail, Phone, Calendar, BookOpen, UserCheck } from 'lucide-react';

export default function StudentManager({ title = 'Student Management' }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock data - in a real app this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStudents([
        {
          id: 1,
          name: 'Adebayo Johnson',
          email: 'adebayo.johnson@email.com',
          phone: '+234 803 123 4567',
          class_level: 'SS3',
          date_of_birth: '2005-03-15',
          enrollment_date: '2021-09-01',
          status: 'active',
          subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
          attendance: 95,
          gpa: 4.2,
          parent_name: 'Mrs. Johnson',
          parent_phone: '+234 803 987 6543',
          address: '123 Victoria Island, Lagos'
        },
        {
          id: 2,
          name: 'Chioma Okwu',
          email: 'chioma.okwu@email.com',
          phone: '+234 803 234 5678',
          class_level: 'SS2',
          date_of_birth: '2006-07-22',
          enrollment_date: '2022-09-01',
          status: 'active',
          subjects: ['Mathematics', 'English', 'Literature', 'History'],
          attendance: 88,
          gpa: 3.8,
          parent_name: 'Mr. Okwu',
          parent_phone: '+234 803 876 5432',
          address: '456 Ikeja, Lagos'
        },
        {
          id: 3,
          name: 'Emeka Nwosu',
          email: 'emeka.nwosu@email.com',
          phone: '+234 803 345 6789',
          class_level: 'SS1',
          date_of_birth: '2007-11-08',
          enrollment_date: '2023-09-01',
          status: 'active',
          subjects: ['Mathematics', 'Geography', 'Economics', 'Government'],
          attendance: 92,
          gpa: 3.5,
          parent_name: 'Mrs. Nwosu',
          parent_phone: '+234 803 765 4321',
          address: '789 Surulere, Lagos'
        },
        {
          id: 4,
          name: 'Funmi Adeyemi',
          email: 'funmi.adeyemi@email.com',
          phone: '+234 803 456 7890',
          class_level: 'JSS3',
          date_of_birth: '2008-05-30',
          enrollment_date: '2023-09-01',
          status: 'active',
          subjects: ['Mathematics', 'Basic Science', 'Social Studies', 'English'],
          attendance: 90,
          gpa: 4.0,
          parent_name: 'Mr. Adeyemi',
          parent_phone: '+234 803 654 3210',
          address: '321 Yaba, Lagos'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const classes = ['all', 'JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class_level === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 95) return 'text-green-600';
    if (attendance >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGPABadge = (gpa) => {
    if (gpa >= 4.0) return 'bg-purple-100 text-purple-800';
    if (gpa >= 3.5) return 'bg-blue-100 text-blue-800';
    if (gpa >= 3.0) return 'bg-green-100 text-green-800';
    if (gpa >= 2.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
          <p className="text-sm text-gray-600 mt-1">View and manage student information</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark flex items-center gap-2"
          >
            <UserCheck size={16} />
            Add Student
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
        >
          {classes.map(classLevel => (
            <option key={classLevel} value={classLevel}>
              {classLevel === 'all' ? 'All Classes' : `Class ${classLevel}`}
            </option>
          ))}
        </select>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedStudent(student)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.email}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                {student.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen size={14} />
                <span>{student.class_level}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>{new Date(student.date_of_birth).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} />
                <span>{student.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                    {student.attendance}%
                  </span>
                  <span className="text-gray-500">attendance</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getGPABadge(student.gpa)}`}>
                  GPA {student.gpa}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                <p className="text-gray-600">{selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{selectedStudent.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span>{new Date(selectedStudent.date_of_birth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span>{selectedStudent.class_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrollment Date:</span>
                    <span>{new Date(selectedStudent.enrollment_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Academic Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendance:</span>
                    <span className={`font-medium ${getAttendanceColor(selectedStudent.attendance)}`}>
                      {selectedStudent.attendance}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GPA:</span>
                    <span className={`font-medium ${getGPABadge(selectedStudent.gpa)}`}>
                      {selectedStudent.gpa}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subjects:</span>
                    <span>{selectedStudent.subjects.length} subjects</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-900 mb-3">Parent/Guardian Information</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Name:</span>
                    <span>{selectedStudent.parent_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{selectedStudent.parent_phone}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p>{selectedStudent.address}</p>
                </div>
              </div>
            </div>

            <div className="modal-action mt-6">
              <button
                onClick={() => setSelectedStudent(null)}
                className="btn"
              >
                Close
              </button>
              <button className="btn btn-primary">
                Edit Student
              </button>
            </div>
          </div>
        </dialog>
      )}

      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
