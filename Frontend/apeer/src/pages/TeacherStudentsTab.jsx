import React, { useState } from 'react';

function TeacherStudentsTab({ students, isLoading, fetchStudents, showToast }) {
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualStudent, setManualStudent] = useState({ idNumber: '', firstName: '', lastName: '', email: '', phoneNumber: '' });
    const [isImporting, setIsImporting] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8080/api/teacher/students/import', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message, 'success');
                fetchStudents(); // Refresh the list
            } else {
                showToast('Error importing students: ' + data.message, 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to connect to the server.', 'error');
        } finally {
            setIsImporting(false);
            // reset file input
            e.target.value = null;
        }
    };

    const handleManualStudentSubmit = async (e) => {
        e.preventDefault();
        setIsImporting(true);
        try {
            const res = await fetch('http://localhost:8080/api/teacher/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(manualStudent)
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Student added successfully!', 'success');
                setIsManualModalOpen(false);
                setManualStudent({ idNumber: '', firstName: '', lastName: '', email: '', phoneNumber: '' });
                fetchStudents();
            } else {
                showToast('Error adding student: ' + data.message, 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to connect to the server.', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="tab-content">
            <div className="flex-header">
                <h2 className="section-title">Manage Students</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="action-button secondary-button" style={{ backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ccc' }} onClick={() => setIsManualModalOpen(!isManualModalOpen)}>
                        {isManualModalOpen ? 'Cancel Manual Import' : 'Manual Import'}
                    </button>
                    <div>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            id="excel-upload"
                        />
                        <label htmlFor="excel-upload" className="action-button" style={{ cursor: 'pointer', display: 'inline-block', margin: 0 }}>
                            {isImporting ? 'Importing...' : 'Import Students (.xlsx)'}
                        </label>
                    </div>
                </div>
            </div>

            {isManualModalOpen && (
                <div className="form-builder-card" style={{ marginBottom: '20px' }}>
                    <h3>Add Student Manually</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                        <div className="input-group">
                            <label>ID Number</label>
                            <input type="text" value={manualStudent.idNumber} onChange={e => setManualStudent({ ...manualStudent, idNumber: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input type="email" value={manualStudent.email} onChange={e => setManualStudent({ ...manualStudent, email: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>First Name</label>
                            <input type="text" value={manualStudent.firstName} onChange={e => setManualStudent({ ...manualStudent, firstName: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Last Name</label>
                            <input type="text" value={manualStudent.lastName} onChange={e => setManualStudent({ ...manualStudent, lastName: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Phone Number (Optional)</label>
                            <input type="text" value={manualStudent.phoneNumber} onChange={e => setManualStudent({ ...manualStudent, phoneNumber: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                        <button className="text-button" onClick={() => setIsManualModalOpen(false)}>Cancel</button>
                        <button className="action-button" disabled={isImporting} onClick={handleManualStudentSubmit}>Save Student</button>
                    </div>
                </div>
            )}

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID Number</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : students.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No students found</td></tr>
                        ) : (
                            students.map(student => (
                                <tr key={student.id}>
                                    <td>{student.idNumber}</td>
                                    <td>{student.firstName} {student.lastName}</td>
                                    <td>{student.email}</td>
                                    <td><span className="status active">Active</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TeacherStudentsTab;
