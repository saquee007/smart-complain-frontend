import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component.
 * Wraps routes that require authentication and specific roles.
 * 
 * Props:
 *   - children: The component to render if authorized
 *   - roles: Array of allowed roles (e.g., ['STUDENT', 'ADMIN'])
 */
export default function ProtectedRoute({ children, roles }) {
    const { user, loading, isAuthenticated } = useAuth();

    // Show nothing while checking auth state
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role authorization
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/access-denied" replace />;
    }

    return children;
}
