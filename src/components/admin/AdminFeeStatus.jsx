import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, Container, PrimaryButton, SecondaryButton, LoadingSpinner, Badge } from '../theme/ThemeComponents.jsx';

export default function AdminFeeStatus() {
  const { token } = useAuth();
  const [term, setTerm] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [notesById, setNotesById] = useState({}); // paymentId -> admin_note

  const fetchStatus = async (useTerm) => {
    try {
      setLoading(true);
      setError(null);
      const url = new URL('http://localhost/api/admin/fees/status');
      if (useTerm) url.searchParams.set('academic_term', useTerm);
      const res = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load fee status');
      const json = await res.json();
      const data = json.data || json || {};
      setTerm(data.academic_term || '');
      setRows(Array.isArray(data.students) ? data.students : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await fetch('http://localhost/api/admin/fees/pending', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load pending payments');
      const json = await res.json();
      setPending(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setError(e.message);
    }
  };

  const approvePayment = async (paymentId) => {
    try {
      setApprovingId(paymentId);
      const res = await fetch('http://localhost/api/admin/fees/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ payment_id: paymentId, admin_note: notesById[paymentId] || undefined })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to approve payment');
      }
      await fetchPending();
      await fetchStatus(term);
    } catch (e) {
      setError(e.message);
    } finally {
      setApprovingId(null);
    }
  };

  const rejectPayment = async (paymentId) => {
    try {
      setRejectingId(paymentId);
      const res = await fetch('http://localhost/api/admin/fees/reject', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ payment_id: paymentId, admin_note: notesById[paymentId] || undefined })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to reject payment');
      }
      await fetchPending();
    } catch (e) {
      setError(e.message);
    } finally {
      setRejectingId(null);
    }
  };

  const seedDefaults = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost/api/admin/fees/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ academic_term: term || undefined })
      });
      if (!res.ok) throw new Error('Failed to seed default fees');
      await fetchStatus(term);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); fetchPending(); }, []);

  const totals = useMemo(() => {
    const t = { due: 0, paid: 0, balance: 0 };
    rows.forEach(r => {
      t.due += Number(r.total_due || 0);
      t.paid += Number(r.total_paid || 0);
      t.balance += Number(r.balance || 0);
    });
    return t;
  }, [rows]);

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Fee Status by Student</h1>
            <p className="text-secondary-600 mt-1">Academic Term: <span className="font-medium">{term || 'current'}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={() => fetchStatus(term)}>Refresh</SecondaryButton>
            <PrimaryButton onClick={seedDefaults}>Ensure Default Fees (₦120,000)</PrimaryButton>
          </div>
        </div>

        {error && (
          <Card className="border-error">
            <div className="p-4 text-error">{error}</div>
          </Card>
        )}
        {loading && (
          <Card>
            <div className="py-8 text-center">
              <LoadingSpinner className="mx-auto mb-2" />
              <div className="text-secondary-600">Loading fee status...</div>
            </div>
          </Card>
        )}

        {!loading && (
          <Card>
            <div className="flex flex-wrap gap-4 p-4">
              <Badge variant="primary" size="sm">Total Due: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totals.due)}</Badge>
              <Badge variant="success" size="sm">Total Paid: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totals.paid)}</Badge>
              <Badge variant="warning" size="sm">Balance: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totals.balance)}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Class</th>
                    <th className="text-right py-3 px-4">Total Due</th>
                    <th className="text-right py-3 px-4">Total Paid</th>
                    <th className="text-right py-3 px-4">Balance</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const balance = Number(r.balance || 0);
                    const status = balance <= 0 ? 'paid' : balance < 120000 ? 'partial' : 'pending';
                    const statusClasses = status === 'paid' ? 'text-success' : status === 'partial' ? 'text-warning' : 'text-error';
                    const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(n || 0));
                    return (
                      <tr key={r.student_id} className="border-b border-secondary-100">
                        <td className="py-3 px-4">{r.name}</td>
                        <td className="py-3 px-4 text-secondary-600">{r.email}</td>
                        <td className="py-3 px-4">{r.class_level || 'N/A'}</td>
                        <td className="py-3 px-4 text-right">{fmt(r.total_due)}</td>
                        <td className="py-3 px-4 text-right">{fmt(r.total_paid)}</td>
                        <td className="py-3 px-4 text-right font-medium">{fmt(r.balance)}</td>
                        <td className={`py-3 px-4 font-medium ${statusClasses}`}>{status.toUpperCase()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pending Payments for Approval */}
        <Card>
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-secondary-900">Pending Payments</h2>
            <SecondaryButton onClick={fetchPending}>Refresh</SecondaryButton>
          </div>
          {pending.length === 0 ? (
            <div className="p-4 text-secondary-600">No pending payments.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Method</th>
                    <th className="text-left py-3 px-4">Reference</th>
                    <th className="text-left py-3 px-4">Slip</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((p) => {
                    let slipUrl = null;
                    try {
                      const notes = p.notes ? JSON.parse(p.notes) : {};
                      if (notes.slip_path) { slipUrl = `http://localhost/api/${notes.slip_path}`; }
                    } catch {}
                    return (
                      <tr key={p.id} className="border-b border-secondary-100">
                        <td className="py-3 px-4">
                          <div className="font-medium">{p.student_name}</div>
                          <div className="text-xs text-secondary-600">{p.student_email}</div>
                        </td>
                        <td className="py-3 px-4">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(p.amount || 0))}</td>
                        <td className="py-3 px-4">{(p.payment_method || '').replace('_',' ')}</td>
                        <td className="py-3 px-4">{p.reference || '-'}</td>
                        <td className="py-3 px-4">{slipUrl ? <a className="text-primary-700 hover:underline" href={slipUrl} target="_blank" rel="noreferrer">View Slip</a> : '-'}</td>
                        <td className="py-3 px-4">{new Date(p.created_at).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              placeholder="Admin note (optional)"
                              value={notesById[p.id] || ''}
                              onChange={(e) => setNotesById(prev => ({ ...prev, [p.id]: e.target.value }))}
                              className="px-2 py-1 border border-secondary-300 rounded-lg"
                            />
                            <div className="flex gap-2">
                              <PrimaryButton
                                onClick={() => approvePayment(p.id)}
                                disabled={approvingId === p.id}
                              >
                                {approvingId === p.id ? 'Approving...' : 'Approve'}
                              </PrimaryButton>
                              <SecondaryButton
                                onClick={() => rejectPayment(p.id)}
                                disabled={rejectingId === p.id}
                              >
                                {rejectingId === p.id ? 'Rejecting...' : 'Reject'}
                              </SecondaryButton>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
