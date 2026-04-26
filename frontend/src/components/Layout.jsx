import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { MdNotifications, MdSearch } from 'react-icons/md';

const Layout = ({ children, activePage, onNavigate, title }) => {
    const { user } = useContext(AuthContext);

    // Initial for avatar
    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    return (
        <div className="app-container">
            <Sidebar activePage={activePage} onNavigate={onNavigate} />

            <div className="main-content">
                {/* Top Header */}
                <header className="top-header">
                    <div className="page-header-title">{title || 'Dashboard'}</div>
                    
                    <div className="header-search">
                        <MdSearch className="search-icon" size={20} />
                        <input type="text" placeholder="Course, theme, author" />
                    </div>

                    <div className="header-right">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'right' }}>
                            <div className="avatar avatar-md" style={{ background: '#333' }}>
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${user?.name}&background=333&color=fff`} 
                                    alt="avatar" 
                                    style={{ borderRadius: '50%', width: '100%' }} 
                                />
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{user?.name || 'User'}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{user?.role || 'Student'}</div>
                            </div>
                        </div>

                        <button className="header-icon-btn" style={{ borderRadius: '50%', width: '40px', height: '40px', background: '#121212', border: 'none' }}>
                            <MdNotifications size={22} color="#D1F55C" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1 }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

