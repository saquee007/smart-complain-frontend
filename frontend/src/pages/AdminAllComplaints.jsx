import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

/**
 * All Complaints management page for Administrators.
 * Includes status and priority filters, quick review links, and direct staff assignment access.
 */
export default function AdminAllComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getAllComplaints();
            setComplaints(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch complaints list.');
        } finally {
            setLoading(false);
        }
    };

    const filtered = complaints.filter(c => {
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
        const matchesSearch =
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.studentName && c.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading complaints...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Complaint Directory</h1>
                    <p>Review AI classifications, approve details, and assign staff members.</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Filter and Search Bar */}
            <div className="table-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by title, student, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-tabs">
                    {['ALL', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(status => (
                        <button
                            key={status}
                            className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status.replace('_', ' ')}
                            <span className="filter-count">
                                {status === 'ALL' ? complaints.length : complaints.filter(c => c.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <p>No complaints match your selected filters.</p>
                </div>
            ) : (
                <div className="complaints-table-container">
                    <table className="complaints-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Student</th>
                                <th>Title</th>
                                <th>AI Classification</th>
                                <th>Approved Class</th>
                                <th>Assigned Staff</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id}>
                                    <td><strong>#{c.id}</strong></td>
                                    <td>
                                        <div className="user-info-cell">
                                            <span className="name">{c.studentName || 'Student'}</span>
                                            <span className="email text-muted">{c.studentEmail}</span>
                                        </div>
                                    </td>
                                    <td className="complaint-title-cell">
                                        <div className="title-text">{c.title}</div>
                                        {c.location && <small className="text-muted">📍 {c.location}</small>}
                                    </td>
                                    <td>
                                        <div className="ai-badge-group">
                                            <span className="tag tag-sm tag-ai">
                                                {c.aiCategory || 'N/A'}
                                            </span>
                                            <span className={`priority-badge priority-${(c.aiPriority || 'medium').toLowerCase()}`}>
                                                {c.aiPriority || 'N/A'}
                                            </span>
                                            {c.aiFallback && <small className="fallback-chip">Fallback</small>}
                                        </div>
                                    </td>
                                    <td>
                                        {c.category ? (
                                            <span className="tag tag-sm tag-approved">
                                                {c.category} ({c.priority})
                                            </span>
                                        ) : (
                                            <span className="text-muted italic">Pending Review</span>
                                        )}
                                    </td>
                                    <td>
                                        {c.assignedStaffName ? (
                                            <span className="staff-assigned-tag">👤 {c.assignedStaffName}</span>
                                        ) : (
                                            <span className="text-muted">Unassigned</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${c.status.toLowerCase().replace('_', '-')}`}>
                                            {c.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/admin/complaints/${c.id}`} className="btn btn-sm btn-primary">
                                            {c.status === 'SUBMITTED' ? 'Assign Staff' : 'Manage'}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
