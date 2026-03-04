import React, { useState } from 'react';

function TeacherStudentsTab({ students, isLoading, fetchStudents, showToast }) {
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualStudent, setManualStudent] = useState({ idNumber: '', firstName: '', lastName: '', email: '', phoneNumber: '' });
    const [isImporting, setIsImporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredStudents = students.filter(student =>
        (student.firstName && student.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.lastName && student.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.idNumber && student.idNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="tab-content">
            <div className="flex-header">
                <h2 className="section-title">Manage Students</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-button secondary-button" style={{ backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ccc', padding: '6px 12px', fontSize: '13px' }} onClick={() => setIsManualModalOpen(!isManualModalOpen)}>
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
                        <label htmlFor="excel-upload" className="action-button" style={{ cursor: 'pointer', display: 'inline-block', margin: 0, padding: '6px 12px', fontSize: '13px' }}>
                            {isImporting ? 'Importing...' : 'Import Students (.xlsx)'}
                        </label>
                    </div>
                </div>
            </div>

            {isManualModalOpen && (
                <div className="form-builder-card" style={{ marginBottom: '20px', padding: '20px', maxWidth: '600px', margin: '0 auto 20px auto' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 15px 0' }}>Add Student Manually</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>ID Number</label>
                            <input style={{ padding: '6px 10px', fontSize: '0.85rem' }} type="text" value={manualStudent.idNumber} onChange={e => setManualStudent({ ...manualStudent, idNumber: e.target.value })} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Email</label>
                            <input style={{ padding: '6px 10px', fontSize: '0.85rem' }} type="email" value={manualStudent.email} onChange={e => setManualStudent({ ...manualStudent, email: e.target.value })} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>First Name</label>
                            <input style={{ padding: '6px 10px', fontSize: '0.85rem' }} type="text" value={manualStudent.firstName} onChange={e => setManualStudent({ ...manualStudent, firstName: e.target.value })} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Last Name</label>
                            <input style={{ padding: '6px 10px', fontSize: '0.85rem' }} type="text" value={manualStudent.lastName} onChange={e => setManualStudent({ ...manualStudent, lastName: e.target.value })} />
                        </div>
                        <div className="input-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Phone Number (Optional)</label>
                            <input style={{ padding: '6px 10px', fontSize: '0.85rem' }} type="text" value={manualStudent.phoneNumber} onChange={e => setManualStudent({ ...manualStudent, phoneNumber: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                        <button className="text-button" style={{ fontSize: '13px' }} onClick={() => setIsManualModalOpen(false)}>Cancel</button>
                        <button className="action-button" style={{ padding: '6px 16px', fontSize: '13px' }} disabled={isImporting} onClick={handleManualStudentSubmit}>Save Student</button>
                    </div>
                </div>
            )}

            <div className="data-table">
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-start' }}>
                    <input
                        type="text"
                        placeholder="Search by ID, Name, or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', width: '100%', maxWidth: '500px', fontSize: '14px', outline: 'none' }}
                    />
                </div>
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
                        ) : filteredStudents.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>{searchTerm ? "No matching students found." : "No students found"}</td></tr>
                        ) : (
                            filteredStudents.map(student => (
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
