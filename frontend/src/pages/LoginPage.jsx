import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Login page for all user roles (Student, Admin, Staff).
 */
export default function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);
            login(response.data);

            // Navigate to role-specific dashboard
            switch (response.data.role) {
                case 'STUDENT': navigate('/student/dashboard'); break;
                case 'ADMIN': navigate('/admin/dashboard'); break;
                case 'STAFF': navigate('/staff/dashboard'); break;
                default: navigate('/');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Invalid email or password. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@college.edu"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? <span className="spinner-sm"></span> : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                </div>

                {/* Demo credentials for easy testing */}
                <div className="demo-credentials">
                    <p className="demo-title">Demo Accounts</p>
                    <div className="demo-grid">
                        <div className="demo-item">
                            <span className="demo-role">Admin</span>
                            <span>admin@college.edu / admin123</span>
                        </div>
                        <div className="demo-item">
                            <span className="demo-role">Staff</span>
                            <span>staff.maintenance@college.edu / staff123</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
