import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Student Dashboard page.
 * Shows a welcome message and summary of the student's complaints.
 */
export default function StudentDashboard() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const response = await studentAPI.getMyComplaints();
            setComplaints(response.data);
        } catch (err) {
            console.error('Failed to load complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusCount = (status) => complaints.filter(c => c.status === status).length;

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div><p>Loading dashboard...</p></div>;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Welcome, {user.fullName}! 👋</h1>
                <p>Here's an overview of your complaints</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                        <span className="stat-number">{complaints.length}</span>
                        <span className="stat-label">Total Complaints</span>
                    </div>
                </div>
                <div className="stat-card stat-pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <span className="stat-number">{getStatusCount('SUBMITTED')}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
                <div className="stat-card stat-progress">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-info">
                        <span className="stat-number">{getStatusCount('ASSIGNED') + getStatusCount('IN_PROGRESS')}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </div>
                <div className="stat-card stat-resolved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <span className="stat-number">{getStatusCount('RESOLVED')}</span>
                        <span className="stat-label">Resolved</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <Link to="/student/submit-complaint" className="btn btn-primary">
                    ✏️ Submit New Complaint
                </Link>
                <Link to="/student/my-complaints" className="btn btn-outline">
                    📋 View All Complaints
                </Link>
            </div>

            {/* Recent Complaints */}
            <div className="section-card">
                <h2>Recent Complaints</h2>
                {complaints.length === 0 ? (
                    <div className="empty-state">
                        <p>No complaints submitted yet.</p>
                        <Link to="/student/submit-complaint" className="btn btn-primary">Submit Your First Complaint</Link>
                    </div>
                ) : (
                    <div className="complaints-list">
                        {complaints.slice(0, 5).map((complaint) => (
                            <Link to={`/student/complaints/${complaint.id}`} key={complaint.id} className="complaint-item">
                                <div className="complaint-item-header">
                                    <span className="complaint-title">#{complaint.id} - {complaint.title}</span>
                                    <span className={`status-badge status-${complaint.status.toLowerCase().replace('_', '-')}`}>
                                        {complaint.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="complaint-item-meta">
                                    {complaint.aiCategory && <span className="tag tag-sm">{complaint.aiCategory}</span>}
                                    {complaint.aiPriority && <span className="tag tag-sm">{complaint.aiPriority}</span>}
                                    <span className="complaint-date">
                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
