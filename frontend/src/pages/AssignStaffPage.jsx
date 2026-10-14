import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

/**
 * Assign Staff and Admin Review page.
 * Admins can inspect complaint details, verify/override AI-suggested category,
 * priority, and department, select a staff member, or reject the complaint.
 */
export default function AssignStaffPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Form inputs for review & assignment
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    const [department, setDepartment] = useState('');
    const [rejectRemarks, setRejectRemarks] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        loadDetails();
    }, [id]);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const [compRes, staffRes] = await Promise.all([
                adminAPI.getComplaintById(id),
                adminAPI.getAllStaff()
            ]);

            const c = compRes.data;
            setComplaint(c);
            setStaffList(staffRes.data);

            // Pre-fill fields with existing approved or AI suggestions
            setCategory(c.category || c.aiCategory || 'Equipment');
            setPriority(c.priority || c.aiPriority || 'Medium');
            setDepartment(c.department || c.aiDepartment || 'Maintenance');
            if (c.assignedStaffId) {
                setSelectedStaffId(c.assignedStaffId);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load complaint data.');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedStaffId) {
            setError('Please select a staff member to assign.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            await adminAPI.assignComplaint(id, {
                staffId: Number(selectedStaffId),
                category,
                priority,
                department
            });
            setSuccessMsg('Complaint assigned and approved successfully!');
            setTimeout(() => {
                navigate('/admin/complaints');
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign complaint.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectRemarks.trim()) {
            setError('Please provide remarks explaining why the complaint is rejected.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            await adminAPI.rejectComplaint(id, { remarks: rejectRemarks });
            setSuccessMsg('Complaint rejected.');
            setShowRejectModal(false);
            setTimeout(() => {
                navigate('/admin/complaints');
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject complaint.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading complaint details...</p>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="page-container">
                <div className="alert alert-error">Complaint not found.</div>
                <Link to="/admin/complaints" className="btn btn-outline">Back to list</Link>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Link to="/admin/complaints" className="back-link">← Back to All Complaints</Link>

            <div className="detail-header">
                <div>
                    <h1>Review & Assign Complaint #{complaint.id}</h1>
                    <p className="text-muted">Submitted by: {complaint.studentName} ({complaint.studentEmail})</p>
                </div>
                <span className={`status-badge status-lg status-${complaint.status.toLowerCase().replace('_', '-')}`}>
                    {complaint.status.replace('_', ' ')}
                </span>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div className="assignment-layout">
                {/* Left Column: Complaint Details & AI Suggestions */}
                <div className="assignment-left">
                    <div className="section-card">
                        <h2>Complaint Description</h2>
                        <div className="detail-field">
                            <label>Title</label>
                            <p className="font-semibold text-lg">{complaint.title}</p>
                        </div>
                        <div className="detail-field">
                            <label>Description</label>
                            <p className="description-box">{complaint.description}</p>
                        </div>
                        {complaint.location && (
                            <div className="detail-field">
                                <label>Reported Location</label>
                                <p>📍 {complaint.location}</p>
                            </div>
                        )}
                        <div className="detail-field">
                            <label>Submitted At</label>
                            <p>{new Date(complaint.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* AI vs Approved Comparison Card */}
                    <div className="section-card ai-comparison-card">
                        <div className="ai-card-title">
                            <h2>🤖 AI Suggestion</h2>
                            {complaint.aiFallback && (
                                <span className="fallback-chip">Deterministic Fallback</span>
                            )}
                        </div>
                        <div className="ai-results-grid">
                            <div className="ai-result-item">
                                <span className="ai-label">Suggested Category</span>
                                <span className="ai-value">{complaint.aiCategory || 'N/A'}</span>
                            </div>
                            <div className="ai-result-item">
                                <span className="ai-label">Suggested Priority</span>
                                <span className={`ai-value priority-${(complaint.aiPriority || 'medium').toLowerCase()}`}>
                                    {complaint.aiPriority || 'N/A'}
                                </span>
                            </div>
                            <div className="ai-result-item">
                                <span className="ai-label">Suggested Dept</span>
                                <span className="ai-value">{complaint.aiDepartment || 'N/A'}</span>
                            </div>
                        </div>
                        {complaint.aiReason && (
                            <p className="ai-reason">
                                <strong>Reasoning:</strong> {complaint.aiReason}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column: Admin Overrides and Staff Assignment Form */}
                <div className="assignment-right">
                    <div className="section-card form-card-compact">
                        <h2>Admin Review & Assignment</h2>
                        <p className="text-muted text-sm">
                            You may modify the AI classification before assigning to the appropriate staff member.
                        </p>

                        <form onSubmit={handleAssign}>
                            <div className="form-group">
                                <label htmlFor="category">Final Category</label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="Equipment">Equipment</option>
                                    <option value="Infrastructure">Infrastructure</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Cleanliness">Cleanliness</option>
                                    <option value="Safety">Safety</option>
                                    <option value="IT">IT</option>
                                    <option value="Administrative">Administrative</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="priority">Final Priority</label>
                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    required
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="department">Responsible Department</label>
                                <select
                                    id="department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                >
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="IT Department">IT Department</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Housekeeping">Housekeeping</option>
                                    <option value="Security">Security</option>
                                    <option value="Academic Affairs">Academic Affairs</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="staff">Assign to Staff Member *</label>
                                <select
                                    id="staff"
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Staff Member --</option>
                                    {staffList.map((st) => (
                                        <option key={st.id} value={st.id}>
                                            {st.fullName} ({st.department || 'Staff'}) - {st.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="action-button-group">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : 'Confirm Assignment & Status'}
                                </button>

                                {complaint.status !== 'REJECTED' && (
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-block"
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={submitting}
                                    >
                                        Reject Complaint
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>Reject Complaint #{complaint.id}</h3>
                        <p>Please enter the reason for rejection so the student understands why:</p>
                        <textarea
                            rows="4"
                            value={rejectRemarks}
                            onChange={(e) => setRejectRemarks(e.target.value)}
                            placeholder="e.g. Inappropriate request, duplicate entry, or out of scope..."
                            required
                        />
                        <div className="modal-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowRejectModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleReject}
                                disabled={submitting}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
