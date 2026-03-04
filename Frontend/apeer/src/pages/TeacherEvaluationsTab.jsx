import React, { useState } from 'react';

function TeacherEvaluationsTab({ evaluations, forms, isLoading }) {
    const [evalFormFilter, setEvalFormFilter] = useState('ALL');
    const [evalSearchTerm, setEvalSearchTerm] = useState('');
    const [viewingStudentDetails, setViewingStudentDetails] = useState(null);

    if (viewingStudentDetails) {
        return (
            <div className="tab-content">
                <div className="flex-header" style={{ marginBottom: '20px' }}>
                    <div>
                        <button className="text-button" style={{ padding: 0, marginBottom: '10px' }} onClick={() => setViewingStudentDetails(null)}>← Back to Summary</button>
                        <h2 className="section-title" style={{ margin: 0 }}>Evaluation Details: {viewingStudentDetails.student.firstName} {viewingStudentDetails.student.lastName}</h2>
                        <p style={{ color: '#666', marginTop: '5px' }}>Average Score: <strong style={{ color: viewingStudentDetails.numericCount > 0 ? (viewingStudentDetails.totalScore / viewingStudentDetails.numericCount < 7.5 ? '#d32f2f' : (viewingStudentDetails.totalScore / viewingStudentDetails.numericCount >= 9.0 ? '#2e7d32' : '#fbc02d')) : 'inherit' }}>{viewingStudentDetails.numericCount > 0 ? (viewingStudentDetails.totalScore / viewingStudentDetails.numericCount).toFixed(2) : 'N/A'}</strong></p>
                    </div>
                </div>
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Evaluator</th>
                                <th>Form</th>
                                <th>Question</th>
                                <th>Rating / Answer</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {viewingStudentDetails.responses.map(res => (
                                <tr key={res.id}>
                                    <td>{res.evaluator?.firstName} {res.evaluator?.lastName}</td>
                                    <td>{res.form?.title}</td>
                                    <td>{res.question?.questionText || 'Criteria Grade'}</td>
                                    <td><strong>{res.answer}</strong></td>
                                    <td>{new Date(res.submittedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    const filteredEvals = evaluations.filter(e => {
        if (evalFormFilter !== 'ALL' && e.form?.id.toString() !== evalFormFilter) return false;
        const evaluateeName = `${e.evaluatee?.firstName} ${e.evaluatee?.lastName}`.toLowerCase();
        if (evalSearchTerm && !evaluateeName.includes(evalSearchTerm.toLowerCase())) return false;
        return true;
    });

    const groupedByStudent = {};
    filteredEvals.forEach(e => {
        const stId = e.evaluatee?.id;
        if (!stId) return;
        if (!groupedByStudent[stId]) {
            groupedByStudent[stId] = {
                student: e.evaluatee,
                responses: [],
                totalScore: 0,
                numericCount: 0
            };
        }
        groupedByStudent[stId].responses.push(e);

        const numVal = parseFloat(e.answer);
        if (!isNaN(numVal)) {
            groupedByStudent[stId].totalScore += numVal;
            groupedByStudent[stId].numericCount += 1;
        }
    });

    const studentSummaryArray = Object.values(groupedByStudent);

    return (
        <div className="tab-content">
            <h2 className="section-title">Evaluation Results Overview</h2>

            <div className="ai-summary-card">
                <div className="ai-header">
                    <h3>AI Performance Summary</h3>
                </div>
                <p className="ai-text">
                    Based on recent peer evaluations, <strong>Group A</strong> is demonstrating excellent collaboration, with Alice often taking the lead on technical tasks. Bob is receiving high marks for communication. Overall participation rate across all groups is currently high.
                </p>
                <div className="ai-footer">
                    <span className="ai-timestamp">Generated Just Now • Based on {evaluations.length} total raw evaluation records</span>
                </div>
            </div>

            <div className="data-table mt-4">
                <div className="table-filters" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <input
                        type="text"
                        placeholder="Search by student name..."
                        className="search-input"
                        value={evalSearchTerm}
                        onChange={(e) => setEvalSearchTerm(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #dcdcdc', borderRadius: '6px' }}
                    />
                    <select
                        className="filter-select"
                        value={evalFormFilter}
                        onChange={(e) => setEvalFormFilter(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #dcdcdc', borderRadius: '6px' }}
                    >
                        <option value="ALL">All Associated Forms</option>
                        {forms.map(form => (
                            <option key={form.id} value={form.id}>{form.title}</option>
                        ))}
                    </select>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Student (Evaluatee)</th>
                            <th>Responses Received</th>
                            <th>Average Score</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : studentSummaryArray.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No evaluations found matching the filters.</td></tr>
                        ) : (
                            studentSummaryArray.map(summary => (
                                <tr key={summary.student.id}>
                                    <td>{summary.student.firstName} {summary.student.lastName}</td>
                                    <td>{summary.responses.length} responses</td>
                                    <td>
                                        <strong style={{ color: summary.numericCount > 0 ? (summary.totalScore / summary.numericCount < 7.5 ? '#d32f2f' : (summary.totalScore / summary.numericCount >= 9.0 ? '#2e7d32' : '#fbc02d')) : 'inherit' }}>
                                            {summary.numericCount > 0 ? (summary.totalScore / summary.numericCount).toFixed(2) : 'N/A'}
                                        </strong>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="text-button" onClick={() => setViewingStudentDetails(summary)}>View Feedback</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TeacherEvaluationsTab;
