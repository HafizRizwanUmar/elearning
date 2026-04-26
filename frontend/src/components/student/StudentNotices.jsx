import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdCampaign } from 'react-icons/md';

const StudentNotices = () => {
    const { api } = useContext(AuthContext);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/student/notices').then(r=>{setNotices(r.data);setLoading(false);}).catch(console.error);
    }, []);

    if (loading) return <div className="page-content" style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }}/></div>;

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom:24 }}>
                <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Notices & Announcements</h1>
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>{notices.length} announcements from your teachers</p>
            </div>
            {notices.length===0 && <div className="empty-state"><div className="empty-icon"><MdCampaign size={20}/></div><div className="empty-title">No announcements yet</div></div>}
            {notices.map((n,i) => (
                <div key={i} className="stat-card" style={{ marginBottom:12, padding:'16px 20px', borderLeft:'3px solid var(--info)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <MdCampaign size={16} color="var(--info-text)"/>
                        <span style={{ fontWeight:700, fontSize:14 }}>{n.title}</span>
                        {n.course_name && <span className="badge badge-info">{n.code}</span>}
                    </div>
                    <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:8 }}>{n.content}</p>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>By {n.teacher_name} · {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</div>
                </div>
            ))}
        </div>
    );
};

export default StudentNotices;
