import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Home / Welcome page.
 * Shows a hero section explaining the system and links to get started.
 */
export default function HomePage() {
    const { isAuthenticated, user } = useAuth();

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'STUDENT': return '/student/dashboard';
            case 'ADMIN': return '/admin/dashboard';
            case 'STAFF': return '/staff/dashboard';
            default: return '/login';
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">🤖 AI-Powered Classification</div>
                    <h1>Smart Complaint<br />Management System</h1>
                    <p className="hero-subtitle">
                        Submit complaints in plain language. Our AI analyzes and classifies them
                        automatically, routing to the right department for faster resolution.
                    </p>
                    <div className="hero-actions">
                        {isAuthenticated ? (
                            <Link to={getDashboardLink()} className="btn btn-primary btn-lg">
                                Go to Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Get Started →
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card">
                        <div className="hero-card-header">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <div className="hero-card-body">
                            <p className="hero-card-label">Complaint</p>
                            <p className="hero-card-text">"The projector in Room 204 is not working."</p>
                            <div className="hero-card-divider"></div>
                            <p className="hero-card-label">AI Suggestions</p>
                            <div className="hero-card-tags">
                                <span className="tag tag-blue">📁 Equipment</span>
                                <span className="tag tag-orange">⚡ Medium Priority</span>
                                <span className="tag tag-green">🏢 Maintenance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2>How It Works</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>Submit</h3>
                        <p>Students describe their complaint in plain language — no forms to figure out.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>AI Classifies</h3>
                        <p>AI analyzes the text and suggests category, priority, and department automatically.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👨‍💼</div>
                        <h3>Admin Reviews</h3>
                        <p>Admins review AI suggestions, correct if needed, and assign staff to handle it.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">✅</div>
                        <h3>Track & Resolve</h3>
                        <p>Staff updates progress, students track status in real-time until resolution.</p>
                    </div>
                </div>
            </section>

            {/* Roles Section */}
            <section className="roles-section">
                <h2>For Every Role</h2>
                <div className="roles-grid">
                    <div className="role-card student-card">
                        <div className="role-icon">🎓</div>
                        <h3>Students</h3>
                        <p>Submit complaints, view AI classifications, and track resolution progress.</p>
                    </div>
                    <div className="role-card admin-card">
                        <div className="role-icon">🛡️</div>
                        <h3>Administrators</h3>
                        <p>Review complaints, approve classifications, assign staff, and monitor statistics.</p>
                    </div>
                    <div className="role-card staff-card">
                        <div className="role-icon">🔧</div>
                        <h3>Staff</h3>
                        <p>View assigned tasks, update progress, and add resolution remarks.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
