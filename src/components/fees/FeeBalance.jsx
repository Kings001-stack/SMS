import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, PrimaryButton, Container, ResponsiveGrid } from '../theme/ThemeComponents.jsx';

const FeeBalance = () => {
  const { user, token } = useAuth();
  const [feeData, setFeeData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const userRole = user?.role?.toLowerCase();

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);

      // Fetch fee summary/balance
      const balanceResponse = await fetch('http://localhost/api/fees', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (balanceResponse.ok) {
        const result = await balanceResponse.json();
        setFeeData(result.data || []);
      }

      // Fetch payment history (if endpoint exists)
      const paymentsResponse = await fetch('http://localhost/api/fees/payments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (paymentsResponse.ok) {
        const result = await paymentsResponse.json();
        setPayments(result.data || []);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSlipUpload = async (e) => {
    e.preventDefault();
    try {
      if (!slipFile) throw new Error('Please select a payment slip to upload');
      setUploading(true);
      const form = new FormData();
      form.append('amount', String(paymentAmount || '0'));
      form.append('payment_method', paymentMethod || 'bank_transfer');
      if (reference) form.append('reference', reference);
      form.append('slip', slipFile);

      const resp = await fetch('http://localhost/api/fees/slip', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to upload slip');
      }
      // Reset
      setSlipFile(null);
      setReference('');
      setPaymentAmount('');
      setPaymentMethod('bank_transfer');
      setShowPaymentForm(false);
      await fetchFeeData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/api/fees/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          reference: reference || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      setShowPaymentForm(false);
      setPaymentAmount('');
      setPaymentMethod('cash');
      setReference('');
      fetchFeeData();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount || 0);
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return '💵';
      case 'bank_transfer':
        return '🏦';
      case 'online':
        return '💳';
      case 'check':
        return '📝';
      default:
        return '💰';
    }
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading fee information...</p>
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
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Fee Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <PrimaryButton onClick={fetchFeeData}>
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
            <h1 className="text-2xl font-bold text-secondary-900">Fee Management</h1>
            <p className="text-secondary-600 mt-1">
              {userRole === 'student'
                ? "Check your fee balance and payment history"
                : "Monitor student fee payments and financial records"
              }
            </p>
          </div>

          {userRole === 'student' && feeData?.balance > 0 && (
            <PrimaryButton
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="flex items-center gap-2"
            >
              <span>💳</span>
              Make Payment
            </PrimaryButton>
          )}
        </div>

        {/* Fee Balance Summary */}
        {feeData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-lg font-semibold text-green-900 mb-1">Total Paid</h3>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(feeData.total_paid)}</p>
            </Card>

            <Card className="text-center bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">Outstanding Balance</h3>
              <p className={`text-2xl font-bold ${feeData.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {formatCurrency(feeData.balance)}
              </p>
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

        {/* Payment Form */}
        {showPaymentForm && (
          <Card className="bg-primary-50 border-primary-200">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Make a Payment</h3>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Payment Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="online">Online Payment</option>
                    <option value="check">Check</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Reference/Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter payment reference"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Payment Slip Upload */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Upload Payment Slip (Image/PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-secondary-500 mt-1">If you paid via bank transfer or cash deposit, upload your receipt for admin approval.</p>
              </div>

              <div className="flex gap-2">
                <PrimaryButton type="submit">
                  Process Payment
                </PrimaryButton>
                <button
                  type="button"
                  onClick={handleSlipUpload}
                  disabled={uploading || !slipFile || !paymentAmount}
                  className={`px-4 py-2 rounded-lg border ${uploading || !slipFile || !paymentAmount ? 'bg-secondary-100 text-secondary-400 border-secondary-200' : 'text-primary-700 border-primary-300 hover:bg-primary-100'}`}
                >
                  {uploading ? 'Uploading...' : 'Upload Slip for Approval'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setPaymentAmount('');
                    setPaymentMethod('cash');
                    setReference('');
                    setSlipFile(null);
                  }}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-800 border border-secondary-300 rounded-lg hover:bg-secondary-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Payment History */}
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
                    <div className="text-2xl">{getPaymentMethodIcon(payment.payment_method)}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-secondary-900">
                          {formatCurrency(payment.amount)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {payment.status?.toUpperCase()}
                        </span>
                        <span className="text-sm text-secondary-500">
                          {payment.payment_method?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600">
                        {formatDate(payment.created_at)}
                        {payment.reference && ` • Ref: ${payment.reference}`}
                      </p>
                    </div>
                  </div>

                  {(userRole === 'admin' || userRole === 'teacher') && (
                    <div className="text-right">
                      <p className="text-sm text-secondary-500">Student:</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {payment.student_name || 'Unknown'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Fee Breakdown (if available) */}
        {feeData?.breakdown && feeData.breakdown.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Fee Breakdown</h3>
            <div className="space-y-2">
              {feeData.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-secondary-100 last:border-b-0">
                  <span className="text-secondary-700">{item.description}</span>
                  <span className="font-medium text-secondary-900">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions for Admins/Teachers */}
        {(userRole === 'admin' || userRole === 'teacher') && (
          <Card className="bg-secondary-50 border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Fee Management Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PrimaryButton className="flex items-center justify-center gap-2">
                <span>📊</span>
                Generate Report
              </PrimaryButton>
              <PrimaryButton className="flex items-center justify-center gap-2">
                <span>📧</span>
                Send Reminders
              </PrimaryButton>
              <PrimaryButton className="flex items-center justify-center gap-2">
                <span>⚙️</span>
                Fee Settings
              </PrimaryButton>
            </div>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default FeeBalance;