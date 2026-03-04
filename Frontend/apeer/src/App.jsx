import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import ConfirmationModal from './components/ConfirmationModal'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', or 'dashboard'
  const [user, setUser] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check for existing session on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('apeerUser');
    const lastActive = localStorage.getItem('apeerLastActive');

    if (savedUser && lastActive) {
      const now = new Date().getTime();
      const thirtyMinutes = 30 * 60 * 1000;

      if (now - parseInt(lastActive) < thirtyMinutes) {
        // Session is still valid
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setCurrentView(parsedUser?.role === 'teacher' ? 'teacher-dashboard' : 'dashboard');
        localStorage.setItem('apeerLastActive', now.toString()); // Refresh timer
      } else {
        // Session expired
        handleLogout();
      }
    }
  }, []);

  // Set up global activity listeners to refresh the 30-minute timer
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      localStorage.setItem('apeerLastActive', new Date().getTime().toString());
    };

    // Update activity timer on mouse movement or typing
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    // Periodically check if session has expired
    const interval = setInterval(() => {
      const lastActive = localStorage.getItem('apeerLastActive');
      if (lastActive) {
        const now = new Date().getTime();
        if (now - parseInt(lastActive) > 30 * 60 * 1000) {
          handleLogout();
          setSessionExpired(true);
        }
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(interval);
    };
  }, [user]);

  const navigateToLogin = () => setCurrentView('login');
  const navigateToDashboard = (userData) => {
    setUser(userData);
    setCurrentView(userData?.role === 'teacher' ? 'teacher-dashboard' : 'dashboard');
    // Save to localStorage
    localStorage.setItem('apeerUser', JSON.stringify(userData));
    localStorage.setItem('apeerLastActive', new Date().getTime().toString());
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    localStorage.removeItem('apeerUser');
    localStorage.removeItem('apeerLastActive');
  };

  return (
    <>
      {currentView === 'login' && <Login onLoginSuccess={navigateToDashboard} />}
      {currentView === 'dashboard' && <Dashboard user={user} onLogout={handleLogout} />}
      {currentView === 'teacher-dashboard' && <TeacherDashboard user={user} onLogout={handleLogout} />}

      <ConfirmationModal
        isOpen={sessionExpired}
        title="Session Expired"
        message="Your session has expired due to inactivity. Please log in again."
        onConfirm={() => setSessionExpired(false)}
        confirmText="Okay"
        isDestructive={false}
      />
    </>
  )
}

export default App
