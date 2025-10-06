import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, Container, ResponsiveGrid } from '../theme/ThemeComponents.jsx';

export default function ParentOverview() {
  const { token } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost/api/parent/children', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load children');
        const json = await res.json();
        setChildren(json.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Overview</h1>
          <p className="text-secondary-600 mt-1">Quick summary of your children</p>
        </div>

        {loading && (
          <Card>
            <div className="py-8 text-center text-secondary-600">Loading...</div>
          </Card>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200">
            <div className="py-4 px-4 text-red-800">{error}</div>
          </Card>
        )}

        {!loading && !error && (
          children.length === 0 ? (
            <Card>
              <div className="py-8 text-center text-secondary-600">No children linked to this account yet.</div>
            </Card>
          ) : (
            <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 3 }} gap="lg">
              {children.map((c) => (
                <Card key={c.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
                      {(c.name || c.first_name || 'S')[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-secondary-900">{c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || `Student #${c.id}`}</h3>
                      <p className="text-sm text-secondary-600">Class: {c.class_level || c.class || 'N/A'}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </ResponsiveGrid>
          )
        )}
      </div>
    </Container>
  );
}
