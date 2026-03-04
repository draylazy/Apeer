import React, { useState } from 'react';

function TeacherGroupsTab({ groups, students, isLoading, fetchGroups, showToast }) {
    // State for Group Creation Modal & Search
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleCreateGroup = async () => {
        if (!newGroupName) {
            showToast('Group name is required.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch('http://localhost:8080/api/teacher/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newGroupName,
                    memberIds: selectedStudentIds
                })
            });
            if (res.ok) {
                setNewGroupName('');
                setSelectedStudentIds([]);
                setIsCreateGroupModalOpen(false);
                fetchGroups();
                showToast('Group created successfully!', 'success');
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to create group', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to connect to the server.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(groupSearchTerm.toLowerCase()));

    return (
        <div className="tab-content">
            <div className="flex-header">
                <h2 className="section-title">Student Groups</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={groupSearchTerm}
                        onChange={(e) => setGroupSearchTerm(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #dcdcdc', borderRadius: '6px', outline: 'none' }}
                    />
                    <button className="action-button" onClick={() => {
                        setNewGroupName('');
                        setSelectedStudentIds([]);
                        setIsCreateGroupModalOpen(true);
                    }}>Create Group</button>
                </div>
            </div>

            {/* Create Group Modal */}
            {isCreateGroupModalOpen && (
                <div className="form-builder-card" style={{ marginBottom: '20px' }}>
                    <h3>Create New Group</h3>
                    <div className="input-group" style={{ marginTop: '15px' }}>
                        <label>Group Name</label>
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            placeholder="e.g. Group 1"
                        />
                    </div>

                    <div className="input-group" style={{ marginTop: '15px' }}>
                        <label>Assign Students</label>
                        <div className="students-list-container" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dcdcdc', borderRadius: '6px', padding: '10px' }}>
                            {students.length === 0 ? <p style={{ fontSize: '0.9rem', color: '#666' }}>No students available.</p> : (
                                students.map(student => (
                                    <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <input
                                            type="checkbox"
                                            id={`student-${student.id}`}
                                            checked={selectedStudentIds.includes(student.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedStudentIds([...selectedStudentIds, student.id]);
                                                } else {
                                                    setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`student-${student.id}`} style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>
                                            {student.firstName} {student.lastName} ({student.idNumber})
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>{selectedStudentIds.length} students selected.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                        <button className="text-button" onClick={() => setIsCreateGroupModalOpen(false)}>Cancel</button>
                        <button className="action-button" disabled={isSaving} onClick={handleCreateGroup}>Save Group</button>
                    </div>
                </div>
            )}

            <div className="grid-cards">
                {isLoading ? (
                    <p>Loading groups...</p>
                ) : filteredGroups.length === 0 ? (
                    <p>{groupSearchTerm ? "No groups matching search." : "No groups created yet."}</p>
                ) : (
                    filteredGroups.map(group => (
                        <div className="group-card" key={group.id}>
                            <div className="group-card-header">
                                <h3>{group.name}</h3>
                                <span className="member-count">{group.members?.length || 0} Members</span>
                            </div>
                            <div className="group-members">
                                {group.members && group.members.length > 0 ? (
                                    group.members.map(member => (
                                        <p key={member.id}>{member.firstName} {member.lastName}</p>
                                    ))
                                ) : (
                                    <p style={{ color: '#999', fontStyle: 'italic', borderLeft: 'none', paddingLeft: 0 }}>No members yet</p>
                                )}
                            </div>
                            <button className="text-button">Edit Group</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default TeacherGroupsTab;
