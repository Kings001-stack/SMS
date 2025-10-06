import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../ui/Icon.jsx';

export default function Sidebar({ schema, basePath, isCollapsed: controlledCollapsed, onCollapseChange }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isCollapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = (next) => {
    if (typeof onCollapseChange === 'function') {
      onCollapseChange(next);
    } else {
      setInternalCollapsed(next);
    }
  };

  const handleFeatureClick = (featureId) => {
    // For overview, navigate to the base dashboard route
    if (featureId === 'overview') {
      navigate(basePath);
    } else {
      // For other features, navigate to the section route
      const routePath = `${basePath}/${featureId}`;
      navigate(routePath);
    }
    setIsMobileMenuOpen(false); // Close mobile menu when feature is selected
  };

  const isActiveFeature = (featureId) => {
    // Check if we're on the exact feature route
    const isExactMatch = location.pathname === `${basePath}/${featureId}`;
    
    // Check if we're on the base route and this is the overview feature
    const isOverviewOnBase = featureId === 'overview' && location.pathname === basePath;
    
    // Also check if the current pathname ends with the featureId (for URL parameters)
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    const isParameterMatch = lastSegment === featureId;
    
    return isExactMatch || isOverviewOnBase || isParameterMatch;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-6 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        bg-white shadow-lg border-r border-gray-200 transition-all duration-300 h-screen flex flex-col
        ${isCollapsed ? 'w-16' : 'w-64'}
        fixed left-0 top-0 z-50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <img src="/src/assets/logo.png" alt="Logo" className="w-8 h-8" />
              <div className="leading-tight">
                <div className="font-bold text-primary text-sm">Immaculate Heart</div>
                <div className="text-xs text-gray-600">Int'l School</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {user?.email || 'user@example.com'}
              </div>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  user?.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                  user?.role === 'teacher' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  user?.role === 'student' ? 'bg-green-100 text-green-700 border-green-200' :
                  'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {user?.role?.toUpperCase() || 'USER'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400`}>
        <div className="space-y-2">
          {schema?.features?.map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className={`w-full flex items-center rounded-lg text-left transition-colors ${
                isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'
              } ${
                isActiveFeature(feature.id)
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isCollapsed ? feature.title : ''}
            >
              <Icon name={feature.icon} className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-gray-500 truncate">{feature.description}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
          title={isCollapsed ? 'Logout' : ''}
        >
          <Icon name="logout" className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
    </>
  );
}
