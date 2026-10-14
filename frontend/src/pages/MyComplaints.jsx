import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../services/api';

/**
 * My Complaints page for students.
 * Shows all complaints submitted by the logged-in student.
 */
export default function MyComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

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

    const filteredComplaints = filter === 'ALL'
        ? complaints
        : complaints.filter(c => c.status === filter);

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div><p>Loading complaints...</p></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>My Complaints</h1>
                <Link to="/student/submit-complaint" className="btn btn-primary">+ New Complaint</Link>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {['ALL', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(status => (
                    <button
                        key={status}
                        className={`filter-tab ${filter === status ? 'active' : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status.replace('_', ' ')}
                        <span className="filter-count">
                            {status === 'ALL' ? complaints.length : complaints.filter(c => c.status === status).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Complaints List */}
            {filteredComplaints.length === 0 ? (
                <div className="empty-state">
                    <p>No complaints found{filter !== 'ALL' ? ` with status "${filter.replace('_', ' ')}"` : ''}.</p>
                </div>
            ) : (
                <div className="complaints-table-container">
                    <table className="complaints-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComplaints.map(complaint => (
                                <tr key={complaint.id}>
                                    <td>#{complaint.id}</td>
                                    <td className="complaint-title-cell">{complaint.title}</td>
                                    <td>
                                        <span className="tag tag-sm">
                                            {complaint.category || complaint.aiCategory || 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`priority-badge priority-${(complaint.priority || complaint.aiPriority || 'medium').toLowerCase()}`}>
                                            {complaint.priority || complaint.aiPriority || 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${complaint.status.toLowerCase().replace('_', '-')}`}>
                                            {complaint.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <Link to={`/student/complaints/${complaint.id}`} className="btn btn-sm btn-outline">
                                            View
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
