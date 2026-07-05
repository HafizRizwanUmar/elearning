import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { MdNotifications, MdSearch } from 'react-icons/md';

// Role-based gradient for the avatar ring & chip
const roleRingColors = {
    Admin:   'linear-gradient(135deg, #F87171, #FCA5A5)',
    Teacher: 'linear-gradient(135deg, #38BDF8, #A7D8DE)',
    Student: 'linear-gradient(135deg, #84CC16, #DAFF96)',
};

const roleChipStyles = {
    Admin:   { background: 'rgba(248,113,113,0.15)', color: '#FCA5A5', border: '1px solid rgba(248,113,113,0.25)' },
    Teacher: { background: 'rgba(56,189,248,0.15)',  color: '#A7D8DE', border: '1px solid rgba(56,189,248,0.25)' },
    Student: { background: 'rgba(132,204,22,0.15)',  color: '#DAFF96', border: '1px solid rgba(132,204,22,0.25)' },
};

const Layout = ({ children, activePage, onNavigate, title }) => {
    const { user } = useContext(AuthContext);
    const role = user?.role || 'Student';
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const ringGradient = roleRingColors[role] || roleRingColors.Student;
    const chipStyle   = roleChipStyles[role]  || roleChipStyles.Student;

    const [searchFocused, setSearchFocused] = useState(false);

    return (
        <div className="app-container">
            <Sidebar activePage={activePage} onNavigate={onNavigate} />

            <div className="main-content">
                {/* ── Glassmorphic Top Header ── */}
                <header
                    className="top-header"
                    style={{
                        background: 'rgba(15,15,26,0.85)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        height: 64,
                        padding: '0 28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 20,
                        position: 'sticky',
                        top: 0,
                        zIndex: 50,
                    }}
                >
                    {/* Left — page title with gradient */}
                    <div
                        style={{
                            minWidth: 0,
                            flexShrink: 0,
                        }}
                    >
                        <h1
                            className="page-header-title"
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                letterSpacing: '-0.02em',
                                lineHeight: 1,
                                margin: 0,
                                background: 'linear-gradient(90deg, #E2E8F0 30%, #818CF8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {title || 'Dashboard'}
                        </h1>
                    </div>

                    {/* Center — glass search bar */}
                    <div
                        className="header-search"
                        style={{
                            flex: 1,
                            maxWidth: 380,
                            position: 'relative',
                        }}
                    >
                        <MdSearch
                            className="search-icon"
                            size={18}
                            style={{
                                position: 'absolute',
                                left: 14,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(255,255,255,0.35)',
                                pointerEvents: 'none',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search courses, topics, authors…"
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            style={{
                                width: '100%',
                                padding: '10px 18px 10px 40px',
                                background: searchFocused
                                    ? 'rgba(255,255,255,0.07)'
                                    : 'rgba(255,255,255,0.05)',
                                border: searchFocused
                                    ? '1px solid rgba(99,102,241,0.5)'
                                    : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 999,
                                color: '#E2E8F0',
                                fontSize: 13,
                                fontFamily: 'inherit',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxShadow: searchFocused
                                    ? '0 0 0 3px rgba(99,102,241,0.12)'
                                    : 'none',
                            }}
                        />
                    </div>

                    {/* Right — notification bell + avatar + name */}
                    <div
                        className="header-right"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            flexShrink: 0,
                        }}
                    >
                        {/* Notification bell with animated badge */}
                        <button
                            className="header-icon-btn"
                            style={{
                                position: 'relative',
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: 'rgba(255,255,255,0.7)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
                                e.currentTarget.style.color = '#818CF8';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                            }}
                        >
                            <MdNotifications size={20} />
                            {/* Animated notification dot */}
                            <span
                                style={{
                                    position: 'absolute',
                                    top: 6,
                                    right: 7,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: '#F87171',
                                    border: '2px solid #0f0f1a',
                                    animation: 'pulse 2s ease-in-out infinite',
                                }}
                            />
                        </button>

                        {/* Divider */}
                        <div
                            style={{
                                width: 1,
                                height: 28,
                                background: 'rgba(255,255,255,0.08)',
                                flexShrink: 0,
                            }}
                        />

                        {/* Avatar + user info */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                cursor: 'pointer',
                            }}
                        >
                            {/* Avatar with gradient ring */}
                            <div
                                style={{
                                    padding: 2,
                                    borderRadius: '50%',
                                    background: ringGradient,
                                    flexShrink: 0,
                                    boxShadow: '0 0 12px rgba(99,102,241,0.25)',
                                }}
                            >
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: '#1a1a2e',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: 13,
                                        color: '#E2E8F0',
                                    }}
                                >
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=1e1e3a&color=E2E8F0&bold=true&size=64`}
                                        alt="avatar"
                                        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Name + role chip */}
                            <div style={{ textAlign: 'left' }}>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        fontSize: 13,
                                        color: '#E2E8F0',
                                        lineHeight: 1.2,
                                        whiteSpace: 'nowrap',
                                        marginBottom: 3,
                                    }}
                                >
                                    {user?.name || 'User'}
                                </div>
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '1px 7px',
                                        borderRadius: 999,
                                        fontSize: 9,
                                        fontWeight: 700,
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                        ...chipStyle,
                                    }}
                                >
                                    {role}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Page Content ── */}
                <main style={{ flex: 1 }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
