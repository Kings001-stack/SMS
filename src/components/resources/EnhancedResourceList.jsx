import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import axios from 'axios';
import ClassManager from './ClassManager.jsx';
import SUBJECTS from '../../constants/subjects';
import CLASS_LEVELS from '../../constants/classLevels';
import { 
  Card, 
  PrimaryButton, 
  SecondaryButton, 
  Badge, 
  Input, 
  Select, 
  Textarea, 
  Modal,
  Container,
  ResponsiveGrid,
  LoadingSpinner
} from '../theme/ThemeComponents.jsx';

export default function EnhancedResourceList() {
  const { user, token } = useAuth();
  const [resources, setResources] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showClassManager, setShowClassManager] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class_level: '',
    content_type: 'file', // 'file' or 'text'
    file: null,
    text_content: '',
    is_assignment: false,
    due_date: '',
    visibility: 'class'
  });
  const [uploading, setUploading] = useState(false);

  const canUploadResources = ['admin', 'teacher'].includes(user?.role?.toLowerCase());
  // Use centralized class levels
  const visibilityOptions = [
    { value: 'class', label: 'Class Only', description: 'Only students in this class can see' },
    { value: 'subject', label: 'Subject Wide', description: 'All classes taking this subject can see' },
    { value: 'public', label: 'Public', description: 'All students can see' }
  ];

  useEffect(() => {
    fetchResources();
    if (canUploadResources) {
      fetchTeacherClasses();
    }
  }, [selectedClass, selectedSubject]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      let url = 'http://localhost/api/resources';
      const params = new URLSearchParams();
      
      if (selectedClass !== 'all') {
        params.append('class_level', selectedClass);
      }
      if (selectedSubject !== 'all') {
        params.append('subject', selectedSubject);
      }
      if (user?.role?.toLowerCase() === 'teacher') {
        params.append('teacher_id', user.id);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await axios.get(url, { headers });
      if (response.data?.status === 'success') {
        setResources(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch resources');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherClasses = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost/api/resources/teacher-classes', { headers });

      if (response.data.success) {
        setTeacherClasses(response.data.data);
        // Set default class if teacher has classes
        if (response.data.data.length > 0 && !formData.class_level) {
          setFormData(prev => ({ ...prev, class_level: response.data.data[0].class_level }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch teacher classes:', err);
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const selectedClasses = Array.isArray(formData.class_levels) && formData.class_levels.length > 0
      ? formData.class_levels
      : (formData.class_level ? [formData.class_level] : []);
    if (!formData.title.trim() || selectedClasses.length === 0) {
      alert('Please fill in title and at least one class level');
      return;
    }
    
    // Validate content based on type
    if (formData.content_type === 'file' && !formData.file) {
      alert('Please select a file to upload');
      return;
    }
    
    if (formData.content_type === 'text' && !formData.text_content.trim()) {
      alert('Please enter text content');
      return;
    }

    try {
      setUploading(true);
      
      let response;
      
      if (formData.content_type === 'file') {
        // Handle file upload
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.file);
        uploadFormData.append('title', formData.title);
        uploadFormData.append('description', formData.description);
        uploadFormData.append('subject', formData.subject);
        // For multi-class share, send class_levels JSON; keep class_level for backward compatibility
        if (selectedClasses.length > 1) {
          uploadFormData.append('class_levels', JSON.stringify(selectedClasses));
        }
        uploadFormData.append('class_level', selectedClasses[0]);
        uploadFormData.append('content_type', 'file');
        uploadFormData.append('is_assignment', formData.is_assignment);
        uploadFormData.append('due_date', formData.due_date || '');
        uploadFormData.append('visibility', formData.visibility);
        
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        };
        
        response = await axios.post('http://localhost/api/resources', uploadFormData, { headers });
      } else {
        // Handle text content
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const payload = {
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          class_level: selectedClasses[0],
          class_levels: selectedClasses.length > 1 ? selectedClasses : undefined,
          content_type: 'text',
          text_content: formData.text_content,
          is_assignment: formData.is_assignment,
          due_date: formData.due_date || null,
          visibility: formData.visibility
        };

        response = await axios.post('http://localhost/api/resources', payload, { headers });
      }

      if (response.data?.status === 'success') {
        alert('Resource shared successfully!');
        setShowUploadForm(false);
        resetForm();
        fetchResources();
      } else {
        throw new Error(response.data?.message || 'Failed to share resource');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to share resource');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      class_level: teacherClasses.length > 0 ? teacherClasses[0].class_level : '',
      class_levels: [],
      content_type: 'file',
      file: null,
      text_content: '',
      is_assignment: false,
      due_date: '',
      visibility: 'class'
    });
  };

  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(`http://localhost/api/resources/${resourceId}`, { headers });

      if (response.data.success) {
        alert('Resource deleted successfully!');
        fetchResources();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete resource');
    }
  };

  const getContentIcon = (resource) => {
    if (resource.content_type === 'text') {
      return <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <span className="text-blue-600 font-bold text-xs">📝</span>
      </div>;
    }
    
    // For file content, determine icon by file extension
    const extension = resource.file_name?.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <span className="text-red-600 font-bold text-xs">PDF</span>
        </div>;
      case 'doc':
      case 'docx':
        return <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-bold text-xs">DOC</span>
        </div>;
      case 'ppt':
      case 'pptx':
        return <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <span className="text-orange-600 font-bold text-xs">PPT</span>
        </div>;
      case 'xls':
      case 'xlsx':
        return <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <span className="text-green-600 font-bold text-xs">XLS</span>
        </div>;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <span className="text-purple-600 font-bold text-xs">IMG</span>
        </div>;
      case 'txt':
        return <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-600 font-bold text-xs">TXT</span>
        </div>;
      default:
        return <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-600 font-bold text-xs">📁</span>
        </div>;
    }
  };

  const getVisibilityBadge = (visibility) => {
    const colors = {
      class: 'bg-blue-100 text-blue-700',
      subject: 'bg-purple-100 text-purple-700',
      public: 'bg-green-100 text-green-700'
    };
    return colors[visibility] || colors.class;
  };

  const handleViewResource = async (resource) => {
    try {
      // Track access
      const headers = { Authorization: `Bearer ${token}` };
      await axios.get(`http://localhost/api/resources/${resource.id}`, { headers });
      
      if (resource.content_type === 'file' && resource.file_path) {
        // Download/open file
        window.open(`http://localhost/api/uploads?file=${encodeURIComponent(resource.file_path)}`, '_blank');
      } else if (resource.content_type === 'text') {
        // Show text content in modal or new window
        const textWindow = window.open('', '_blank');
        textWindow.document.write(`
          <html>
            <head>
              <title>${resource.title}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
                .content { white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>${resource.title}</h1>
              <div class="meta">
                <strong>Subject:</strong> ${resource.subject || 'N/A'} | 
                <strong>Class:</strong> ${resource.class_level} | 
                <strong>Teacher:</strong> ${resource.teacher_name || 'Unknown'}
              </div>
              ${resource.description ? `<p><strong>Description:</strong> ${resource.description}</p>` : ''}
              <div class="content">${resource.text_content || 'No content available'}</div>
            </body>
          </html>
        `);
      }
    } catch (err) {
      console.error('Resource access failed:', err);
      alert('Failed to access resource');
    }
  };

  if (loading) {
    return (
      <Container>
        <Card className="text-center">
          <div className="py-8">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Loading Resources</h3>
            <p className="text-secondary-600">Please wait while we fetch your learning materials...</p>
          </div>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card className="text-center border-error">
          <div className="py-8">
            <div className="text-4xl mb-4">❌</div>
            <p className="font-medium text-error mb-2">Error loading resources</p>
            <p className="text-sm text-secondary-600 mb-4">{error}</p>
            <PrimaryButton onClick={fetchResources}>
              Try Again
            </PrimaryButton>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card className="bg-gradient-to-br from-white to-primary-50 border-primary-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-secondary-900">Class Resources & Assignments</h3>
            <p className="text-sm text-secondary-600 mt-1">
              {user?.role?.toLowerCase() === 'teacher' 
                ? 'Share resources and assignments with your classes'
                : 'Access learning materials and assignments for your class'
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton 
              onClick={fetchResources}
              size="sm"
            >
              🔄 Refresh
            </SecondaryButton>
            {canUploadResources && (
              <>
                <PrimaryButton
                  onClick={() => setShowClassManager(true)}
                  size="sm"
                  variant="outline"
                >
                  👥 Manage Classes
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => setShowUploadForm(true)}
                  size="sm"
                >
                  📤 Share Resource
                </PrimaryButton>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-to-r from-secondary-50 to-primary-50 border-secondary-200" padding="sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-secondary-700">Class:</label>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="min-w-[120px]"
              >
                <option value="all">All Classes</option>
                {CLASS_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-secondary-700">Subject:</label>
              <Select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="min-w-[180px]"
              >
                <option value="all">All Subjects</option>
                {SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white shadow-red' 
                    : 'bg-secondary-200 text-secondary-600 hover:bg-primary-100'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white shadow-red' 
                    : 'bg-secondary-200 text-secondary-600 hover:bg-primary-100'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              </button>
            </div>
          </div>
        </Card>

        {/* Resources Display */}
        {resources.length === 0 ? (
          <Card className="text-center">
            <div className="py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg font-medium text-secondary-900 mb-2">No resources available</p>
              <p className="text-sm text-secondary-600 mb-6">
                {canUploadResources 
                  ? 'Share your first resource with students'
                  : 'Your teacher hasn\'t shared any resources yet'
                }
              </p>
              {canUploadResources && (
                <PrimaryButton
                  onClick={() => setShowUploadForm(true)}
                >
                  📤 Share First Resource
                </PrimaryButton>
              )}
            </div>
          </Card>
        ) : (
          <ResponsiveGrid 
            cols={viewMode === 'grid' ? { xs: 1, md: 2, lg: 3 } : { xs: 1 }}
            gap="md"
          >
            {resources.map((resource) => (
              <Card 
                key={resource.id} 
                className={`transition-all duration-200 hover:shadow-red-lg ${
                  resource.is_assignment ? 'border-l-4 border-l-accent-500 bg-gradient-to-r from-accent-50 to-white' : 'hover:border-primary-200'
                }`}
                hover
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getContentIcon(resource)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-secondary-900 truncate">{resource.title}</h4>
                      {canUploadResources && parseInt(resource.teacher_id) === parseInt(user.id) && (
                        <SecondaryButton
                          onClick={() => handleDeleteResource(resource.id)}
                          size="xs"
                          className="text-error hover:bg-error-light ml-2"
                        >
                          🗑️
                        </SecondaryButton>
                      )}
                    </div>
                    
                    {resource.description && (
                      <p className="text-sm text-secondary-600 mt-1 line-clamp-2">{resource.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge variant="primary" size="xs">
                        {resource.class_level}
                      </Badge>
                      {resource.subject && (
                        <Badge variant="secondary" size="xs">
                          {resource.subject}
                        </Badge>
                      )}
                      <Badge 
                        variant={resource.visibility === 'public' ? 'success' : resource.visibility === 'subject' ? 'warning' : 'primary'} 
                        size="xs"
                      >
                        {resource.visibility}
                      </Badge>
                      {resource.is_assignment && (
                        <Badge variant="accent" size="xs">
                          📝 Assignment
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-secondary-500">
                        <p className="font-medium">By: {resource.teacher_name}</p>
                        <p>{new Date(resource.created_at).toLocaleDateString()}</p>
                        {resource.due_date && (
                          <p className="text-accent-600 font-medium">
                            ⏰ Due: {new Date(resource.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {resource.download_count > 0 && (
                          <span className="text-xs text-secondary-500">
                            📥 {resource.download_count}
                          </span>
                        )}
                        <PrimaryButton
                          onClick={() => handleViewResource(resource)}
                          size="xs"
                        >
                          {resource.content_type === 'text' ? '👁️ View' : '📥 Download'}
                        </PrimaryButton>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        )}
      </Card>

      {/* Upload Resource Modal */}
      <Modal
        isOpen={showUploadForm}
        onClose={() => setShowUploadForm(false)}
        title="📤 Share Resource with Class"
        size="lg"
      >

        <form onSubmit={handleUploadResource} className="space-y-6">
          <Input
            label="Title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter resource title"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user?.role?.toLowerCase() === 'admin' ? (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Class Levels (select one or more)</label>
                <select
                  multiple
                  value={formData.class_levels || []}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                    setFormData({ ...formData, class_levels: opts, class_level: opts[0] || '' });
                  }}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg"
                >
                  {CLASS_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
                <p className="text-xs text-secondary-500 mt-1">Hold Ctrl/Cmd to select multiple classes.</p>
              </div>
            ) : (
              <Select
                label="Class Level"
                value={formData.class_level}
                onChange={(e) => setFormData({ ...formData, class_level: e.target.value, class_levels: [] })}
                required
              >
                <option value="">Select Class</option>
                {(
                  user?.role?.toLowerCase() === 'admin' || teacherClasses.length === 0
                ) ? (
                  CLASS_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))
                ) : (
                  teacherClasses.map(tc => (
                    <option key={`${tc.class_level}-${tc.subject}`} value={tc.class_level}>
                      {tc.class_level} {tc.subject && `- ${tc.subject}`}
                    </option>
                  ))
                )}
              </Select>
            )}

            <Select
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            >
              <option value="">Select Subject</option>
              {SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the resource"
            rows={3}
          />

          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Content Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-secondary-50">
                <input
                  type="radio"
                  name="content_type"
                  value="file"
                  checked={formData.content_type === 'file'}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-secondary-900">📁 File Upload</div>
                  <div className="text-xs text-secondary-500">Upload documents, PDFs, images</div>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-secondary-50">
                <input
                  type="radio"
                  name="content_type"
                  value="text"
                  checked={formData.content_type === 'text'}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-secondary-900">📝 Text Content</div>
                  <div className="text-xs text-secondary-500">Write content directly</div>
                </div>
              </label>
            </div>
          </div>

          {/* File Upload Input */}
          {formData.content_type === 'file' && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                className="block w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                required
              />
              <p className="text-xs text-secondary-500 mt-1">
                Supported: PDF, Word, PowerPoint, Excel, Images, Text files
              </p>
            </div>
          )}

          {/* Text Content Input */}
          {formData.content_type === 'text' && (
            <Textarea
              label="Text Content"
              value={formData.text_content}
              onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
              placeholder="Write your content here..."
              rows={8}
              required
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="Visibility"
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              >
                {visibilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-secondary-500 mt-1">
                {visibilityOptions.find(o => o.value === formData.visibility)?.description}
              </p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={formData.is_assignment}
                  onChange={(e) => setFormData({ ...formData, is_assignment: e.target.checked })}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-secondary-700">📝 This is an assignment</span>
              </label>
            </div>
          </div>

          {formData.is_assignment && (
            <Input
              label="Due Date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <SecondaryButton
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="flex-1"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? '📤 Sharing...' : '📤 Share Resource'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Class Manager Modal */}
      <ClassManager 
        isOpen={showClassManager} 
        onClose={() => setShowClassManager(false)} 
      />
    </Container>
  );
}
