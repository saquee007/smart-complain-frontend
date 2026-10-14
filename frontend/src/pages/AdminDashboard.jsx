import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

/**
 * Admin Dashboard page.
 * Displays overall complaint statistics, counts by status/category/priority,
 * and quick access to all complaints and staff assignments.
 */
export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, complaintsRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getAllComplaints()
            ]);
            setStats(statsRes.data);
            setRecentComplaints(complaintsRes.data.slice(0, 6));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading Admin Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Administrator Dashboard 🛡️</h1>
                    <p>Real-time college complaint metrics & staff operations</p>
                </div>
                <div className="header-actions">
                    <Link to="/admin/complaints" className="btn btn-primary">
                        Manage All Complaints
                    </Link>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Primary KPI Metrics */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <span className="stat-number">{stats?.totalComplaints || 0}</span>
                        <span className="stat-label">Total Complaints</span>
                    </div>
                </div>

                <div className="stat-card stat-pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <span className="stat-number">{stats?.submitted || 0}</span>
                        <span className="stat-label">Pending Review</span>
                    </div>
                </div>

                <div className="stat-card stat-progress">
                    <div className="stat-icon">🔧</div>
                    <div className="stat-info">
                        <span className="stat-number">{(stats?.assigned || 0) + (stats?.inProgress || 0)}</span>
                        <span className="stat-label">Assigned & In-Progress</span>
                    </div>
                </div>

                <div className="stat-card stat-resolved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <span className="stat-number">{stats?.resolved || 0}</span>
                        <span className="stat-label">Resolved</span>
                    </div>
                </div>

                <div className="stat-card stat-rejected">
                    <div className="stat-icon">🚫</div>
                    <div className="stat-info">
                        <span className="stat-number">{stats?.rejected || 0}</span>
                        <span className="stat-label">Rejected</span>
                    </div>
                </div>
            </div>

            {/* Breakdown Panels */}
            <div className="analytics-grid">
                <div className="section-card">
                    <h2>Department / Category Breakdown</h2>
                    <div className="breakdown-list">
                        {stats?.byCategory && Object.keys(stats.byCategory).length > 0 ? (
                            Object.entries(stats.byCategory).map(([category, count]) => (
                                <div key={category} className="breakdown-row">
                                    <span className="breakdown-name">{category}</span>
                                    <div className="breakdown-bar-container">
                                        <div
                                            className="breakdown-bar"
                                            style={{ width: `${stats.totalComplaints ? (count / stats.totalComplaints) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="breakdown-count">{count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No category data available yet.</p>
                        )}
                    </div>
                </div>

                <div className="section-card">
                    <h2>Priority Distribution</h2>
                    <div className="breakdown-list">
                        {stats?.byPriority && Object.keys(stats.byPriority).length > 0 ? (
                            Object.entries(stats.byPriority).map(([priority, count]) => (
                                <div key={priority} className="breakdown-row">
                                    <span className={`priority-badge priority-${priority.toLowerCase()}`}>{priority}</span>
                                    <div className="breakdown-bar-container">
                                        <div
                                            className="breakdown-bar priority-bar"
                                            style={{ width: `${stats.totalComplaints ? (count / stats.totalComplaints) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="breakdown-count">{count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No priority data available yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity List */}
            <div className="section-card">
                <div className="section-card-header">
                    <h2>Recent Incoming Complaints</h2>
                    <Link to="/admin/complaints" className="btn btn-sm btn-outline">View All</Link>
                </div>

                {recentComplaints.length === 0 ? (
                    <div className="empty-state">
                        <p>No complaints submitted yet.</p>
                    </div>
                ) : (
                    <div className="complaints-table-container">
                        <table className="complaints-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Student</th>
                                    <th>Title</th>
                                    <th>AI Suggestion</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentComplaints.map(c => (
                                    <tr key={c.id}>
                                        <td>#{c.id}</td>
                                        <td>{c.studentName || 'Student'}</td>
                                        <td className="complaint-title-cell">{c.title}</td>
                                        <td>
                                            <span className="tag tag-sm">
                                                {c.aiCategory || 'Unclassified'} ({c.aiPriority || 'Medium'})
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${c.status.toLowerCase().replace('_', '-')}`}>
                                                {c.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/admin/complaints/${c.id}`} className="btn btn-sm btn-primary">
                                                Review / Assign
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
