import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, PrimaryButton, Container } from '../theme/ThemeComponents.jsx';

export default function ParentGradesView() {
  const { token } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) fetchGrades(selectedChildId);
    else setGrades([]);
  }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost/api/parent/children', {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load children');
      const json = await res.json();
      const list = json.data || [];
      setChildren(list);
      if (list.length > 0) setSelectedChildId(String(list[0].id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async (studentId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`http://localhost/api/parent/grades?student_id=${encodeURIComponent(studentId)}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load grades');
      const json = await res.json();
      setGrades(json.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Child Grades</h1>
            <p className="text-secondary-600 mt-1">Select a child to view recent grades</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Child</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>{c.name || `Student #${c.id}`}</option>
              ))}
            </select>
            <PrimaryButton onClick={() => selectedChildId && fetchGrades(selectedChildId)} disabled={!selectedChildId}>
              Refresh
            </PrimaryButton>
          </div>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <div className="py-4 px-4 text-red-800 flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
            </div>
          </Card>
        )}

        {loading && (
          <Card>
            <div className="py-8 text-center text-secondary-600">Loading...</div>
          </Card>
        )}

        {!loading && selectedChildId && (
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Grades</h3>
            {grades.length === 0 ? (
              <div className="text-center py-8 text-secondary-600">No grades available</div>
            ) : (
              <div className="space-y-3">
                {grades.map((g) => (
                  <div key={g.id} className="p-4 border border-secondary-200 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-semibold text-secondary-900">{g.assignment_title}</p>
                        <p className="text-sm text-secondary-600">{g.subject} • {g.class_level}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full border border-secondary-300 text-secondary-800 font-semibold">
                          {String(g.grade)}
                        </span>
                        <p className="text-xs text-secondary-500 mt-1">{new Date(g.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {g.comments && (
                      <p className="text-sm text-secondary-700 mt-2">{g.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </Container>
  );
}
