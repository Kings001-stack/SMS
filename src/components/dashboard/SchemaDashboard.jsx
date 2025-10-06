import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import FeatureRouter from './FeatureRouter.jsx';
import Sidebar from './Sidebar.jsx';

export default function SchemaDashboard({ schema, basePath }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const layout = useMemo(() => ({
    sidebarWidth: sidebarCollapsed ? 'md:w-16' : 'md:w-64',
    contentMarginLeft: sidebarCollapsed ? 'md:ml-16' : 'md:ml-64',
    headerLeftOffset: sidebarCollapsed ? 'md:left-16' : 'md:left-64',
  }), [sidebarCollapsed]);

  // If no schema is provided, use the FeatureRouter directly
  if (!schema) {
    return <FeatureRouter user={user} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        schema={schema} 
        basePath={basePath}
        isCollapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ml-0 ${layout.contentMarginLeft}`}>
        {/* Header */}
        <header className={`bg-white shadow-sm border-b border-gray-200 px-6 py-4 pl-16 md:pl-6 fixed top-0 right-0 left-0 ${layout.headerLeftOffset} z-30`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {schema.title || `${user?.role} Dashboard`}
              </h1>
              <p className="text-gray-600 mt-1">
                {schema.description || `Welcome to your ${user?.role?.toLowerCase()} dashboard`}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                title="Back to Home"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Back to Home</span>
              </button>
              
              <div className="text-sm text-gray-500 hidden md:block">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto pt-24">
          {/* Content will be rendered by the routing system for feature routes */}
          {/* For base dashboard route, show overview */}
          <FeatureRouter user={user} />
        </main>
      </div>
    </div>
  );
}
