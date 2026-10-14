import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';

/**
 * Submit Complaint page for students.
 * Allows students to describe their complaint, which is then classified by AI.
 */
export default function SubmitComplaint() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
            const response = await studentAPI.submitComplaint(formData);
            setResult(response.data);
        } catch (err) {
            if (err.response?.data?.fieldErrors) {
                const errors = Object.values(err.response.data.fieldErrors).join('. ');
                setError(errors);
            } else {
                setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="page-container">
                <div className="success-card">
                    <div className="success-icon">✅</div>
                    <h2>Complaint Submitted Successfully!</h2>
                    <p>Your complaint #{result.id} has been recorded and classified.</p>

                    {/* AI Classification Results */}
                    <div className="ai-results">
                        <h3>
                            {result.aiFallback ? '🔧 Fallback Classification' : '🤖 AI Classification'}
                        </h3>
                        {result.aiFallback && (
                            <p className="fallback-notice">
                                No AI API configured. Classification was done using rule-based analysis.
                            </p>
                        )}
                        <div className="ai-results-grid">
                            <div className="ai-result-item">
                                <span className="ai-label">Category</span>
                                <span className="ai-value">{result.aiCategory}</span>
                            </div>
                            <div className="ai-result-item">
                                <span className="ai-label">Priority</span>
                                <span className={`ai-value priority-${result.aiPriority?.toLowerCase()}`}>
                                    {result.aiPriority}
                                </span>
                            </div>
                            <div className="ai-result-item">
                                <span className="ai-label">Department</span>
                                <span className="ai-value">{result.aiDepartment}</span>
                            </div>
                        </div>
                        {result.aiReason && (
                            <p className="ai-reason"><strong>Reason:</strong> {result.aiReason}</p>
                        )}
                    </div>

                    <div className="success-actions">
                        <button onClick={() => navigate('/student/my-complaints')} className="btn btn-primary">
                            View My Complaints
                        </button>
                        <button onClick={() => { setResult(null); setFormData({ title: '', description: '', location: '' }); }} className="btn btn-outline">
                            Submit Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="form-card">
                <h1>Submit a Complaint</h1>
                <p className="form-subtitle">
                    Describe your complaint in plain language. Our AI will automatically classify it.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Complaint Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Projector not working in Room 204"
                            required
                            minLength={5}
                            maxLength={200}
                            autoFocus
                        />
                        <span className="form-hint">{formData.title.length}/200 characters</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the issue in detail. The more information you provide, the better the AI can classify and route your complaint."
                            required
                            minLength={10}
                            maxLength={2000}
                            rows={6}
                        />
                        <span className="form-hint">{formData.description.length}/2000 characters</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location (Optional)</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., Room 204, Block A, 2nd Floor"
                            maxLength={200}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-sm"></span>
                                Analyzing & Submitting...
                            </>
                        ) : (
                            '🤖 Submit & Classify'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
