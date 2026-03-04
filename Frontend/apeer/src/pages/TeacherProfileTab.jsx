import React from 'react';

function TeacherProfileTab({ user }) {
    return (
        <div className="tab-content">
            <h2 className="section-title">Teacher Profile</h2>
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">{user.firstName ? user.firstName.charAt(0) : 'T'}</div>
                    <div className="profile-info">
                        <h3>{user.firstName} {user.lastName}</h3>
                        <p>{user.email}</p>
                        <span className="role-badge">Administrator / Teacher</span>
                    </div>
                </div>
                <div className="profile-details-grid">
                    <div className="detail-item">
                        <label>Department</label>
                        <p>Computer Science</p>
                    </div>
                    <div className="detail-item">
                        <label>Employee ID</label>
                        <p>EMP-2024-001</p>
                    </div>
                    <div className="detail-item">
                        <label>Active Classes</label>
                        <p>3</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherProfileTab;
