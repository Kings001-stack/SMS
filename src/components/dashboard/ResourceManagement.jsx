import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Download, Share2, Eye, Trash2, Search } from 'lucide-react';
import apiService from '../../utils/apiService';
import SUBJECTS from '../../constants/subjects';
import CLASS_LEVELS from '../../constants/classLevels';

export default function ResourceManagement({ title = 'Resource Library' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch resources on component mount
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getResources();
      if (response.status === 'success') {
        setResources(response.data);
      }
    } catch (err) {
      setError('Failed to load resources');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    const file = event.target.file.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', event.target.title.value);
    formData.append('description', event.target.description.value);
    formData.append('subject', event.target.subject.value);
    formData.append('class_level', event.target.class_level.value);

    try {
      setUploading(true);
      const response = await apiService.uploadResource(formData);
      if (response.status === 'success') {
        setResources([response.data, ...resources]);
        // Reset form
        event.target.reset();
        // Close modal (you might want to add modal state management)
      }
    } catch (err) {
      setError('Failed to upload resource');
      console.error('Error uploading resource:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await apiService.deleteResource(resourceId);
      if (response.status === 'success') {
        setResources(resources.filter(r => r.id !== resourceId));
      }
    } catch (err) {
      setError('Failed to delete resource');
      console.error('Error deleting resource:', err);
    }
  };

  const categories = ['all', ...SUBJECTS];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (fileUrl) => {
    const extension = fileUrl.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'ppt':
      case 'pptx': return '📊';
      case 'xls':
      case 'xlsx': return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📄';
    }
  };

  const handleDownload = (fileUrl) => {
    window.open(fileUrl, '_blank');
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
          <p className="text-sm text-gray-600 mt-1">Share and manage educational resources</p>
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark flex items-center gap-2"
          onClick={() => document.getElementById('upload-modal').showModal()}
        >
          <Upload size={16} />
          Upload Resource
        </motion.button>
      </div>

      {/* Upload Modal */}
      <dialog id="upload-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Upload New Resource</h3>
          <form onSubmit={handleUpload} className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                name="title"
                type="text"
                required
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                placeholder="Enter resource title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                rows="3"
                placeholder="Brief description of the resource"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  name="subject"
                  required
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Class Level</label>
                <select
                  name="class_level"
                  required
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  <option value="">Select Class</option>
                  {CLASS_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">File</label>
              <input
                name="file"
                type="file"
                required
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => document.getElementById('upload-modal').close()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Subjects' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getFileIcon(resource.file_url)}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{resource.title}</h3>
                  <p className="text-xs text-gray-500">{resource.subject} • {resource.class_level}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDownload(resource.file_url)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Download"
                >
                  <Download size={14} />
                </button>
                <button className="p-1 text-gray-400 hover:text-purple-600" title="Share">
                  <Share2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-3">
              {resource.description || 'No description available'}
            </p>

            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <span className="text-xs text-gray-500">
                {new Date(resource.created_at).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredResources.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or upload new resources</p>
        </div>
      )}
    </div>
  );
}
