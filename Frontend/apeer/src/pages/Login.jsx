import { useState } from 'react'
import './Login.css'

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);



        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Successfully logged in, navigate to dashboard with user data
                onLoginSuccess(data);
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('Could not connect to the server. Please check if the backend is running.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Self and Peer Evaluation System</h1>
                <p className="login-subtitle">Login</p>

                {error && <div className="error-message" style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

            </div>
        </div>
    )
}

export default Login
