import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('admin_token');

  if (!token) {
    // Redirect to login and save the attempted URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const path = location.pathname;

  // Protect student portal routes
  if (userRole === 'Student' && !path.startsWith('/student') && path !== '/dashboard' && path !== '/' && path !== '/profile') {
    return <Navigate to="/student/dashboard" replace />;
  }

  // Protect academic routes for librarians, etc.
  if (userRole === 'Librarian' && !path.startsWith('/library') && path !== '/dashboard' && path !== '/' && path !== '/profile') {
     return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
