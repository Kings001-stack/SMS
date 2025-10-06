import { useLocation, useParams, useNavigate } from 'react-router-dom';
import AssignmentList from '../assignments/AssignmentList.jsx';
import AnnouncementList from '../announcements/AnnouncementList.jsx';
import FeeBalance from '../fees/FeeBalance.jsx';
import EnhancedResourceList from '../resources/EnhancedResourceList.jsx';
import AdminOverview from '../admin/AdminOverview.jsx';
import UserManagement from '../admin/UserManagement.jsx';
import SystemReports from '../admin/SystemReports.jsx';
import NewsEventsManager from '../admin/NewsEventsManager.jsx';
import ClassManagement from '../admin/ClassManagement.jsx';
import SubjectManagement from '../admin/SubjectManagement.jsx';
import TeacherAssignments from '../admin/TeacherAssignments.jsx';
import ParentFeesView from '../parent/ParentFeesView.jsx';
import ParentOverview from '../parent/ParentOverview.jsx';
import ParentGradesView from '../parent/ParentGradesView.jsx';
import AdminFeeStatus from '../admin/AdminFeeStatus.jsx';
import { Card, PrimaryButton, ResponsiveGrid } from '../theme/ThemeComponents.jsx';
import {
  FileText,
  BookOpen,
  Megaphone,
  DollarSign,
  Hand,
  Flag,
  CheckCircle
} from 'lucide-react';

export default function FeatureRouter({ user }) {
  const location = useLocation();
  const params = useParams();
  
  // Extract the current feature from the URL parameter or path
  const getCurrentFeature = () => {
    // If we have a section parameter, use it
    if (params.section) {
      return params.section;
    }
    
    // Otherwise, extract from the path
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // If we're at the base dashboard route, show overview
    if (lastSegment === 'student' || lastSegment === 'teacher' || lastSegment === 'admin' || 
        lastSegment === 'parent' || lastSegment === 'staff' || lastSegment === 'accountant' || 
        lastSegment === 'registrar') {
      return 'overview';
    }
    
    return lastSegment;
  };

  const currentFeature = getCurrentFeature();

  const renderFeature = () => {
    switch (currentFeature) {
      case 'assignments':
        return <AssignmentList />;
      
      case 'resources':
        return <EnhancedResourceList />;
      
      case 'announcements':
        return <AnnouncementList />;
      
      case 'fees':
        if (user?.role?.toLowerCase() === 'parent') return <ParentFeesView />;
        if (user?.role?.toLowerCase() === 'admin') return <AdminFeeStatus />;
        return <FeeBalance />;
      
      case 'grades':
        return user?.role?.toLowerCase() === 'parent' ? (
          <ParentGradesView />
        ) : (
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Grade Management</h3>
            <div className="text-center py-8 text-secondary-500">
              <div className="text-4xl mb-4">📊</div>
              <p>Grade management is integrated with assignments.</p>
              <p className="text-sm mt-2">Check the Assignments section to view and manage grades.</p>
            </div>
          </Card>
        );
      
      case 'attendance':
        return (
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Attendance Management</h3>
            <div className="text-center py-8 text-secondary-500">
              <div className="text-4xl mb-4">✅</div>
              <p>Attendance management coming soon!</p>
              <p className="text-sm mt-2">This feature will allow teachers to mark and track student attendance.</p>
            </div>
          </Card>
        );
      
      case 'calendar':
        return (
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">School Calendar</h3>
            <div className="text-center py-8 text-secondary-500">
              <div className="text-4xl mb-4">📅</div>
              <p>School calendar coming soon!</p>
              <p className="text-sm mt-2">This will show important school events, holidays, and academic calendar.</p>
            </div>
          </Card>
        );
      
      // Admin Features
      case 'admin-overview':
        return user?.role?.toLowerCase() === 'admin' ? <AdminOverview /> : <UnauthorizedAccess />;
      
      case 'user-management':
        return user?.role?.toLowerCase() === 'admin' ? <UserManagement /> : <UnauthorizedAccess />;
      
      case 'system-reports':
        return user?.role?.toLowerCase() === 'admin' ? <SystemReports /> : <UnauthorizedAccess />;
      
      case 'news-events':
        return user?.role?.toLowerCase() === 'admin' ? <NewsEventsManager /> : <UnauthorizedAccess />;
      
      case 'class-management':
        return user?.role?.toLowerCase() === 'admin' ? <ClassManagement /> : <UnauthorizedAccess />;
      
      case 'subject-management':
        return user?.role?.toLowerCase() === 'admin' ? <SubjectManagement /> : <UnauthorizedAccess />;
      
      case 'teacher-assignments':
        return user?.role?.toLowerCase() === 'admin' ? <TeacherAssignments /> : <UnauthorizedAccess />;
      
      case 'overview':
        return user?.role?.toLowerCase() === 'parent' ? <ParentOverview /> : <DashboardOverview user={user} />;
      default:
        return <DashboardOverview user={user} />;
    }
  };

  return (
    <div>
      {renderFeature()}
    </div>
  );
}

