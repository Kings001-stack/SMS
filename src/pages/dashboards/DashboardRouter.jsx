import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function pathForRole(role) {
  switch (role) {
    case 'teacher':
      return '/dashboard/teacher';
    case 'admin':
      return '/dashboard/admin';
    case 'parent':
      return '/dashboard/parent';
    case 'staff':
      return '/dashboard/staff';
    case 'accountant':
      return '/dashboard/accountant';
    case 'registrar':
      return '/dashboard/registrar';
    case 'student':
    default:
      return '/dashboard/student';
  }
}

export default function DashboardRouter() {
  const { role, user, session, isAuthenticated } = useAuth();
  
  // Debug logging to help troubleshoot
  console.log('🚀 DashboardRouter - Full Auth State:');
  console.log('  - isAuthenticated:', isAuthenticated);
  console.log('  - role:', role);
  console.log('  - user:', user);
  console.log('  - session:', session);
  
  const to = pathForRole(role);
  console.log('🚀 DashboardRouter - Redirecting to:', to);
  
  return <Navigate to={to} replace />;
}

export { pathForRole };
