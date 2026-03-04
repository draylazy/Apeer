import { useState, useEffect } from 'react';
import './TeacherDashboard.css';

import TeacherProfileTab from './TeacherProfileTab';
import TeacherStudentsTab from './TeacherStudentsTab';
import TeacherGroupsTab from './TeacherGroupsTab';
import TeacherFormsTab from './TeacherFormsTab';
import TeacherEvaluationsTab from './TeacherEvaluationsTab';

function TeacherDashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('apeerTeacherActiveTab');
        return savedTab || 'profile';
    });

    // Save active tab to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('apeerTeacherActiveTab', activeTab);
    }, [activeTab]);

    // State for API Data
    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [forms, setForms] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // State for Toast Notifications
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    // Fetch data when tabs change
    useEffect(() => {
        if (activeTab === 'students') fetchStudents();
        else if (activeTab === 'groups') {
            fetchStudents(); // groups tab might need students for assignment
            fetchGroups();
        }
        else if (activeTab === 'form') fetchForms();
        else if (activeTab === 'evaluations') {
            fetchForms();
            fetchEvaluations();
        }
    }, [activeTab]);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/teacher/students');
            if (res.ok) setStudents(await res.json());
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/teacher/groups');
            if (res.ok) setGroups(await res.json());
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const fetchForms = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/teacher/forms');
            if (res.ok) setForms(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchEvaluations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/teacher/evaluations');
            if (res.ok) setEvaluations(await res.json());
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <TeacherProfileTab user={user} />;
            case 'students':
                return <TeacherStudentsTab students={students} isLoading={isLoading} fetchStudents={fetchStudents} showToast={showToast} />;
            case 'groups':
                return <TeacherGroupsTab groups={groups} students={students} isLoading={isLoading} fetchGroups={fetchGroups} showToast={showToast} />;
            case 'form':
                return <TeacherFormsTab forms={forms} fetchForms={fetchForms} showToast={showToast} />;
            case 'evaluations':
                return <TeacherEvaluationsTab evaluations={evaluations} forms={forms} isLoading={isLoading} />;
            default:
                return <TeacherProfileTab user={user} />;
        }
    };

    return (
        <div className="teacher-dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">SPES</div>
                    <h2>Dashboard</h2>
                </div>
                <nav className="sidebar-nav">
                    {toast.show && (
                        <div className={`toast-notification ${toast.type}`}>
                            <div className="toast-icon">
                                {toast.type === 'success' ? '✓' : '!'}
                            </div>
                            <div className="toast-message">{toast.message}</div>
                            <button className="toast-close" onClick={() => setToast({ ...toast, show: false })}>×</button>
                        </div>
                    )}
                    <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                        Profile
                    </button>
                    <button className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
                        Students
                    </button>
                    <button className={`nav-item ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>
                        Groups
                    </button>
                    <button className={`nav-item ${activeTab === 'form' ? 'active' : ''}`} onClick={() => setActiveTab('form')}>
                        Create Form
                    </button>
                    <button className={`nav-item ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => setActiveTab('evaluations')}>
                        Evaluations
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={onLogout} className="action-button secondary-button full-width logout-sidebar-btn">
                        Log Out
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <div className="breadcrumb">
                        Home / <span className="current-path">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                    </div>
                    <div className="header-actions">
                        <div className="notification-icon">🔔</div>
                        <div className="header-avatar">{user.firstName ? user.firstName.charAt(0) : 'T'}</div>
                    </div>
                </header>

                <div className="content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

export default TeacherDashboard;
