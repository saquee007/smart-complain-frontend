import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { staffAPI } from '../services/api';

/**
 * Assigned Complaint Details page for Staff.
 * Shows detailed complaint data, location, contact, history, and
 * allows staff to transition status to IN_PROGRESS or RESOLVED with mandatory remarks.
 */
export default function StaffComplaintDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Form states
    const [newStatus, setNewStatus] = useState('IN_PROGRESS');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        loadDetails();
    }, [id]);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const res = await staffAPI.getComplaintById(id);
            setComplaint(res.data);
            // Pre-select next logical state
            if (res.data.status === 'ASSIGNED') {
                setNewStatus('IN_PROGRESS');
            } else if (res.data.status === 'IN_PROGRESS') {
                setNewStatus('RESOLVED');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load complaint details.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!remarks.trim()) {
            setError('Remarks are required to document resolution or progress.');
            return;
        }

        try {
            setUpdating(true);
            setError('');
            await staffAPI.updateStatus(id, {
                status: newStatus,
                remarks: remarks.trim()
            });
            setSuccessMsg(`Status updated to ${newStatus.replace('_', ' ')} successfully!`);
            setRemarks('');
            await loadDetails();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update complaint status.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading task details...</p>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="page-container">
                <div className="alert alert-error">{error || 'Task not found.'}</div>
                <Link to="/staff/dashboard" className="btn btn-outline">Back to Staff Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Link to="/staff/dashboard" className="back-link">← Back to Staff Workspace</Link>

            <div className="detail-header">
                <div>
                    <h1>Task #{complaint.id}: {complaint.title}</h1>
                    <p className="text-muted">Reported by student: {complaint.studentName} ({complaint.studentEmail})</p>
                </div>
                <span className={`status-badge status-lg status-${complaint.status.toLowerCase().replace('_', '-')}`}>
                    {complaint.status.replace('_', ' ')}
                </span>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div className="assignment-layout">
                {/* Left Column: Complaint & Location Information */}
                <div className="assignment-left">
                    <div className="section-card">
                        <h2>Complaint Description</h2>
                        <div className="detail-field">
                            <label>Detailed Issue</label>
                            <p className="description-box">{complaint.description}</p>
                        </div>
                        {complaint.location && (
                            <div className="detail-field">
                                <label>Exact Location</label>
                                <p>📍 {complaint.location}</p>
                            </div>
                        )}
                        <div className="detail-field">
                            <label>Classification & Priority</label>
                            <div className="ai-badge-group mt-1">
                                <span className="tag tag-approved">{complaint.category || complaint.aiCategory || 'General'}</span>
                                <span className={`priority-badge priority-${(complaint.priority || complaint.aiPriority || 'medium').toLowerCase()}`}>
                                    {complaint.priority || complaint.aiPriority || 'Medium'} Priority
                                </span>
                                <span className="tag tag-blue">{complaint.department || 'General'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline of Previous Actions */}
                    <div className="section-card">
                        <h2>Status & Action Timeline</h2>
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
                                        <p className="timeline-by">Action by: {entry.changedBy}</p>
                                        {entry.remarks && <p className="timeline-remarks">"{entry.remarks}"</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Update Status Form */}
                <div className="assignment-right">
                    <div className="section-card form-card-compact">
                        <h2>Update Progress & Resolution</h2>
                        <p className="text-muted text-sm">
                            Log progress notes or finalize this task with resolution remarks.
                        </p>

                        {complaint.status === 'RESOLVED' ? (
                            <div className="resolved-notice">
                                <p className="font-semibold text-green-700">✓ This complaint has already been resolved.</p>
                                <p className="text-muted text-sm mt-2">Resolution remarks:</p>
                                <p className="italic">"{complaint.resolutionRemarks}"</p>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate}>
                                <div className="form-group">
                                    <label htmlFor="newStatus">New Status *</label>
                                    <select
                                        id="newStatus"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        required
                                    >
                                        <option value="IN_PROGRESS">IN_PROGRESS (Currently working on it)</option>
                                        <option value="RESOLVED">RESOLVED (Issue resolved & verified)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="remarks">
                                        {newStatus === 'RESOLVED' ? 'Resolution Remarks *' : 'Progress Update Note *'}
                                    </label>
                                    <textarea
                                        id="remarks"
                                        rows="5"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder={
                                            newStatus === 'RESOLVED'
                                                ? 'Explain how the issue was fixed (e.g. Replaced projector HDMI cable and verified display output).'
                                                : 'Explain the current progress (e.g. Maintenance technician visited Room 204, testing cable).'
                                        }
                                        required
                                    />
                                    <small className="form-hint">These notes are visible to the student and administrator.</small>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    disabled={updating}
                                >
                                    {updating ? 'Updating...' : `Mark as ${newStatus.replace('_', ' ')}`}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
