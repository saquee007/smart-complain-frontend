import { Link } from 'react-router-dom';

/**
 * Access Denied / 403 page.
 */
export function AccessDeniedPage() {
    return (
        <div className="error-page">
            <div className="error-card">
                <span className="error-icon">🚫</span>
                <h1>Access Denied</h1>
                <p>You do not have permission to access this page.</p>
                <Link to="/" className="btn btn-primary">Return to Home</Link>
            </div>
        </div>
    );
}

/**
 * Not Found / 404 page.
 */
export function NotFoundPage() {
    return (
        <div className="error-page">
            <div className="error-card">
                <span className="error-icon">🔍</span>
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist or has been moved.</p>
                <Link to="/" className="btn btn-primary">Return to Home</Link>
            </div>
        </div>
    );
}
