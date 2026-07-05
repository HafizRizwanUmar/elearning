import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
    MdDashboard, MdPeople, MdSchool, MdMenuBook, MdAssignment,
    MdEventAvailable, MdBarChart, MdAdminPanelSettings, MdCampaign,
    MdCalendarMonth, MdNotifications, MdStar, MdLock, MdLogout, MdAutoAwesome,
    MdUpload, MdSend
} from 'react-icons/md';

const NAV_MAP = {
    Admin: [
        { section: 'Overview' },
        { id: 'dashboard',     label: 'Dashboard',           icon: MdDashboard,          path: '/admin/dashboard' },
        { section: 'Management' },
        { id: 'students',      label: 'Students',            icon: MdPeople,             path: '/admin/students' },
        { id: 'teachers',      label: 'Teachers',            icon: MdSchool,             path: '/admin/teachers' },
        { id: 'courses',       label: 'Courses',             icon: MdMenuBook,           path: '/admin/courses' },
        { section: 'System' },
        { id: 'roles',         label: 'User Roles',          icon: MdAdminPanelSettings, path: '/admin/roles' },
        { id: 'reports',       label: 'Reports',             icon: MdBarChart,           path: '/admin/reports' },
        { id: 'notifications', label: 'Notification Center', icon: MdSend,               path: '/admin/notifications' },
    ],
    Teacher: [
        { section: 'Overview' },
        { id: 'dashboard',     label: 'Dashboard',       icon: MdDashboard,      path: '/teacher/dashboard' },
        { section: 'Teaching' },
        { id: 'courses',       label: 'My Courses',      icon: MdMenuBook,       path: '/teacher/courses' },
        { id: 'students',      label: 'Students',        icon: MdPeople,         path: '/teacher/students' },
        { id: 'attendance',    label: 'Mark Attendance', icon: MdEventAvailable, path: '/teacher/attendance' },
        { id: 'grades',        label: 'Grades',          icon: MdStar,           path: '/teacher/grades' },
        { section: 'Content' },
        { id: 'upload',        label: 'Taxonomy Slides', icon: MdUpload,         path: '/teacher/upload' },
        { id: 'assignments',   label: 'Assignments',     icon: MdAssignment,     path: '/teacher/assignments' },
        { id: 'announcements', label: 'Announcements',   icon: MdCampaign,       path: '/teacher/announcements' },
    ],
    Student: [
        { section: 'Overview' },
        { id: 'dashboard',  label: 'Dashboard',       icon: MdDashboard,      path: '/student/dashboard' },
        { section: 'Academic' },
        { id: 'courses',    label: 'My Courses',      icon: MdMenuBook,       path: '/student/courses' },
        { id: 'schedule',   label: 'Schedule',        icon: MdCalendarMonth,  path: '/student/schedule' },
        { id: 'grades',     label: 'My Grades',       icon: MdStar,           path: '/student/grades' },
        { id: 'attendance', label: 'Attendance',      icon: MdEventAvailable, path: '/student/attendance' },
        { section: 'Learning' },
        { id: 'taxonomy',     label: 'Taxonomy Slides', icon: MdAutoAwesome, path: '/student/taxonomy' },
        { id: 'assignments',  label: 'Assignments',     icon: MdAssignment,  path: '/student/assignments' },
        { id: 'notices',      label: 'Notices',         icon: MdCampaign,    path: '/student/notices' },
    ],
};

// Gradient backgrounds per role for the avatar chip
const roleAvatarGradients = {
    Admin:   'linear-gradient(135deg, #F87171 0%, #FCA5A5 100%)',
    Teacher: 'linear-gradient(135deg, #38BDF8 0%, #A7D8DE 100%)',
    Student: 'linear-gradient(135deg, #84CC16 0%, #DAFF96 100%)',
};

// Pill badge color per role
const roleBadgeStyles = {
    Admin:   { background: 'rgba(248,113,113,0.15)', color: '#FCA5A5', border: '1px solid rgba(248,113,113,0.25)' },
    Teacher: { background: 'rgba(56,189,248,0.15)',  color: '#A7D8DE', border: '1px solid rgba(56,189,248,0.25)' },
    Student: { background: 'rgba(132,204,22,0.15)',  color: '#DAFF96', border: '1px solid rgba(132,204,22,0.25)' },
};

