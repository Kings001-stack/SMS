import { useEffect, useState } from 'react';
import { Calendar, Newspaper } from 'lucide-react';

export default function Events() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('http://localhost/api/news-events?published=1');
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Failed to load news & events');
        }
        if (isMounted) setItems(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false };
  }, []);

  return (
    <section className="container-pad py-14">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">News & Events</h1>
        <p className="text-gray-600">Stay updated with the latest happenings at our school</p>
      </div>
      
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news & events...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <>
          {items.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No news or events available at the moment.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((e) => (
              <div 
                key={e.id} 
                className="group relative bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 aspect-square flex flex-col"
                style={{
                  borderColor: e.type === 'event' ? '#8b5cf6' : '#3b82f6',
                }}
              >
                {/* Card Header with Icon */}
                <div 
                  className="p-4 flex items-center justify-between"
                  style={{
                    background: e.type === 'event' 
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' 
                      : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    {e.type === 'event' ? (
                      <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                    ) : (
                      <Newspaper className="w-5 h-5 text-white" strokeWidth={2.5} />
                    )}
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {e.type}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex-1 p-4 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-base group-hover:text-primary-600 transition-colors">
                    {e.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-4 mb-3 flex-1">
                    {e.content}
                  </p>
                  
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-auto">
                    <Calendar className="w-3 h-3" />
                    {formatDate(e.event_date || e.created_at)}
                  </div>
                </div>

                {/* Hover Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}
