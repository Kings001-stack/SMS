import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, PrimaryButton, Container } from '../theme/ThemeComponents.jsx';
import {
  BookOpen,
  DollarSign,
  Users,
  BarChart3,
  CheckCircle,
  Flag,
  Download,
  Calendar,
  RefreshCw,
  AlertCircle,
  FileText,
  PieChart,
  TrendingUp,
  Settings,
  Activity,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const SystemReports = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReportType, setSelectedReportType] = useState('overview');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });

  const reportTypes = [
    { id: 'overview', label: 'System Overview', icon: BarChart3, description: 'Overall system statistics and metrics', color: 'blue' },
    { id: 'academic', label: 'Academic Reports', icon: BookOpen, description: 'Assignments, submissions, and grades', color: 'green' },
    { id: 'financial', label: 'Financial Reports', icon: DollarSign, description: 'Fee payments and outstanding balances', color: 'yellow' },
    { id: 'user_activity', label: 'User Activity', icon: Users, description: 'User engagement and activity logs', color: 'purple' },
    { id: 'attendance', label: 'Attendance Reports', icon: CheckCircle, description: 'Class attendance records', color: 'indigo' },
    { id: 'announcements', label: 'Announcements', icon: Flag, description: 'Communication and announcements', color: 'pink' }
  ];


  const fetchReports = async () => {
    // This function is no longer needed as we generate reports on demand
    return;
  };

  const generateReport = async (type) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const url = `http://localhost/api/reports?type=${type}&start_date=${dateRange.start}&end_date=${dateRange.end}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || `Failed to generate ${type} report`);
      }

      setReportData({ type, data: result.data, generatedAt: new Date() });
      setSuccess(`${type.replace('_', ' ')} report generated successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;

    const dataStr = JSON.stringify(reportData.data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${reportData.type}_report_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
      day: 'numeric'
    });
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    const { type, data } = reportData;

    switch (type) {
      case 'academic':
        return renderAcademicReport(data);
      case 'financial':
        return renderFinancialReport(data);
      case 'user_activity':
        return renderUserActivityReport(data);
      case 'system_health':
        return renderSystemHealthReport(data);
      default:
        return <p>No report data available</p>;
    }
  };

  const renderAcademicReport = (data) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="mb-2">
            <BarChart3 className="w-8 h-8 mx-auto text-primary-600" />
          </div>
          <h4 className="font-semibold">Total Students</h4>
          <p className="text-2xl font-bold text-primary-600">{data.total_students || 0}</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <FileText className="w-8 h-8 mx-auto text-accent-600" />
          </div>
          <h4 className="font-semibold">Assignments</h4>
          <p className="text-2xl font-bold text-accent-600">{data.total_assignments || 0}</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <CheckCircle className="w-8 h-8 mx-auto text-success-600" />
          </div>
          <h4 className="font-semibold">Submissions</h4>
          <p className="text-2xl font-bold text-success-600">{data.total_submissions || 0}</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <Flag className="w-8 h-8 mx-auto text-warning-600" />
          </div>
          <h4 className="font-semibold">Avg Grade</h4>
          <p className="text-2xl font-bold text-warning-600">{data.average_grade || 0}%</p>
        </Card>
      </div>

      {data.subject_performance && (
        <Card>
          <h4 className="font-semibold mb-4">Subject Performance</h4>
          <div className="space-y-2">
            {data.subject_performance.map((subject, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-secondary-50 rounded">
                <span>{subject.name}</span>
                <span className="font-medium">{subject.average_grade}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderFinancialReport = (data) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="mb-2">
            <DollarSign className="w-8 h-8 mx-auto text-green-600" />
          </div>
          <h4 className="font-semibold">Total Revenue</h4>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.total_revenue)}</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <PieChart className="w-8 h-8 mx-auto text-red-600" />
          </div>
          <h4 className="font-semibold">Outstanding</h4>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(data.total_outstanding)}</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <TrendingUp className="w-8 h-8 mx-auto text-blue-600" />
          </div>
          <h4 className="font-semibold">Collection Rate</h4>
          <p className="text-2xl font-bold text-blue-600">{data.collection_rate || 0}%</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <Users className="w-8 h-8 mx-auto text-primary-600" />
          </div>
          <h4 className="font-semibold">Paid Students</h4>
          <p className="text-2xl font-bold text-primary-600">{data.paid_students || 0}</p>
        </Card>
      </div>

      {data.payment_trends && (
        <Card>
          <h4 className="font-semibold mb-4">Payment Trends (Last 30 Days)</h4>
          <div className="space-y-2">
            {data.payment_trends.map((trend, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-secondary-50 rounded">
                <span>{formatDate(trend.date)}</span>
                <span className="font-medium">{formatCurrency(trend.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderUserActivityReport = (data) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="mb-2">
            <Users className="w-8 h-8 mx-auto text-primary-600" />
          </div>
          <h4 className="font-semibold">Total Users</h4>
          <p className="text-2xl font-bold text-primary-600">{data.total_users || 0}</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <Settings className="w-8 h-8 mx-auto text-green-600" />
          </div>
          <h4 className="font-semibold">Active Sessions</h4>
          <p className="text-2xl font-bold text-green-600">{data.active_sessions || 0}</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <BookOpen className="w-8 h-8 mx-auto text-accent-600" />
          </div>
          <h4 className="font-semibold">Resources Downloaded</h4>
          <p className="text-2xl font-bold text-accent-600">{data.resource_downloads || 0}</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <FileText className="w-8 h-8 mx-auto text-warning-600" />
          </div>
          <h4 className="font-semibold">Assignments Submitted</h4>
          <p className="text-2xl font-bold text-warning-600">{data.assignment_submissions || 0}</p>
        </Card>
      </div>

      {data.user_engagement && (
        <Card>
          <h4 className="font-semibold mb-4">User Engagement by Role</h4>
          <div className="space-y-2">
            {data.user_engagement.map((role, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-secondary-50 rounded">
                <span className="capitalize">{role.role}</span>
                <span className="font-medium">{role.login_count} logins</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderSystemHealthReport = (data) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="mb-2">
            <Activity className="w-8 h-8 mx-auto text-green-600" />
          </div>
          <h4 className="font-semibold">Uptime</h4>
          <p className="text-2xl font-bold text-green-600">{data.uptime_percentage || 0}%</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <PieChart className="w-8 h-8 mx-auto text-blue-600" />
          </div>
          <h4 className="font-semibold">DB Status</h4>
          <p className={`text-lg font-bold ${data.database_status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
            {data.database_status || 'Unknown'}
          </p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <Activity className="w-8 h-8 mx-auto text-blue-600" />
          </div>
          <h4 className="font-semibold">Avg Response</h4>
          <p className="text-2xl font-bold text-blue-600">{data.avg_response_time || 0}ms</p>
        </Card>
        <Card className="text-center">
          <div className="mb-2">
            <AlertTriangle className="w-8 h-8 mx-auto text-red-600" />
          </div>
          <h4 className="font-semibold">Error Rate</h4>
          <p className="text-2xl font-bold text-red-600">{data.error_rate || 0}%</p>
        </Card>
      </div>

      {data.system_alerts && data.system_alerts.length > 0 && (
        <Card>
          <h4 className="font-semibold mb-4 text-red-600">System Alerts</h4>
          <div className="space-y-2">
            {data.system_alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">{alert.message}</p>
                  <p className="text-sm text-red-600">{formatDate(alert.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h4 className="font-semibold mb-4">System Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-secondary-50 rounded">
            <h5 className="font-medium">CPU Usage</h5>
            <p className="text-2xl font-bold text-primary-600">{data.cpu_usage || 0}%</p>
          </div>
          <div className="text-center p-4 bg-secondary-50 rounded">
            <h5 className="font-medium">Memory Usage</h5>
            <p className="text-2xl font-bold text-accent-600">{data.memory_usage || 0}%</p>
          </div>
          <div className="text-center p-4 bg-secondary-50 rounded">
            <h5 className="font-medium">Disk Usage</h5>
            <p className="text-2xl font-bold text-warning-600">{data.disk_usage || 0}%</p>
          </div>
        </div>
      </Card>
    </div>
  );

  if (loading && !reportData) {
    return (
      <Container>
        <Card>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Generating report...</p>
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
            <div className="mb-4">
              <XCircle className="w-16 h-16 text-red-600 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Generating Report</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <PrimaryButton onClick={() => setError(null)}>
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
            <h1 className="text-2xl font-bold text-secondary-900">System Reports</h1>
            <p className="text-secondary-600 mt-1">
              Comprehensive analytics and insights for school administration
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <Card className="bg-secondary-50 border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Report Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <PrimaryButton
                onClick={() => generateReport(selectedReportType)}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </PrimaryButton>
            </div>
          </div>
        </Card>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedReportType === report.id
                  ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                  : 'hover:bg-secondary-50'
              }`}
              onClick={() => setSelectedReportType(report.id)}
            >
              <div className="text-center">
                <div className="mb-3">
                  <report.icon className="w-8 h-8 mx-auto text-primary-600" />
                </div>
                <h4 className="font-semibold text-secondary-900 mb-2">{report.label}</h4>
                <p className="text-sm text-secondary-600">{report.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Report Content */}
        {reportData && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900">
                    {reportTypes.find(r => r.id === reportData.type)?.label} Report
                  </h3>
                  <p className="text-primary-700">
                    Generated on {formatDate(reportData.generatedAt)} for period: {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <PrimaryButton onClick={exportReport} size="sm" className="inline-flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export JSON
                  </PrimaryButton>
                </div>
              </div>
            </Card>

            {renderReportContent()}
          </div>
        )}

        {/* Quick Stats */}
        {reports.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Reports</h3>
            <div className="space-y-2">
              {reports.slice(0, 5).map((report, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-secondary-50 rounded">
                  <div>
                    <span className="font-medium capitalize">{report.type.replace('_', ' ')}</span>
                    <span className="text-secondary-500 ml-2">
                      {formatDate(report.generated_at)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default SystemReports;