import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Calendar, Newspaper, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

export default function NewsEventsManager() {
  const { token, user } = useAuth();
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id: null, title: '', content: '', type: 'news', event_date: '', published: 1 });
  const [submitting, setSubmitting] = useState(false);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }), [token]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost/api/news-events?published=0', { headers });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to fetch');
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ id: null, title: '', content: '', type: 'news', event_date: '', published: 1 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      setSubmitting(true);
      setError(null);
      const payload = { ...form };
      if (!payload.event_date) payload.event_date = null;
      const method = form.id ? 'PUT' : 'POST';
      const res = await fetch('http://localhost/api/news-events', { method, headers, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to save');
      resetForm();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title || '',
      content: item.content || '',
      type: item.type || 'news',
      event_date: item.event_date ? item.event_date.replace(' ', 'T').slice(0,16) : '',
      published: item.published ? 1 : 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!confirm('Delete this item?')) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('http://localhost/api/news-events', { method: 'DELETE', headers, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to delete');
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white p-6 rounded-xl border"><div>You must be an admin to manage news and events.</div></div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="text-xl font-semibold">{form.id ? 'Edit News/Event' : 'Create News/Event'}</h2>
        <p className="text-sm text-gray-500 mb-4">Publish updates that appear on the public News & Events page.</p>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="w-full border rounded-lg px-3 py-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="news">News</option>
              <option value="event">Event</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Event Date (optional)</label>
            <input type="datetime-local" className="w-full border rounded-lg px-3 py-2" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Published</label>
            <select className="w-full border rounded-lg px-3 py-2" value={form.published} onChange={e => setForm({ ...form, published: Number(e.target.value) })}>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea className="w-full border rounded-lg px-3 py-2 min-h-[120px]" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button disabled={submitting} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-60" type="submit">
              {submitting ? 'Saving...' : (form.id ? 'Update' : 'Create')}
            </button>
            {form.id && (
              <button type="button" className="border px-4 py-2 rounded-lg" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">All News & Events</h3>
          <button 
            className="text-sm text-primary-700 hover:text-primary-900 font-medium transition-colors" 
            onClick={load} 
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No news or events yet.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((it) => (
            <div 
              key={it.id} 
              className="group relative bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 aspect-square flex flex-col"
              style={{
                borderColor: it.type === 'event' ? '#8b5cf6' : '#3b82f6',
              }}
            >
              {/* Card Header with Icon */}
              <div 
                className="p-4 flex items-center justify-between"
                style={{
                  background: it.type === 'event' 
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' 
                    : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                }}
              >
                <div className="flex items-center gap-2">
                  {it.type === 'event' ? (
                    <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                  ) : (
                    <Newspaper className="w-5 h-5 text-white" strokeWidth={2.5} />
                  )}
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {it.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {it.published ? (
                    <Eye className="w-4 h-4 text-white" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-white opacity-60" />
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="flex-1 p-4 flex flex-col">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 text-base group-hover:text-primary-600 transition-colors">
                  {it.title}
                </h4>
                
                <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-1">
                  {it.content}
                </p>
                
                <div className="text-xs text-gray-500 mb-3">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {formatDate(it.event_date || it.created_at)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  <button 
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    onClick={() => handleEdit(it)}
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    onClick={() => handleDelete(it.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Hover Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
