import React, { useState } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';

// Pre-defined Form Templates
const FORM_TEMPLATES = {
    general: {
        title: "General Peer Evaluation",
        description: "Please rate your group members on their general contributions to the group project.",
        questions: [
            { questionText: "Member has a complete attendance in all meetings.", responseType: "SCALE" },
            { questionText: "Member is actively participating during brainstorming and discussions.", responseType: "SCALE" },
            { questionText: "Member respects everyone's opinions.", responseType: "SCALE" },
            { questionText: "Member understands the necessary concepts and requirements of the project.", responseType: "SCALE" },
            { questionText: "What is the greatest strength of this peer?", responseType: "TEXT" }
        ]
    },
    technical: {
        title: "Technical Project Review",
        description: "Evaluate your peer's technical contributions, code quality, and problem-solving skills.",
        questions: [
            { questionText: "Peer consistently delivered high-quality, bug-free code or technical work.", responseType: "SCALE" },
            { questionText: "Peer actively sought out and solved complex technical problems.", responseType: "SCALE" },
            { questionText: "Peer's work was well-documented and easy for others to understand.", responseType: "SCALE" },
            { questionText: "Describe a specific technical challenge this peer helped overcome.", responseType: "TEXT" }
        ]
    },
    presentation: {
        title: "Presentation & Report Assessment",
        description: "Assess your peer's performance in researching, designing, and delivering the final project presentation.",
        questions: [
            { questionText: "Peer contributed significantly to the research and content of the presentation.", responseType: "SCALE" },
            { questionText: "Peer helped design clear, professional presentation slides/materials.", responseType: "SCALE" },
            { questionText: "Peer spoke clearly and confidently during their portion of the presentation.", responseType: "SCALE" },
            { questionText: "Any areas of improvement for future public speaking or presentations?", responseType: "TEXT" }
        ]
    }
};

