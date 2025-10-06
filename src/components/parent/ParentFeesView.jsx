import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, PrimaryButton, Container } from '../theme/ThemeComponents.jsx';

export default function ParentFeesView() {
  const { token } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [feeData, setFeeData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchFeeData(selectedChildId);
    } else {
      setFeeData(null);
      setPayments([]);
    }
  }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost/api/parent/children', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to load children');
      const result = await res.json();
      const list = result.data || [];
      setChildren(list);
      if (list.length > 0) setSelectedChildId(String(list[0].id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeData = async (studentId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch fee summary for selected child
      const balanceRes = await fetch(`http://localhost/api/parent/fees?student_id=${encodeURIComponent(studentId)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!balanceRes.ok) throw new Error('Failed to load fee balance');
      const balanceJson = await balanceRes.json();
      setFeeData(balanceJson.data || {});

      // Fetch payment history for selected child
      const paymentsRes = await fetch(`http://localhost/api/parent/fees/payments?student_id=${encodeURIComponent(studentId)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (paymentsRes.ok) {
        const paymentsJson = await paymentsRes.json();
        setPayments(paymentsJson.data || []);
      } else {
        setPayments([]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amount || 0);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Child Fees</h1>
            <p className="text-secondary-600 mt-1">Select a child to view fee balance and payments</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Child</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>{c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || `Student #${c.id}`}</option>
              ))}
            </select>
            <PrimaryButton onClick={() => selectedChildId && fetchFeeData(selectedChildId)} disabled={!selectedChildId}>
              Refresh
            </PrimaryButton>
          </div>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <span>❌</span>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
            </div>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-secondary-600">Loading...</p>
              </div>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        {feeData && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-lg font-semibold text-green-900 mb-1">Total Paid</h3>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(feeData.total_paid)}</p>
            </Card>

            <Card className="text-center bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">Outstanding Balance</h3>
              <p className={`text-2xl font-bold ${feeData.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>{formatCurrency(feeData.balance)}</p>
            </Card>

            <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Payment Status</h3>
              <p className={`text-lg font-semibold ${feeData.balance <= 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                {feeData.balance <= 0 ? 'All Clear' : 'Payment Due'}
              </p>
            </Card>
          </div>
        )}

        {/* Payment History */}
        {selectedChildId && (
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Payment History</h3>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-secondary-600">No payment history available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💳</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-secondary-900">{formatCurrency(payment.amount)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {String(payment.status || '').toUpperCase()}
                          </span>
                          <span className="text-sm text-secondary-500">{String(payment.payment_method || '').replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-secondary-600">
                          {formatDate(payment.created_at)}{payment.reference ? ` • Ref: ${payment.reference}` : ''}
                        </p>
                      </div>
                    </div>
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
