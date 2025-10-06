import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Card, 
  PrimaryButton, 
  SecondaryButton, 
  Badge, 
  Container,
  ResponsiveGrid,
  LoadingSpinner
} from '../theme/ThemeComponents.jsx';
import {
  Users,
  GraduationCap,
  UserCog,
  UsersRound,
  FileText,
  BookOpen,
  Megaphone,
  Activity,
  XCircle,
  RefreshCw,
  Building2
} from 'lucide-react';

export default function AdminOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log('AdminOverview rendering, token:', token ? 'exists' : 'missing');

  useEffect(() => {
    if (token) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if token exists
      if (!token) {
        setLoading(false);
        setError('Authentication token not found. Please login again.');
        return;
      }

      // Fetch user statistics
      const usersResponse = await fetch('http://localhost/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!usersResponse.ok) {
        const errorData = await usersResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch user statistics (${usersResponse.status})`);
      }

      const usersResponse_json = await usersResponse.json();
      console.log('API Response:', usersResponse_json); // Debug log
      
      // Extract users array from API response
      const usersData = usersResponse_json.data || usersResponse_json || [];
      
      // Count users by role
      const totalUsers = usersData.length;
      const totalStudents = usersData.filter(user => user?.role === 'student').length;
      const totalTeachers = usersData.filter(user => user?.role === 'teacher').length;
      const totalParents = usersData.filter(user => user?.role === 'parent').length;
      const totalStaff = usersData.filter(user => ['teacher', 'admin', 'staff', 'accountant', 'registrar'].includes(user?.role)).length;

      // Fetch assignments count
      let totalAssignments = 0;
      try {
        const assignmentsResponse = await fetch('http://localhost/api/assignments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (assignmentsResponse.ok) {
          const assignmentsResponse_json = await assignmentsResponse.json();
          const assignmentsData = assignmentsResponse_json.data || assignmentsResponse_json || [];
          totalAssignments = assignmentsData.length;
        }
      } catch (e) {
        console.log('Assignments data not available');
      }

      // Fetch resources count
      let totalResources = 0;
      try {
        const resourcesResponse = await fetch('http://localhost/api/resources', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resourcesResponse.ok) {
          const resourcesResponse_json = await resourcesResponse.json();
          const resourcesData = resourcesResponse_json.data || resourcesResponse_json || [];
          totalResources = resourcesData.length;
        }
      } catch (e) {
        console.log('Resources data not available');
      }

      // Fetch announcements count
      let totalAnnouncements = 0;
      try {
        const announcementsResponse = await fetch('http://localhost/api/announcements', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (announcementsResponse.ok) {
          const announcementsResponse_json = await announcementsResponse.json();
          const announcementsData = announcementsResponse_json.data || announcementsResponse_json || [];
          totalAnnouncements = announcementsData.length;
        }
      } catch (e) {
        console.log('Announcements data not available');
      }

      // Calculate system health (simple metric based on successful API calls)
      const apiCallsSuccessful = [usersResponse.ok].filter(Boolean).length;
      const systemHealth = (apiCallsSuccessful / 1) * 100; // Based on critical API calls

      const newStats = {
        totalUsers,
        totalStudents,
        totalStaff,
        totalParents,
        totalAssignments,
        totalResources,
        totalAnnouncements,
        pendingFees: 0, // Will be implemented when fee system is connected
        systemHealth
      };
      
      console.log('Setting new stats:', newStats); // Debug log
      setStats(newStats);

    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Card className="text-center">
          <div className="py-8">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Loading Admin Overview</h3>
            <p className="text-secondary-600">Fetching system statistics...</p>
          </div>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card className="text-center border-error">
          <div className="py-8">
            <div className="mb-4">
              <XCircle className="w-16 h-16 text-error mx-auto" />
            </div>
            <p className="font-medium text-error mb-2">Error loading admin data</p>
            <p className="text-sm text-secondary-600 mb-4">{error}</p>
            <div className="space-y-2 text-xs text-secondary-500 mb-4">
              <p>Troubleshooting tips:</p>
              <ul className="list-disc list-inside text-left max-w-md mx-auto">
                <li>Make sure Apache is running in XAMPP</li>
                <li>Check that the API is accessible at http://localhost/api/test</li>
                <li>Verify you're logged in as an admin</li>
                <li>Check browser console for detailed errors (F12)</li>
              </ul>
            </div>
            <PrimaryButton onClick={fetchStats}>
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Try Again
            </PrimaryButton>
          </div>
        </Card>
      </Container>
    );
  }
  
  // Add safety check for stats
  if (!stats) {
    return (
      <Container>
        <Card className="text-center">
          <div className="py-8">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-secondary-600">Initializing admin dashboard...</p>
          </div>
        </Card>
      </Container>
    );
  }

  // Ensure stats object has all required properties
  const safeStats = {
    totalUsers: stats.totalUsers || 0,
    totalStudents: stats.totalStudents || 0,
    totalStaff: stats.totalStaff || 0,
    totalParents: stats.totalParents || 0,
    totalAssignments: stats.totalAssignments || 0,
    totalResources: stats.totalResources || 0,
    totalAnnouncements: stats.totalAnnouncements || 0,
    systemHealth: stats.systemHealth || 0
  };

  const statCards = [
    {
      title: 'Total Users',
      value: safeStats.totalUsers,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      description: 'All registered users'
    },
    {
      title: 'Students',
      value: safeStats.totalStudents,
      icon: GraduationCap,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      description: 'Active students'
    },
    {
      title: 'Staff',
      value: safeStats.totalStaff,
      icon: UserCog,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      description: 'All staff members'
    },
    {
      title: 'Parents',
      value: safeStats.totalParents,
      icon: UsersRound,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      description: 'Parent accounts'
    },
    {
      title: 'Assignments',
      value: safeStats.totalAssignments,
      icon: FileText,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
      description: 'Total assignments'
    },
    {
      title: 'Resources',
      value: safeStats.totalResources,
      icon: BookOpen,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      borderColor: 'border-pink-200',
      description: 'Learning materials'
    },
    {
      title: 'Announcements',
      value: safeStats.totalAnnouncements,
      icon: Megaphone,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      description: 'Posted announcements'
    },
    {
      title: 'System Health',
      value: `${Math.round(safeStats.systemHealth)}%`,
      icon: Activity,
      bgColor: safeStats.systemHealth >= 90 ? 'bg-emerald-50' : safeStats.systemHealth >= 70 ? 'bg-yellow-50' : 'bg-red-50',
      iconColor: safeStats.systemHealth >= 90 ? 'text-emerald-600' : safeStats.systemHealth >= 70 ? 'text-yellow-600' : 'text-red-600',
      borderColor: safeStats.systemHealth >= 90 ? 'border-emerald-200' : safeStats.systemHealth >= 70 ? 'border-yellow-200' : 'border-red-200',
      description: 'API connectivity'
    }
  ];

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-secondary-900">
                  School Management System Overview
                </h2>
              </div>
              <p className="text-secondary-600">
                Complete system monitoring and administrative control panel
              </p>
            </div>
            <div className="flex gap-2">
              <SecondaryButton onClick={fetchStats} size="sm" className="inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </SecondaryButton>
            </div>
          </div>
        </Card>

        {/* Statistics Grid */}
        <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 4 }} gap="lg">
          {statCards.map((stat, index) => (
            <Card 
              key={index}
              className={`text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${stat.bgColor} ${stat.borderColor} border-2`}
              hover
            >
              <div className="mb-3">
                <stat.icon className={`w-10 h-10 mx-auto ${stat.iconColor}`} strokeWidth={2} />
              </div>
              <div className={`text-3xl font-bold mb-1 ${stat.iconColor}`}>
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-secondary-700 mb-2">
                {stat.title}
              </div>
              <div className="text-xs text-secondary-600">
                {stat.description}
              </div>
            </Card>
          ))}
        </ResponsiveGrid>
      </div>
    </Container>
  );
}