function DashboardOverview({ user }) {
  const role = user?.role?.toLowerCase();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get base path for navigation
  const basePath = location.pathname.split('/').slice(0, 3).join('/');
  
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-white to-primary-50 border-primary-200" hover>
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900">
              Welcome back, {user?.name}!
            </h2>
            <Hand className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-secondary-600 mb-6 text-lg">
            {role === 'student' && "Here's your academic dashboard. Check your assignments, resources, and announcements."}
            {role === 'teacher' && "Manage your classes, share resources, and track student progress from your teacher dashboard."}
            {role === 'admin' && "Monitor the entire school system, manage users, and access comprehensive reports."}
          </p>
        </div>
        
        <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: role === 'teacher' ? 3 : 4 }} gap="lg">
          <DashboardCard 
            title="Assignments" 
            description={role === 'student' ? "View and submit assignments" : "Create and grade assignments"}
            icon={FileText}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
            borderColor="border-blue-200"
            onClick={() => navigate(`${basePath}/assignments`)}
          />
          
          <DashboardCard 
            title="Resources" 
            description={role === 'student' ? "Access learning materials" : "Share resources with classes"}
            icon={BookOpen}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
            borderColor="border-purple-200"
            onClick={() => navigate(`${basePath}/resources`)}
          />
          
          <DashboardCard 
            title="Announcements" 
            description={role === 'student' ? "Read school updates" : "Post announcements"}
            icon={Megaphone}
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
            borderColor="border-orange-200"
            onClick={() => navigate(`${basePath}/announcements`)}
          />
          
          {role !== 'teacher' && (
            <DashboardCard 
              title="Fees" 
              description={role === 'student' ? "Check fee balance" : "Monitor fee payments"}
              icon={DollarSign}
              bgColor="bg-green-50"
              iconColor="text-green-600"
              borderColor="border-green-200"
              onClick={() => navigate(`${basePath}/fees`)}
            />
          )}
        </ResponsiveGrid>
      </Card>

      {/* Enhanced Resource Sharing Notice */}
      <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200" glow>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center shadow-red">
              <Flag className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              Enhanced Class-Based Resource Sharing
            </h3>
            <p className="text-primary-800 mb-4">
              {role === 'teacher' && "You can now share resources and assignments directly with specific classes you teach. Manage your class assignments and target your content precisely."}
              {role === 'student' && "Your teachers can now share resources and assignments specifically with your class. Check the Resources section for materials targeted to your class level."}
              {role === 'admin' && "The system now supports class-based resource sharing with teacher-class relationships. Monitor resource distribution and class assignments from the admin panel."}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm border border-primary-200">
                <CheckCircle className="w-4 h-4" />
                Class-specific sharing
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm border border-primary-200">
                <CheckCircle className="w-4 h-4" />
                Teacher-class management
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm border border-primary-200">
                <CheckCircle className="w-4 h-4" />
                Assignment tracking
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm border border-primary-200">
                <CheckCircle className="w-4 h-4" />
                Visibility controls
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DashboardCard({ title, description, icon: Icon, bgColor, iconColor, borderColor, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-xl transform hover:scale-105 cursor-pointer ${bgColor} ${borderColor}`}
    >
      <div className="mb-4">
        <Icon className={`w-10 h-10 ${iconColor}`} strokeWidth={2} />
      </div>
      <h3 className={`font-bold mb-2 text-lg ${iconColor}`}>{title}</h3>
      <p className="text-sm text-secondary-600 leading-relaxed">{description}</p>
    </div>
  );
}

function UnauthorizedAccess() {
  return (
    <Card className="text-center">
      <div className="py-8">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Access Denied</h3>
        <p className="text-secondary-600">You don't have permission to access this feature.</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => window.location.reload()}>
            Go Back
          </PrimaryButton>
        </div>
      </div>
    </Card>
  );
}