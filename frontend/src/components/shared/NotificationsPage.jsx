import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
    MdNotifications, MdDoneAll, MdDelete, MdCircle,
    MdCampaign, MdInfo, MdWarning, MdCheckCircle, MdPeople, MdSchool, MdMenuBook, MdPerson
} from 'react-icons/md';

/* ─── Notification type icon mapping ─────────────────────────── */
const AUDIENCE_ICONS = {
    all:        { icon: MdPeople,   color: '#4B6BFB', label: 'Everyone'          },
    students:   { icon: MdPeople,   color: '#10B981', label: 'All Students'       },
    teachers:   { icon: MdSchool,   color: '#F59E0B', label: 'All Teachers'       },
    program:    { icon: MdMenuBook, color: '#8B5CF6', label: 'By Program'         },
    course:     { icon: MdMenuBook, color: '#EF4444', label: 'By Course'          },
    individual: { icon: MdPerson,   color: '#3B82F6', label: 'Individual'         },
};

/* ─── Load admin notifications from localStorage ─────────────── */
const loadAdminNotifs = (userRole) => {
    try {
        const all = JSON.parse(localStorage.getItem('classeta_admin_notifications') || '[]');
        return all.filter(n => {
            if (n.audience === 'all') return true;
            if (n.audience === 'students' && userRole === 'Student') return true;
            if (n.audience === 'teachers' && userRole === 'Teacher') return true;
            // For program/course/individual we include all for demo
            if (['program','course','individual'].includes(n.audience)) return true;
            return false;
        });
    } catch { return []; }
};

/* ─── Component ─────────────────────────────────────────────── */
const NotificationsPage = () => {
    const { api, user }  = useContext(AuthContext);
    const [notifs,   setNotifs]   = useState([]);
    const [adminN,   setAdminN]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [tab,      setTab]      = useState('inbox'); // 'inbox' | 'broadcast'

    const load = () => {
        api.get('/api/shared/notifications')
            .then(r => { setNotifs(r.data); })
            .catch(() => { setNotifs([]); })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        setAdminN(loadAdminNotifs(user?.role));
    }, []);

    const markRead = async (id) => {
        await api.put(`/api/shared/notifications/${id}/read`).catch(()=>{});
        setNotifs(prev => prev.map(n => n.id===id ? {...n, is_read:1} : n));
    };

    const markAll = async () => {
        await api.put('/api/shared/notifications/read-all').catch(()=>{});
        setNotifs(prev => prev.map(n => ({...n, is_read:1})));
    };

    const del = async (id) => {
        await api.delete(`/api/shared/notifications/${id}`).catch(()=>{});
        setNotifs(prev => prev.filter(n => n.id!==id));
    };

    const unread = notifs.filter(n => !n.is_read).length;

    if (loading) return (
        <div className="page-content" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
            <div className="spinner" style={{ width:36, height:36, borderWidth:3 }} />
        </div>
    );

    const combined = [
        ...notifs.map(n => ({ ...n, _source:'system' })),
        ...adminN.map(n => ({ ...n, _source:'admin', id:`admin_${n.id}`, message: `📢 ${n.title}: ${n.message}`, is_read:0, created_at: n.sentAt, _audienceInfo: AUDIENCE_ICONS[n.audience] }))
    ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    /* group by date */
    const grouped = combined.reduce((acc, n) => {
        const d = n.created_at ? new Date(n.created_at).toLocaleDateString('en-US', { dateStyle:'full' }) : 'Unknown Date';
        if (!acc[d]) acc[d] = [];
        acc[d].push(n);
        return acc;
    }, {});

    return (
        <div className="page-content animate-fade">

            {/* ─── Header ─── */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                <div>
                    <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Notifications</h1>
                    <p style={{ color:'var(--text-muted)', fontSize:13 }}>
                        {unread > 0 ? `${unread} unread · ` : ''}{combined.length} total
                    </p>
                </div>
                {unread > 0 && (
                    <button className="btn btn-ghost" onClick={markAll}>
                        <MdDoneAll size={16}/> Mark all read
                    </button>
                )}
            </div>

            {/* ─── Empty state ─── */}
            {combined.length === 0 && (
                <div className="empty-state" style={{ padding:'80px 40px' }}>
                    <div className="empty-icon" style={{ width:64, height:64 }}>
                        <MdNotifications size={30} color="var(--text-muted)" />
                    </div>
                    <div className="empty-title">All caught up!</div>
                    <div className="empty-body">No notifications at the moment. We'll let you know when something comes in.</div>
                </div>
            )}

            {/* ─── Grouped notifications ─── */}
            {Object.entries(grouped).map(([date, items]) => (
                <div key={date} style={{ marginBottom:20 }}>
                    {/* Date header */}
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                        <div style={{ height:1, flex:1, background:'var(--border)' }} />
                        <span style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{date}</span>
                        <div style={{ height:1, flex:1, background:'var(--border)' }} />
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {items.map(n => {
                            const isAdmin = n._source === 'admin';
                            const info    = n._audienceInfo;
                            const Icon    = isAdmin ? (info?.icon || MdCampaign) : MdNotifications;
                            const iconColor = isAdmin ? (info?.color || '#4B6BFB') : (n.is_read ? 'var(--text-muted)' : 'var(--primary)');

                            return (
                                <div key={n.id}
                                    onClick={() => !n.is_read && n._source==='system' && markRead(n.id)}
                                    style={{
                                        display:'flex', alignItems:'flex-start', gap:14,
                                        padding:'14px 16px',
                                        background: n.is_read ? 'transparent' : isAdmin ? 'rgba(75,107,251,0.06)' : 'var(--primary-muted)',
                                        borderRadius:'var(--r-md)',
                                        border:`1px solid ${n.is_read ? 'var(--border)' : isAdmin ? 'rgba(75,107,251,0.2)' : 'var(--primary-border)'}`,
                                        cursor: n.is_read || isAdmin ? 'default' : 'pointer',
                                        transition:'var(--t-fast)'
                                    }}>

                                    {/* Icon */}
                                    <div style={{ width:38, height:38, borderRadius:'var(--r-md)', background:`${iconColor}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                        <Icon size={18} color={iconColor} />
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex:1, minWidth:0 }}>
                                        {isAdmin && n._audienceInfo && (
                                            <span style={{ fontSize:10, fontWeight:700, color: info.color, background:`${info.color}18`, padding:'2px 8px', borderRadius:99, marginBottom:6, display:'inline-block' }}>
                                                📢 Broadcast — {info.label}
                                            </span>
                                        )}
                                        <div style={{ fontSize:13, color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight:1.6, fontWeight: n.is_read ? 400 : 600 }}>
                                            {n.message}
                                        </div>
                                        <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
                                            {n.created_at ? new Date(n.created_at).toLocaleTimeString('en-US', { timeStyle:'short' }) : ''}
                                        </div>
                                    </div>

                                    {/* Read dot */}
                                    <div style={{ paddingTop:6, flexShrink:0, display:'flex', alignItems:'center', gap:8 }}>
                                        <MdCircle size={8} color={n.is_read ? 'var(--border)' : iconColor} />
                                        {n._source === 'system' && (
                                            <button className="btn btn-ghost btn-sm btn-icon" onClick={e => { e.stopPropagation(); del(n.id); }}>
                                                <MdDelete size={14}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationsPage;
