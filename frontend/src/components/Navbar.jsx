import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar component with role-based navigation links.
 * Shows different links depending on the user's role.
 */
export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🎓</span>
                    <span className="brand-text">SmartComplaint</span>
                </Link>

                <div className="navbar-links">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link nav-link-primary">Register</Link>
                        </>
                    ) : (
                        <>
                            {/* Student Navigation */}
                            {user.role === 'STUDENT' && (
                                <>
                                    <Link to="/student/dashboard" className="nav-link">Dashboard</Link>
                                    <Link to="/student/submit-complaint" className="nav-link">Submit Complaint</Link>
                                    <Link to="/student/my-complaints" className="nav-link">My Complaints</Link>
                                </>
                            )}

                            {/* Admin Navigation */}
                            {user.role === 'ADMIN' && (
                                <>
                                    <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                                    <Link to="/admin/complaints" className="nav-link">All Complaints</Link>
                                </>
                            )}

                            {/* Staff Navigation */}
                            {user.role === 'STAFF' && (
                                <>
                                    <Link to="/staff/dashboard" className="nav-link">Dashboard</Link>
                                    <Link to="/staff/complaints" className="nav-link">Assigned Tasks</Link>
                                </>
                            )}

                            {/* User info and logout */}
                            <div className="nav-user">
                                <span className="nav-user-name">{user.fullName}</span>
                                <span className="nav-role-badge">{user.role}</span>
                                <button onClick={handleLogout} className="btn-logout">Logout</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
