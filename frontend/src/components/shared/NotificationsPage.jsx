import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdNotifications, MdDoneAll, MdDelete, MdCircle } from 'react-icons/md';

const NotificationsPage = () => {
    const { api } = useContext(AuthContext);
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        api.get('/api/shared/notifications').then(r=>{setNotifs(r.data);setLoading(false);}).catch(console.error);
    };
    useEffect(()=>{ load(); },[]);

    const markRead = async (id) => {
        await api.put(`/api/shared/notifications/${id}/read`);
        setNotifs(prev=>prev.map(n=>n.id===id?{...n,is_read:1}:n));
    };

    const markAll = async () => {
        await api.put('/api/shared/notifications/read-all');
        setNotifs(prev=>prev.map(n=>({...n,is_read:1})));
    };

    const del = async (id) => {
        await api.delete(`/api/shared/notifications/${id}`);
        setNotifs(prev=>prev.filter(n=>n.id!==id));
    };

    const unread = notifs.filter(n=>!n.is_read).length;

    if (loading) return <div className="page-content" style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }}/></div>;

    return (
        <div className="page-content animate-fade">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                <div>
                    <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Notifications</h1>
                    <p style={{ color:'var(--text-muted)', fontSize:13 }}>{unread} unread · {notifs.length} total</p>
                </div>
                {unread > 0 && <button className="btn btn-ghost" onClick={markAll}><MdDoneAll size={16}/> Mark all read</button>}
            </div>

            {notifs.length===0 && <div className="empty-state"><div className="empty-icon"><MdNotifications size={20}/></div><div className="empty-title">All caught up!</div><div className="empty-body">No notifications at the moment</div></div>}

            {notifs.map(n => (
                <div key={n.id} onClick={()=>!n.is_read&&markRead(n.id)} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 16px', background: n.is_read?'transparent':'var(--primary-muted)', borderRadius:'var(--r-md)', marginBottom:8, border:`1px solid ${n.is_read?'var(--border)':'var(--primary-border)'}`, cursor: n.is_read?'default':'pointer', transition:'var(--t-fast)' }}>
                    <div style={{ paddingTop:4, flexShrink:0 }}>
                        {n.is_read ? <MdCircle size={8} color="var(--text-muted)"/> : <MdCircle size={8} color="var(--primary)"/>}
                    </div>
                    <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color: n.is_read?'var(--text-secondary)':'var(--text-primary)', lineHeight:1.5, fontWeight: n.is_read?400:600 }}>{n.message}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={e=>{e.stopPropagation();del(n.id);}}><MdDelete size={14}/></button>
                </div>
            ))}
        </div>
    );
};

export default NotificationsPage;
