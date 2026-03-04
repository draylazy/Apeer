import { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'evaluate', 'results'
    const [forms, setForms] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [evaluationScores, setEvaluationScores] = useState({});

    // State for Toast Notifications
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    useEffect(() => {
        if (activeTab === 'evaluate') {
            fetchFormsAndGroup();
        }
    }, [activeTab]);

    const fetchFormsAndGroup = async () => {
        setIsLoading(true);
        try {
            // Fetch active forms
            const formRes = await fetch(`http://localhost:8080/api/student/forms/${user.email}`);
            if (formRes.ok) setForms(await formRes.json());

            // Fetch group members
            const groupRes = await fetch(`http://localhost:8080/api/student/group/${user.email}`);
            if (groupRes.ok) {
                const groups = await groupRes.json();
                if (groups && groups.length > 0) {
                    setGroupMembers(groups[0].members || []);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    const startEvaluation = (form) => {
        setSelectedForm(form);
        setEvaluationScores({}); // Reset scores when opening a form
    }

    const handleScoreChange = (criteriaId, memberId, score) => {
        setEvaluationScores(prev => ({
            ...prev,
            [`${criteriaId}-${memberId}`]: score
        }));
    };

    const handleSubmitEvaluation = async (criteriaList) => {
        const expectedCount = groupMembers.length * criteriaList.length;
        const actualCount = Object.keys(evaluationScores).length;

        if (actualCount < expectedCount) {
            showToast('Please complete all evaluation questions for all members before submitting.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = Object.entries(evaluationScores).map(([key, score]) => {
                const [questionId, evaluateeId] = key.split('-');
                return {
                    formId: selectedForm.id,
                    evaluatorId: user.id || user.userId, // Fallback if user object varies
                    evaluateeId: parseInt(evaluateeId),
                    questionId: parseInt(questionId),
                    answer: score.toString()
                };
            });

            const res = await fetch('http://localhost:8080/api/student/evaluations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast('Evaluation submitted successfully!', 'success');
                setSelectedForm(null);
                setEvaluationScores({});
                setActiveTab('overview');
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to submit evaluation.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to connect to the server.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderEvaluationForm = () => {
        if (!selectedForm) {
            return (
                <div className="forms-list">
                    <h3>Available Evaluations</h3>
                    {forms.length === 0 ? <p>No evaluations available.</p> : (
                        forms.map(form => {
                            const isExpired = form.deadline ? new Date(form.deadline) < new Date() : false;
                            return (
                                <div key={form.id} className="dashboard-widget form-card">
                                    <h4>{form.title}</h4>
                                    <p>{form.description}</p>
                                    {form.deadline && (
                                        <p style={{ fontSize: '0.85rem', color: isExpired ? '#d32f2f' : '#666', marginTop: '10px', marginBottom: '15px' }}>
                                            <strong>Deadline:</strong> {new Date(form.deadline).toLocaleString()}
                                            {isExpired && " (Expired)"}
                                        </p>
                                    )}
                                    <button
                                        className={`action-button ${isExpired ? 'secondary-button' : ''}`}
                                        onClick={() => startEvaluation(form)}
                                        disabled={isExpired}
                                        style={isExpired ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                    >
                                        {isExpired ? 'Form Closed' : 'Start form'}
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>
            )
        }

        const scaleOptions = [10, 9.8, 9.6, 9.4, 9.2, 9, 8, 7, 6, 5, 4, 3, 2, 1];

        // Ensure questions are valid, or provide defaults if empty
        const defaultCriteria = [
            { id: '1', questionText: "Member has a complete attendance in all meetings.", title: "Attendance", responseType: "SCALE" },
            { id: '2', questionText: "Member is actively participating during brainstorming and discussions.", title: "Participation", responseType: "SCALE" },
            { id: '3', questionText: "Member respects everyone's opinions.", title: "Respect", responseType: "SCALE" },
            { id: '4', questionText: "Member understands the necessary concepts and requirements of the project.", title: "Knowledge", responseType: "SCALE" }
        ];

        const criteriaList = selectedForm.questions && selectedForm.questions.length > 0
            ? selectedForm.questions.map(q => ({ id: q.id, questionText: q.questionText, title: q.questionText.split(' ')[0], responseType: q.responseType || 'SCALE' }))
            : defaultCriteria;

        return (
            <div className="evaluation-matrix-container">
                <button className="back-button text-button" onClick={() => setSelectedForm(null)}>← Back to Forms</button>
                <h2 style={{ marginTop: '20px', marginBottom: '30px' }}>{selectedForm.title}</h2>
                <div className="matrix-list">
                    {criteriaList.map((criteria, index) => (
                        <div className="matrix-card" key={index}>
                            <div className="matrix-criteria">
                                <h3>{criteria.title || `Criteria ${index + 1}`}</h3>
                                <p>{criteria.questionText}</p>
                            </div>
                            <div className="matrix-scores">
                                {groupMembers.length === 0 ? <p>No members found in your group.</p> : null}

                                {/* Scale Header Row */}
                                {groupMembers.length > 0 && criteria.responseType === 'SCALE' && (
                                    <div className="matrix-header-row">
                                        <div className="matrix-member-name"></div>
                                        <div className="matrix-radios header-radios">
                                            {scaleOptions.map(score => (
                                                <div className="radio-option" key={`header-${score}`}>
                                                    <label>{score}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {groupMembers.map((member, mIndex) => {
                                    const memberName = member.id === user.userId ? "Me (Self)" : `${member.firstName} ${member.lastName}`;
                                    return (
                                        <div className="matrix-row" key={member.id} style={{ alignItems: criteria.responseType === 'TEXT' ? 'flex-start' : 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                            <div className="matrix-member-name" style={{ marginTop: criteria.responseType === 'TEXT' ? '10px' : '0' }}>{memberName} :</div>

                                            {criteria.responseType === 'SCALE' && (
                                                <div className="matrix-radios">
                                                    {scaleOptions.map(score => (
                                                        <div className="radio-option" key={score}>
                                                            <input
                                                                type="radio"
                                                                name={`score-${criteria.id}-${member.id}`}
                                                                value={score}
                                                                checked={evaluationScores[`${criteria.id}-${member.id}`] == score}
                                                                onChange={(e) => handleScoreChange(criteria.id, member.id, e.target.value)}
                                                                title={`Score ${score}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {criteria.responseType === 'TEXT' && (
                                                <div style={{ flex: 1, padding: '10px 0' }}>
                                                    <textarea
                                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px', fontFamily: 'inherit', resize: 'vertical' }}
                                                        placeholder="Enter your feedback..."
                                                        value={evaluationScores[`${criteria.id}-${member.id}`] || ''}
                                                        onChange={(e) => handleScoreChange(criteria.id, member.id, e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {criteria.responseType === 'MULTIPLE_CHOICE' && (
                                                <div style={{ flex: 1, padding: '10px 0' }}>
                                                    <select
                                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
                                                        value={evaluationScores[`${criteria.id}-${member.id}`] || ''}
                                                        onChange={(e) => handleScoreChange(criteria.id, member.id, e.target.value)}
                                                    >
                                                        <option value="" disabled>Select an option</option>
                                                        <option value="Excellent">Excellent</option>
                                                        <option value="Good">Good</option>
                                                        <option value="Satisfactory">Satisfactory</option>
                                                        <option value="Needs Improvement">Needs Improvement</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '50px' }}>
                    <button
                        className="action-button full-width"
                        style={{ maxWidth: '300px' }}
                        disabled={isSubmitting}
                        onClick={() => handleSubmitEvaluation(criteriaList)}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                    </button>
                </div>
            </div>
        )
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1 className="dashboard-title" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>Self and Peer Evaluation System</h1>
                    <div className="user-menu">
                        <span className="welcome-text">Welcome, <strong>{user?.firstName} {user?.lastName}</strong></span>
                        <button onClick={onLogout} className="logout-button">Log Out</button>
                    </div>
                </div>
            </header>

            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    <div className="toast-icon">
                        {toast.type === 'success' ? '✓' : '!'}
                    </div>
                    <div className="toast-message">{toast.message}</div>
                    <button className="toast-close" onClick={() => setToast({ ...toast, show: false })}>×</button>
                </div>
            )}

            <main className="dashboard-main">
                {activeTab === 'overview' && (
                    <div className="dashboard-grid center-grid">
                        <div className="dashboard-widget large-widget">
                            <h2>Start Evaluation</h2>
                            <p>Complete your self and peer assessments based on recent group tasks.</p>
                            <button className="action-button mt-auto" onClick={() => setActiveTab('evaluate')}>Go to Evaluations</button>
                        </div>
                        <div className="dashboard-widget large-widget">
                            <h2>My Results</h2>
                            <p>View the feedback and evaluations you've received.</p>
                            <button className="action-button secondary-button mt-auto" onClick={() => setActiveTab('results')}>View My Results</button>
                        </div>
                    </div>
                )}

                {activeTab === 'evaluate' && (
                    <div className="evaluation-section">
                        {isLoading && !selectedForm ? <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div> : renderEvaluationForm()}
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className="results-section">
                        <button className="back-button text-button mb-4" onClick={() => setActiveTab('overview')}>← Back to Home</button>
                        <div className="welcome-card">
                            <h2>Your Evaluation Results</h2>
                            <p>You have not received enough evaluations to generate a summary yet.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Dashboard
