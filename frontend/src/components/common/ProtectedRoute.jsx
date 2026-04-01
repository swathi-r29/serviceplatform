import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if worker is approved
  if (user.role === 'worker' && user.isApproved === false) {
    // If they have a session but are not approved (e.g. revoked), kick them out
    console.warn('Access denied: Worker not approved');
    logout();
    return <Navigate to="/login" state={{ message: 'Awaiting admin approval' }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;