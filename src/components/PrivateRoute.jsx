import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('admin_token');

  if (!token) {
    // Redirect to login and save the attempted URL
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const path = location.pathname;

  const roleLower = userRole.toLowerCase();

  // Protect student portal routes
  if (roleLower === 'student' && !path.startsWith('/student') && path !== '/profile') {
    return <Navigate to="/student/dashboard" replace />;
  }

  // Protect library routes for librarian
  if (roleLower === 'librarian' && !path.startsWith('/library') && path !== '/profile') {
    return <Navigate to="/library/dashboard" replace />;
  }

  // Protect hostel warden routes
  if ((roleLower === 'hostel' || roleLower.includes('warden')) && !path.startsWith('/hostel-warden') && path !== '/profile') {
    return <Navigate to="/hostel-warden/dashboard" replace />;
  }

  // Protect teacher portal routes
  if ((roleLower === 'teacher' || roleLower === 'teacher role') && !path.startsWith('/teacher') && path !== '/profile') {
    return <Navigate to="/teacher-portal/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
