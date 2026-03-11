import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Fingerprint, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import './Login.css';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                login(data.access_token);
                navigate('/');
            } else {
                setError('Invalid credentials (use admin/admin)');
            }
        } catch (err) {
            setError('Connection to server failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            {/* Left Side: Brand Showcase */}
            <div className="login-brand-side">
                <div className="brand-content animate-fade-in">
                    <div className="logo-icon-large pulse-glow-animation animate-float">
                        <Fingerprint size={56} color="white" />
                    </div>
                    <h1 className="brand-title">BioSync System</h1>
                    <p className="brand-subtitle">The next-generation biometric workforce management solution seamlessly integrated for enterprise environments.</p>
                </div>
                <div className="brand-deco-circle-1"></div>
                <div className="brand-deco-circle-2"></div>
            </div>

            {/* Right Side: Login Form */}
            <div className="login-form-side">
                <div className="login-card glass-panel animate-fade-in-delayed">
                    <div className="login-header">
                        <h2>Welcome Back</h2>
                        <p>Please enter your credentials to continue</p>
                    </div>

                    {error && (
                        <div className="error-message animate-fade-in">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <User className="input-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <Lock className="input-icon" size={20} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`login-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
