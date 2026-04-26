import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
    MdDashboard, MdPeople, MdSchool, MdMenuBook, MdAssignment,
    MdEventAvailable, MdBarChart, MdAdminPanelSettings, MdCampaign,
    MdCalendarMonth, MdNotifications, MdStar, MdLock, MdLogout, MdAutoAwesome
} from 'react-icons/md';

const NAV_MAP = {
    Admin: [
        { section: 'Overview' },
        { id: 'dashboard',     label: 'Dashboard',    icon: MdDashboard,          path: '/admin/dashboard' },
        { section: 'Management' },
        { id: 'students',      label: 'Students',     icon: MdPeople,             path: '/admin/students' },
        { id: 'teachers',      label: 'Teachers',     icon: MdSchool,             path: '/admin/teachers' },
        { id: 'courses',       label: 'Courses',      icon: MdMenuBook,           path: '/admin/courses' },
        { section: 'System' },
        { id: 'roles',         label: 'User Roles',   icon: MdAdminPanelSettings, path: '/admin/roles' },
        { id: 'reports',       label: 'Reports',      icon: MdBarChart,           path: '/admin/reports' },
    ],
    Teacher: [
        { section: 'Overview' },
        { id: 'dashboard',     label: 'Dashboard',    icon: MdDashboard,     path: '/teacher/dashboard' },
        { section: 'Teaching' },
        { id: 'courses',       label: 'My Courses',   icon: MdMenuBook,      path: '/teacher/courses' },
        { id: 'students',      label: 'Students',     icon: MdPeople,        path: '/teacher/students' },
        { id: 'attendance',    label: 'Attendance',   icon: MdEventAvailable, path: '/teacher/attendance' },
        { id: 'grades',        label: 'Grades',       icon: MdStar,          path: '/teacher/grades' },
        { section: 'Content' },
        { id: 'assignments',   label: 'Assignments',  icon: MdAssignment,    path: '/teacher/assignments' },
        { id: 'announcements', label: 'Announcements',icon: MdCampaign,      path: '/teacher/announcements' },
    ],
    Student: [
        { section: 'Overview' },
        { id: 'dashboard',     label: 'Dashboard',    icon: MdDashboard,     path: '/student/dashboard' },
        { section: 'Academic' },
        { id: 'courses',       label: 'My Courses',   icon: MdMenuBook,      path: '/student/courses' },
        { id: 'schedule',      label: 'Schedule',     icon: MdCalendarMonth, path: '/student/schedule' },
        { id: 'grades',        label: 'My Grades',    icon: MdStar,          path: '/student/grades' },
        { id: 'attendance',    label: 'Attendance',   icon: MdEventAvailable,path: '/student/attendance' },
        { section: 'Tasks' },
        { id: 'assignments',   label: 'Assignments',  icon: MdAssignment,    path: '/student/assignments' },
        { id: 'notices',       label: 'Notices',      icon: MdCampaign,      path: '/student/notices' },
    ],
};

const roleColors = { Admin: '#FCA5A5', Teacher: '#A7D8DE', Student: '#DAFF96' };

const Sidebar = ({ activePage, onNavigate }) => {
    const { user, logout } = useContext(AuthContext);
    const role = user?.role || 'Student';
    const navItems = NAV_MAP[role] || NAV_MAP.Student;
    const roleColor = roleColors[role] || 'var(--primary)';

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <MdAutoAwesome size={20} />
                </div>
                <span className="sidebar-logo-text">Classeta</span>
            </div>

            {/* User chip */}
            <div style={{ padding: '0 16px 12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                    <div className="avatar avatar-sm" style={{ background: roleColor, color: 'black', flexShrink: 0 }}>{user?.name?.[0] || 'U'}</div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
                        <div style={{ fontSize: 10, color: roleColor, fontWeight: 600 }}>{role}</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item, i) => {
                    if (item.section) return <div key={i} className="nav-section">{item.section}</div>;
                    const Icon = item.icon;
                    return (
                        <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                            onClick={() => onNavigate(item.id, item.path)}>
                            <span className="nav-item-icon"><Icon size={20} /></span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                        </button>
                    );
                })}

                <div className="nav-section" style={{ marginTop: 8 }}>Account</div>
                <button className={`nav-item ${activePage==='profile'?'active':''}`} onClick={()=>onNavigate('profile')}>
                    <span className="nav-item-icon"><MdPeople size={20}/></span>
                    <span style={{ flex:1 }}>Profile</span>
                </button>
                <button className={`nav-item ${activePage==='notifications'?'active':''}`} onClick={()=>onNavigate('notifications')}>
                    <span className="nav-item-icon"><MdNotifications size={20}/></span>
                    <span style={{ flex:1 }}>Notifications</span>
                </button>
                <button className={`nav-item ${activePage==='password'?'active':''}`} onClick={()=>onNavigate('password')}>
                    <span className="nav-item-icon"><MdLock size={20}/></span>
                    <span style={{ flex:1 }}>Change Password</span>
                </button>
            </nav>

            {/* Logout */}
            <div style={{ paddingBottom: 16, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <button className="nav-item" onClick={logout} style={{ color: 'var(--danger-text)' }}>
                    <span className="nav-item-icon"><MdLogout size={20} /></span>
                    Log Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
