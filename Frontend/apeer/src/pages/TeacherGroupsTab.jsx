import React, { useState } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';

function TeacherGroupsTab({ groups, students, isLoading, fetchGroups, showToast }) {
    // State for Group Creation Modal & Search
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState(null); // tracking if we are editing an existing group
    const [studentSearchTerm, setStudentSearchTerm] = useState('');

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

    const handleOpenEditModal = (group) => {
        setNewGroupName(group.name);
        setSelectedStudentIds(group.members ? group.members.map(m => m.id) : []);
        setEditingGroupId(group.id);
        setStudentSearchTerm('');
        setIsCreateGroupModalOpen(true);
    };

    const handleCreateOrUpdateGroup = async () => {
        if (!newGroupName) {
            showToast('Group name is required.', 'error');
            return;
        }
        setIsSaving(true);

        try {
            const isEditing = editingGroupId !== null;
            const url = isEditing
                ? `http://localhost:8080/api/teacher/groups/${editingGroupId}`
                : 'http://localhost:8080/api/teacher/groups';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newGroupName,
                    memberIds: selectedStudentIds
                })
            });

            if (res.ok) {
                setNewGroupName('');
                setSelectedStudentIds([]);
                setEditingGroupId(null);
                setStudentSearchTerm('');
                setIsCreateGroupModalOpen(false);
                fetchGroups();
                showToast(`Group ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
            } else {
                const data = await res.json();
                showToast(data.message || `Failed to ${isEditing ? 'update' : 'create'} group`, 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to connect to the server.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        requestConfirm(
            "Delete Group?",
            "Are you sure you want to delete this group? The students will remain in the system.",
            async () => {
                try {
                    const res = await fetch(`http://localhost:8080/api/teacher/groups/${groupId}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        fetchGroups();
                        showToast('Group deleted successfully.', 'success');
                    } else {
                        showToast('Failed to delete group.', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Failed to connect to server.', 'error');
                }
            },
            true // isDestructive
        );
    };

    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(groupSearchTerm.toLowerCase()));

    const filteredStudents = students.filter(s =>
        (s.firstName && s.firstName.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
        (s.lastName && s.lastName.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
        (s.idNumber && s.idNumber.toLowerCase().includes(studentSearchTerm.toLowerCase()))
    );

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
                        setEditingGroupId(null);
                        setStudentSearchTerm('');
                        setIsCreateGroupModalOpen(true);
                    }}>Create Group</button>
                </div>
            </div>

            {/* Create/Edit Group Modal */}
            {isCreateGroupModalOpen && (
                <div className="form-builder-card" style={{ marginBottom: '20px' }}>
                    <h3>{editingGroupId ? 'Edit Group' : 'Create New Group'}</h3>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                            <label style={{ margin: 0 }}>Assign Students</label>
                            <input
                                type="text"
                                placeholder="Search students by name or ID..."
                                value={studentSearchTerm}
                                onChange={(e) => setStudentSearchTerm(e.target.value)}
                                style={{ padding: '6px 10px', fontSize: '0.85rem', width: '250px', border: '1px solid #dcdcdc', borderRadius: '4px' }}
                            />
                        </div>
                        <div className="students-list-container" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dcdcdc', borderRadius: '6px', padding: '10px' }}>
                            {filteredStudents.length === 0 ? <p style={{ fontSize: '0.9rem', color: '#666' }}>No students match your search.</p> : (
                                filteredStudents.map(student => (
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
                        <button className="action-button" disabled={isSaving} onClick={handleCreateOrUpdateGroup}>
                            {isSaving ? 'Saving...' : (editingGroupId ? 'Update Group' : 'Save Group')}
                        </button>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px' }}>
                                <button className="text-button" onClick={() => handleOpenEditModal(group)}>Edit Group</button>
                                <button className="text-button" style={{ color: '#d32f2f' }} onClick={() => handleDeleteGroup(group.id)}>Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

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

export default TeacherGroupsTab;
