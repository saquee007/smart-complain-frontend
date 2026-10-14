import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentAPI } from '../services/api';

/**
 * Complaint Details and Tracking page for students.
 * Shows full complaint info, AI classification, admin assignment, and status timeline.
 */
export default function ComplaintDetails() {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadComplaint();
    }, [id]);

    const loadComplaint = async () => {
        try {
            const response = await studentAPI.getComplaintById(id);
            setComplaint(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load complaint details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div><p>Loading details...</p></div>;
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="alert alert-error">{error}</div>
                <Link to="/student/my-complaints" className="btn btn-outline">← Back to My Complaints</Link>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Link to="/student/my-complaints" className="back-link">← Back to My Complaints</Link>

            <div className="detail-header">
                <h1>Complaint #{complaint.id}</h1>
                <span className={`status-badge status-lg status-${complaint.status.toLowerCase().replace('_', '-')}`}>
                    {complaint.status.replace('_', ' ')}
                </span>
            </div>

            {/* Complaint Info */}
            <div className="detail-grid">
                <div className="detail-section">
                    <h2>Complaint Information</h2>
                    <div className="detail-field">
                        <label>Title</label>
                        <p>{complaint.title}</p>
                    </div>
                    <div className="detail-field">
                        <label>Description</label>
                        <p>{complaint.description}</p>
                    </div>
                    {complaint.location && (
                        <div className="detail-field">
                            <label>Location</label>
                            <p>{complaint.location}</p>
                        </div>
                    )}
                    <div className="detail-field">
                        <label>Submitted On</label>
                        <p>{new Date(complaint.createdAt).toLocaleString()}</p>
                    </div>
                </div>

                {/* AI Classification */}
                <div className="detail-section ai-section">
                    <h2>{complaint.aiFallback ? '🔧 Fallback Classification' : '🤖 AI Classification'}</h2>
                    {complaint.aiFallback && (
                        <p className="fallback-notice">Rule-based classification (no AI API configured)</p>
                    )}
                    <div className="classification-grid">
                        <div className="classification-item">
                            <span className="class-label">Category</span>
                            <span className="class-value">{complaint.aiCategory}</span>
                        </div>
                        <div className="classification-item">
                            <span className="class-label">Priority</span>
                            <span className={`class-value priority-${complaint.aiPriority?.toLowerCase()}`}>
                                {complaint.aiPriority}
                            </span>
                        </div>
                        <div className="classification-item">
                            <span className="class-label">Department</span>
                            <span className="class-value">{complaint.aiDepartment}</span>
                        </div>
                    </div>
                    {complaint.aiReason && (
                        <p className="ai-reason"><strong>Reason:</strong> {complaint.aiReason}</p>
                    )}
                </div>

                {/* Admin-Approved Classification (if different from AI) */}
                {complaint.category && (
                    <div className="detail-section admin-section">
                        <h2>✅ Admin-Approved Classification</h2>
                        <div className="classification-grid">
                            <div className="classification-item">
                                <span className="class-label">Category</span>
                                <span className="class-value">{complaint.category}</span>
                            </div>
                            <div className="classification-item">
                                <span className="class-label">Priority</span>
                                <span className={`class-value priority-${complaint.priority?.toLowerCase()}`}>
                                    {complaint.priority}
                                </span>
                            </div>
                            <div className="classification-item">
                                <span className="class-label">Department</span>
                                <span className="class-value">{complaint.department}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assignment Info */}
                {complaint.assignedStaffName && (
                    <div className="detail-section">
                        <h2>Assignment</h2>
                        <div className="detail-field">
                            <label>Assigned To</label>
                            <p>{complaint.assignedStaffName}</p>
                        </div>
                    </div>
                )}

                {/* Resolution */}
                {complaint.resolutionRemarks && (
                    <div className="detail-section resolution-section">
                        <h2>Resolution</h2>
                        <p>{complaint.resolutionRemarks}</p>
                    </div>
                )}
            </div>

            {/* Status Timeline */}
            <div className="timeline-section">
                <h2>Status Timeline</h2>
                <div className="timeline">
                    {complaint.statusHistory?.map((entry, index) => (
                        <div key={entry.id || index} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <span className={`status-badge status-sm status-${entry.newStatus.toLowerCase().replace('_', '-')}`}>
                                        {entry.newStatus.replace('_', ' ')}
                                    </span>
                                    <span className="timeline-date">
                                        {new Date(entry.changedAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="timeline-by">By: {entry.changedBy}</p>
                                {entry.remarks && <p className="timeline-remarks">{entry.remarks}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
