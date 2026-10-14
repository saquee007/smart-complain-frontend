import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { staffAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Staff Dashboard.
 * Displays tasks assigned specifically to the logged-in staff member,
 * along with task status counts and quick links to update progress.
 */
export default function StaffDashboard() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStaffComplaints();
    }, []);

    const fetchStaffComplaints = async () => {
        try {
            setLoading(true);
            const res = await staffAPI.getAssignedComplaints();
            setComplaints(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load assigned complaints.');
        } finally {
            setLoading(false);
        }
    };

    const assignedCount = complaints.filter(c => c.status === 'ASSIGNED').length;
    const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
    const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading Staff Portal...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Staff Workspace 🔧</h1>
                    <p>Welcome back, {user?.fullName} ({user?.department || 'Staff'})</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Staff Metrics Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">📥</div>
                    <div className="stat-info">
                        <span className="stat-number">{complaints.length}</span>
                        <span className="stat-label">Total Assigned</span>
                    </div>
                </div>

                <div className="stat-card stat-pending">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-info">
                        <span className="stat-number">{assignedCount}</span>
                        <span className="stat-label">New / Awaiting Action</span>
                    </div>
                </div>

                <div className="stat-card stat-progress">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-info">
                        <span className="stat-number">{inProgressCount}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </div>

                <div className="stat-card stat-resolved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <span className="stat-number">{resolvedCount}</span>
                        <span className="stat-label">Resolved</span>
                    </div>
                </div>
            </div>

            {/* Assigned Tasks Table */}
            <div className="section-card">
                <div className="section-card-header">
                    <h2>Your Assigned Complaints</h2>
                    <span className="text-muted text-sm">{complaints.length} total tasks</span>
                </div>

                {complaints.length === 0 ? (
                    <div className="empty-state">
                        <p>You currently have no complaints assigned to you.</p>
                    </div>
                ) : (
                    <div className="complaints-table-container">
                        <table className="complaints-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Department / Category</th>
                                    <th>Priority</th>
                                    <th>Current Status</th>
                                    <th>Assigned Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map(c => (
                                    <tr key={c.id}>
                                        <td><strong>#{c.id}</strong></td>
                                        <td className="complaint-title-cell">
                                            <div className="title-text">{c.title}</div>
                                            {c.location && <small className="text-muted">📍 {c.location}</small>}
                                        </td>
                                        <td>
                                            <span className="tag tag-sm">
                                                {c.department || c.category || 'General'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`priority-badge priority-${(c.priority || c.aiPriority || 'medium').toLowerCase()}`}>
                                                {c.priority || c.aiPriority || 'Medium'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${c.status.toLowerCase().replace('_', '-')}`}>
                                                {c.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>{new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <Link to={`/staff/complaints/${c.id}`} className="btn btn-sm btn-primary">
                                                Update Status
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