function TeacherFormsTab({ forms, fetchForms, showToast }) {
    const [formSubTab, setFormSubTab] = useState('create');
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formDeadline, setFormDeadline] = useState('');
    const [formQuestions, setFormQuestions] = useState([
        { questionText: 'How well did this peer contribute to the project?', responseType: 'SCALE' }
    ]);
    const [isPublishing, setIsPublishing] = useState(false);

    // Custom Confirmation Modal State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isDestructive: false
    });

    const requestConfirm = (title, message, onConfirm, isDestructive = false) => {
        setConfirmState({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                setConfirmState(prev => ({ ...prev, isOpen: false }));
                onConfirm();
            },
            isDestructive
        });
    };

    const handleApplyTemplate = (templateKey) => {
        requestConfirm(
            "Apply Template?",
            "Applying a template will overwrite your current progress. Continue?",
            () => {
                const template = FORM_TEMPLATES[templateKey];
                setFormTitle(template.title);
                setFormDescription(template.description);
                setFormQuestions(JSON.parse(JSON.stringify(template.questions))); // Deep copy
                showToast('Template applied successfully!', 'success');
            }
        );
    };

    const handlePublishForm = async () => {
        if (!formTitle) {
            showToast('Title is required', 'error');
            return;
        }
        setIsPublishing(true);
        try {
            const payload = {
                title: formTitle,
                description: formDescription,
                deadline: formDeadline ? formDeadline + ':00' : null,
                questions: formQuestions
            };
            const res = await fetch('http://localhost:8080/api/teacher/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setFormTitle('');
                setFormDescription('');
                setFormDeadline('');
                setFormQuestions([{ questionText: '', responseType: 'SCALE' }]);
                fetchForms();
                setFormSubTab('manage');
                showToast('Form published successfully!', 'success');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to connect to the server.', 'error');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDeleteForm = async (id) => {
        requestConfirm(
            "Delete Form?",
            "Are you sure you want to delete this form? This will also delete all submitted student evaluations associated with it.",
            async () => {
                try {
                    const res = await fetch(`http://localhost:8080/api/teacher/forms/${id}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        showToast('Form deleted successfully.', 'success');
                        fetchForms();
                    } else {
                        showToast('Failed to delete form.', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Failed to connect to the server.', 'error');
                }
            },
            true // isDestructive
        );
    };

    return (
        <div className="tab-content">
            <div className="flex-header" style={{ marginBottom: '20px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Evaluation Forms</h2>
                <div className="segmented-control" style={{ display: 'flex', gap: '5px', backgroundColor: '#e9ecef', padding: '4px', borderRadius: '8px' }}>
                    <button
                        className={`action-button ${formSubTab === 'create' ? '' : 'secondary-button'}`}
                        style={formSubTab !== 'create' ? { backgroundColor: 'transparent', color: '#555', border: 'none', boxShadow: 'none' } : { padding: '6px 16px', fontSize: '0.9rem' }}
                        onClick={() => setFormSubTab('create')}
                    >
                        Create New Form
                    </button>
                    <button
                        className={`action-button ${formSubTab === 'manage' ? '' : 'secondary-button'}`}
                        style={formSubTab !== 'manage' ? { backgroundColor: 'transparent', color: '#555', border: 'none', boxShadow: 'none' } : { padding: '6px 16px', fontSize: '0.9rem' }}
                        onClick={() => setFormSubTab('manage')}
                    >
                        Manage Active Forms
                    </button>
                </div>
            </div>

            {formSubTab === 'create' ? (
                <>
                    <div className="form-templates-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Use a Recommended Template:</h4>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="action-button secondary-button" style={{ fontSize: '0.85rem', padding: '6px 12px' }} onClick={() => handleApplyTemplate('general')}>General Peer Evaluation</button>
                            <button className="action-button secondary-button" style={{ fontSize: '0.85rem', padding: '6px 12px' }} onClick={() => handleApplyTemplate('technical')}>Technical Project Review</button>
                            <button className="action-button secondary-button" style={{ fontSize: '0.85rem', padding: '6px 12px' }} onClick={() => handleApplyTemplate('presentation')}>Presentation Assessment</button>
                            <button className="text-button" style={{ fontSize: '0.85rem', padding: '6px 12px', marginLeft: 'auto', color: '#d32f2f' }} onClick={() => {
                                requestConfirm(
                                    "Clear Form?",
                                    "Are you sure you want to clear all fields? This cannot be undone.",
                                    () => {
                                        setFormTitle('');
                                        setFormDescription('');
                                        setFormDeadline('');
                                        setFormQuestions([{ questionText: '', responseType: 'SCALE' }]);
                                    },
                                    true
                                );
                            }}>Clear Form</button>
                        </div>
                    </div>

                    <div className="form-builder-card minimal-form">
                        <div className="minimal-input-group">
                            <input
                                type="text"
                                className="minimal-title-input"
                                placeholder="Enter Form Title..."
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                            />
                        </div>

                        <div className="minimal-input-group">
                            <textarea
                                className="minimal-desc-input"
                                placeholder="Instructions or description for the students..."
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="minimal-deadline-group">
                            <label>Submission Deadline (PH Time)</label>
                            <input
                                type="datetime-local"
                                className="minimal-date-input"
                                value={formDeadline}
                                onChange={(e) => setFormDeadline(e.target.value)}
                            />
                        </div>

                        <div className="form-questions-header minimal-header">
                            <h3>Evaluation Criteria</h3>
                        </div>

                        <div className="minimal-questions-container">
                            {formQuestions.map((q, index) => (
                                <div className="minimal-question-card" key={index}>
                                    <div className="mq-header">
                                        <span className="mq-number">{index + 1}</span>
                                        {formQuestions.length > 1 && (
                                            <button
                                                className="mq-remove-btn text-button"
                                                onClick={() => setFormQuestions(formQuestions.filter((_, i) => i !== index))}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                    <div className="mq-body">
                                        <input
                                            type="text"
                                            className="mq-prompt-input"
                                            placeholder="What criteria should the peer evaluate?"
                                            value={q.questionText}
                                            onChange={(e) => {
                                                const newQuestions = [...formQuestions];
                                                newQuestions[index].questionText = e.target.value;
                                                setFormQuestions(newQuestions);
                                            }}
                                        />
                                        <select
                                            className="mq-type-select"
                                            value={q.responseType}
                                            onChange={(e) => {
                                                const newQuestions = [...formQuestions];
                                                newQuestions[index].responseType = e.target.value;
                                                setFormQuestions(newQuestions);
                                            }}
                                        >
                                            <option value="SCALE">Scale 1-10</option>
                                            <option value="TEXT">Short Text Answer</option>
                                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="minimal-form-actions">
                            <button
                                className="minimal-add-btn action-button outline"
                                onClick={() => setFormQuestions([...formQuestions, { questionText: '', responseType: 'SCALE' }])}
                            >
                                + Add Criterion
                            </button>
                            <button className="minimal-publish-btn action-button" disabled={isPublishing} onClick={handlePublishForm}>
                                {isPublishing ? 'Publishing...' : 'Publish Form'}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div>
                    <h2 className="section-title" style={{ marginTop: '10px' }}>Manage Published Forms</h2>
                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Form Title</th>
                                    <th>Created on</th>
                                    <th>Submission Deadline</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forms.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#777' }}>No active forms available. Switch to "Create New Form" to publish one!</td></tr>
                                ) : (
                                    forms.map(form => (
                                        <tr key={form.id}>
                                            <td><strong>{form.title}</strong></td>
                                            <td>{new Date(form.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {form.deadline ? (
                                                    new Date(form.deadline) < new Date() ?
                                                        <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>Expired ({new Date(form.deadline).toLocaleString('en-US', { timeZone: 'Asia/Manila' })} PHT)</span> :
                                                        <span style={{ color: '#2e7d32' }}>{new Date(form.deadline).toLocaleString('en-US', { timeZone: 'Asia/Manila' })} PHT</span>
                                                ) : 'No Deadline'}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className="text-button"
                                                    style={{ color: '#d32f2f', fontWeight: '500' }}
                                                    onClick={() => handleDeleteForm(form.id)}
                                                >
                                                    Delete Form
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                isDestructive={confirmState.isDestructive}
            />
        </div>
    );
}

export default TeacherFormsTab;
