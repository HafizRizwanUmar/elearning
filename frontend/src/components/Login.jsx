import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    MdEmail, MdLock, MdArrowForward,
    MdDashboard, MdBarChart, MdAssignment, MdEventNote,
    MdWarning, MdSchool
} from 'react-icons/md';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const demoLogins = [
        { label: 'Admin',   email: 'admin@gmail.com',       pass: 'admin123',   color: '#2563EB' },
        { label: 'Teacher', email: 'teacher@school.edu',    pass: 'teacher123', color: '#0284C7' },
        { label: 'Student', email: 'student@school.edu',    pass: 'student123', color: '#16A34A' },
    ];

    const features = [
        { icon: <MdDashboard size={15} />,  label: 'Unified Dashboards'    },
        { icon: <MdBarChart size={15} />,   label: 'Real-time Analytics'   },
        { icon: <MdAssignment size={15} />, label: 'Assignment Tracking'   },
        { icon: <MdEventNote size={15} />,  label: 'Attendance System'     },
    ];

    return (
        <div className="login-page">
            <div className="login-card animate-scale">

                {/* Brand panel */}
                <div className="login-brand">
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {/* Logo mark */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                            <div style={{
                                width: 34, height: 34,
                                background: 'var(--primary)',
                                borderRadius: 'var(--r-md)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'black', flexShrink: 0,
                            }}>
                                <MdSchool size={18} />
                            </div>
                            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                                CLASSETA
                            </span>
                        </div>

                        <div style={{
                            fontSize: 11, fontWeight: 600,
                            color: 'var(--primary)',
                            letterSpacing: '0.10em',
                            textTransform: 'uppercase',
                            marginBottom: 10,
                        }}>
                            Classeta LMS Portal
                        </div>

                        <h2 style={{
                            fontSize: 22, fontWeight: 700,
                            color: 'var(--text-primary)',
                            lineHeight: 1.25, marginBottom: 14,
                            letterSpacing: '-0.03em',
                        }}>
                            Modern platform for education
                        </h2>

                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: 13, lineHeight: 1.7, maxWidth: 260,
                        }}>
                            Manage courses, track attendance, grade assignments, and communicate — all in one place.
                        </p>
                    </div>

                    {/* Feature list */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {features.map((f, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                marginBottom: 10,
                            }}>
                                <div style={{
                                    width: 28, height: 28,
                                    borderRadius: 'var(--r-sm)',
                                    background: 'var(--primary-muted)',
                                    border: '1px solid var(--primary-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--primary)', flexShrink: 0,
                                }}>
                                    {f.icon}
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
                                    {f.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form panel */}
                <div className="login-form-panel">
                    <div style={{ marginBottom: 6 }}>
                        <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: 'var(--primary)',
                            letterSpacing: '0.10em', textTransform: 'uppercase',
                        }}>Welcome back</span>
                    </div>

                    <h2 style={{
                        fontSize: 20, fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: 4,
                        letterSpacing: '-0.03em',
                    }}>Sign in to your account</h2>

                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 26 }}>
                        Enter your credentials to continue
                    </p>

                    {error && (
                        <div className="alert alert-error">
                            <MdWarning size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="input-group">
                                <span className="input-group-prefix"><MdEmail size={15} /></span>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@school.edu"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-group">
                                <span className="input-group-prefix"><MdLock size={15} /></span>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -8 }}>
                            <Link to="/forgot-password" style={{
                                fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500,
                            }}>
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                            {loading ? (
                                <><div className="spinner" /> Signing in...</>
                            ) : (
                                <>Sign In <MdArrowForward size={16} /></>
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div style={{ marginTop: 26 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            marginBottom: 12,
                            color: 'var(--text-muted)', fontSize: 11,
                        }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            Demo accounts
                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {demoLogins.map(d => (
                                <button
                                    key={d.label}
                                    className="btn btn-ghost btn-sm"
                                    style={{ flex: 1, fontSize: 12 }}
                                    onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                                    type="button"
                                >
                                    <div style={{
                                        width: 7, height: 7, borderRadius: '50%',
                                        background: d.color, flexShrink: 0,
                                    }} />
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