const Sidebar = ({ activePage, onNavigate }) => {
    const { user, logout } = useContext(AuthContext);
    const role = user?.role || 'Student';
    const navItems = NAV_MAP[role] || NAV_MAP.Student;
    const avatarGradient = roleAvatarGradients[role] || roleAvatarGradients.Student;
    const badgeStyle = roleBadgeStyles[role] || roleBadgeStyles.Student;

    return (
        <aside
            className="sidebar"
            style={{
                background: 'linear-gradient(180deg, #0f0f1a 0%, #13131f 60%, #0d0d18 100%)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* ── Logo ── */}
            <div className="sidebar-logo" style={{ height: 72, padding: '0 20px', gap: 12 }}>
                <img
                    src="/logo.jpeg"
                    alt="Classeta Logo"
                    style={{
                        width: 36, height: 36,
                        borderRadius: 10,
                        objectFit: 'cover',
                        flexShrink: 0,
                        boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                    }}
                />
                <span
                    className="sidebar-logo-text"
                    style={{
                        background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: 17,
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                    }}
                >
                    CLASSETA
                </span>
            </div>

            {/* ── User Profile Chip ── */}
            <div style={{ padding: '0 14px 14px' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 14,
                        border: '1px solid rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(8px)',
                        transition: 'background 0.2s ease',
                    }}
                >
                    {/* Circular avatar with gradient ring */}
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: avatarGradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 13,
                            color: '#0f0f1a',
                            flexShrink: 0,
                            boxShadow: '0 0 0 2px rgba(255,255,255,0.1)',
                        }}
                    >
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#E2E8F0',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginBottom: 3,
                            }}
                        >
                            {user?.name || 'User'}
                        </div>
                        {/* Role badge pill */}
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '1px 8px',
                                borderRadius: 999,
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                ...badgeStyle,
                            }}
                        >
                            {role}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav className="sidebar-nav" style={{ paddingBottom: 8 }}>
                {navItems.map((item, i) => {
                    if (item.section) {
                        return (
                            <div
                                key={i}
                                className="nav-section"
                                style={{
                                    color: 'rgba(255,255,255,0.3)',
                                    letterSpacing: '0.12em',
                                    padding: '14px 20px 4px',
                                }}
                            >
                                {item.section}
                            </div>
                        );
                    }

                    const Icon = item.icon;
                    const isActive = activePage === item.id;

                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => onNavigate(item.id, item.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 11,
                                padding: '10px 14px 10px 16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: isActive ? '#818CF8' : 'rgba(255,255,255,0.55)',
                                fontSize: 13.5,
                                fontWeight: isActive ? 700 : 500,
                                border: 'none',
                                background: isActive
                                    ? 'linear-gradient(90deg, rgba(99,102,241,0.25), rgba(99,102,241,0.08))'
                                    : 'transparent',
                                borderRadius: isActive ? '0 12px 12px 0' : '0 12px 12px 0',
                                width: 'calc(100% - 12px)',
                                textAlign: 'left',
                                boxShadow: isActive
                                    ? '0 0 16px rgba(99,102,241,0.2), inset 0 0 0 1px rgba(99,102,241,0.15)'
                                    : 'none',
                                marginBottom: 2,
                            }}
                        >
                            <span
                                style={{
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    borderRadius: isActive ? 8 : 6,
                                    background: isActive
                                        ? 'rgba(99,102,241,0.3)'
                                        : 'rgba(255,255,255,0.04)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Icon size={17} />
                            </span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                        </button>
                    );
                })}

                {/* ── Account Section ── */}
                <div
                    className="nav-section"
                    style={{
                        color: 'rgba(255,255,255,0.3)',
                        letterSpacing: '0.12em',
                        padding: '14px 20px 4px',
                        marginTop: 4,
                    }}
                >
                    Account
                </div>

                {[
                    { id: 'profile',       label: 'Profile',          Icon: MdPeople },
                    { id: 'notifications', label: 'Notifications',    Icon: MdNotifications },
                    { id: 'password',      label: 'Change Password',  Icon: MdLock },
                ].map(({ id, label, Icon }) => {
                    const isActive = activePage === id;
                    return (
                        <button
                            key={id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => onNavigate(id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 11,
                                padding: '10px 14px 10px 16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: isActive ? '#818CF8' : 'rgba(255,255,255,0.55)',
                                fontSize: 13.5,
                                fontWeight: isActive ? 700 : 500,
                                border: 'none',
                                background: isActive
                                    ? 'linear-gradient(90deg, rgba(99,102,241,0.25), rgba(99,102,241,0.08))'
                                    : 'transparent',
                                borderRadius: '0 12px 12px 0',
                                width: 'calc(100% - 12px)',
                                textAlign: 'left',
                                boxShadow: isActive
                                    ? '0 0 16px rgba(99,102,241,0.2), inset 0 0 0 1px rgba(99,102,241,0.15)'
                                    : 'none',
                                marginBottom: 2,
                            }}
                        >
                            <span
                                style={{
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    borderRadius: isActive ? 8 : 6,
                                    background: isActive
                                        ? 'rgba(99,102,241,0.3)'
                                        : 'rgba(255,255,255,0.04)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Icon size={17} />
                            </span>
                            <span style={{ flex: 1 }}>{label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* ── Logout ── */}
            <div
                style={{
                    paddingTop: 8,
                    paddingBottom: 16,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <button
                    onClick={logout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 11,
                        padding: '10px 14px 10px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: 'rgba(239,68,68,0.8)',
                        fontSize: 13.5,
                        fontWeight: 600,
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '0 12px 12px 0',
                        width: 'calc(100% - 12px)',
                        textAlign: 'left',
                        marginTop: 4,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                        e.currentTarget.style.color = '#F87171';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(239,68,68,0.8)';
                    }}
                >
                    <span
                        style={{
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            borderRadius: 6,
                            background: 'rgba(239,68,68,0.1)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <MdLogout size={17} />
                    </span>
                    Log Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
