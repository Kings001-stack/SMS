import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, PrimaryButton, Container, ResponsiveGrid } from '../theme/ThemeComponents.jsx';
import { Megaphone, Plus, RefreshCw, Trash2, AlertCircle, CheckCircle, X, Users, GraduationCap, UserCog, UsersRound, Bell, Edit2 } from 'lucide-react';

const AnnouncementList = () => {
  const { user, token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    priority: 'normal'
  });

  const userRole = user?.role?.toLowerCase();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/api/announcements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const result = await response.json();
      setAnnouncements(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId ? { ...newAnnouncement, id: editingId } : newAnnouncement;
      
      const response = await fetch('http://localhost/api/announcements', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || `Failed to ${editingId ? 'update' : 'create'} announcement`);
      }

      setShowCreateForm(false);
      setEditingId(null);
      setNewAnnouncement({
        title: '',
        content: '',
        target_audience: 'all',
        priority: 'normal'
      });
      setSuccess(`Announcement ${editingId ? 'updated' : 'created'} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      fetchAnnouncements();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingId(announcement.id);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      target_audience: announcement.target_audience,
      priority: announcement.priority
    });
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowCreateForm(false);
    setNewAnnouncement({
      title: '',
      content: '',
      target_audience: 'all',
      priority: 'normal'
    });
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await fetch(`http://localhost/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Failed to delete announcement');
      }

      setSuccess('Announcement deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchAnnouncements();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-red-200 text-red-900 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTargetAudienceLabel = (audience) => {
    switch (audience?.toLowerCase()) {
      case 'students':
        return 'Students';
      case 'teachers':
        return 'Teachers';
      case 'parents':
        return 'Parents';
      default:
        return 'All';
    }
  };

  const getTargetAudienceIcon = (audience) => {
    switch (audience?.toLowerCase()) {
      case 'students':
        return <GraduationCap className="w-3 h-3" />;
      case 'teachers':
        return <UserCog className="w-3 h-3" />;
      case 'parents':
        return <UsersRound className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  // Only show announcements relevant to the current user's role
  const canSeeAnnouncement = (announcement) => {
    const audience = announcement?.target_audience?.toLowerCase?.() || 'all';
    if (audience === 'all') return true;
    if (!userRole) return true; // fallback: show if role unknown
    if (userRole === 'admin') return true; // admins see everything
    if (audience === 'students' && userRole === 'student') return true;
    if (audience === 'teachers' && userRole === 'teacher') return true;
    if (audience === 'parents' && userRole === 'parent') return true;
    return false;
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading announcements...</p>
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
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Announcements</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <PrimaryButton onClick={fetchAnnouncements}>
              Try Again
            </PrimaryButton>
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
            <h1 className="text-2xl font-bold text-secondary-900">Announcements</h1>
            <p className="text-secondary-600 mt-1">
              Stay updated with the latest school announcements and notices
            </p>
          </div>

          {(userRole === 'teacher' || userRole === 'admin') && (
            <div className="flex gap-2">
              <button
                onClick={fetchAnnouncements}
                className="px-4 py-2 text-secondary-600 hover:text-secondary-800 border border-secondary-300 rounded-lg hover:bg-secondary-50 flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <PrimaryButton
                onClick={() => editingId ? handleCancelEdit() : setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-2"
              >
                {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showCreateForm ? 'Cancel' : 'New Announcement'}
              </PrimaryButton>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        )}

        {/* Create Announcement Form */}
        {showCreateForm && (
          <Card className="bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-primary-900">
                {editingId ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={newAnnouncement.target_audience}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, target_audience: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {/* Admin can target anyone */}
                    {userRole === 'admin' && (
                      <>
                        <option value="all">All Users</option>
                        <option value="students">Students Only</option>
                        <option value="teachers">Teachers Only</option>
                        <option value="parents">Parents Only</option>
                      </>
                    )}
                    {/* Teachers: typically to students or everyone */}
                    {userRole === 'teacher' && (
                      <>
                        <option value="all">All Users</option>
                        <option value="students">Students Only</option>
                      </>
                    )}
                    {/* Other roles fallback */}
                    {userRole !== 'admin' && userRole !== 'teacher' && (
                      <option value="all">All Users</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <PrimaryButton type="submit">
                  {editingId ? 'Update Announcement' : 'Create Announcement'}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-800 border border-secondary-300 rounded-lg hover:bg-secondary-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.filter(canSeeAnnouncement).length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">No Announcements</h3>
                <p className="text-secondary-600">
                  There are no announcements at the moment. Check back later for updates!
                </p>
              </div>
            </Card>
          ) : (
            announcements.filter(canSeeAnnouncement).map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border-l-4" style={{ borderLeftColor: announcement.priority === 'urgent' ? '#dc2626' : announcement.priority === 'high' ? '#f59e0b' : '#3b82f6' }}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Megaphone className="w-5 h-5 text-primary-600" />
                      <h3 className="text-lg font-bold text-secondary-900">
                        {announcement.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority?.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800 rounded-full text-xs font-medium border flex items-center gap-1">
                        {getTargetAudienceIcon(announcement.target_audience)}
                        {getTargetAudienceLabel(announcement.target_audience)}
                      </span>
                    </div>

                    <p className="text-secondary-700 mb-3 whitespace-pre-wrap">
                      {announcement.content}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-secondary-500">
                      <span>Posted by {announcement.author_name || 'Unknown'}</span>
                      <span>{formatDate(announcement.created_at)}</span>
                    </div>
                  </div>

                  {(userRole === 'teacher' || userRole === 'admin') && (
                    parseInt(announcement.teacher_id) === parseInt(user.id) || userRole === 'admin'
                  ) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="flex items-center gap-1 text-blue-600 hover:text-white hover:bg-blue-600 px-3 py-2 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-600"
                        title="Edit announcement"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-white hover:bg-red-600 px-3 py-2 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-600"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Container>
  );
};

export default AnnouncementList;