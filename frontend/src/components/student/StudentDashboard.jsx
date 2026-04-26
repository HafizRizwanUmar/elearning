import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdMenuBook, MdEventAvailable, MdStar, MdAssignment } from 'react-icons/md';

const StudentDashboard = () => {
    const { api, user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/student/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(console.error);
    }, []);

    if (loading) return <div className="page-content" style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }} /></div>;

    const cards = [
        { icon:<MdMenuBook size={18}/>, label:'Enrolled Courses', value:data?.enrolled_courses??0, color:'#DAFF96' },
        { icon:<MdEventAvailable size={18}/>, label:'Attendance Rate', value:`${data?.attendance_rate??0}%`, color:'#86EFAC' },
        { icon:<MdStar size={18}/>, label:'Average Grade', value:`${data?.avg_grade??0}%`, color:'#A7D8DE' },
        { icon:<MdAssignment size={18}/>, label:'Pending Assignments', value:data?.pending_assignments??0, color:'#FFE5C6' },
    ];

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom:28 }}>
                <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>Here's a summary of your academic progress</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
                {cards.map((c,i) => (
                    <div key={i} className="stat-card animate-fade" style={{ borderLeft:`3px solid ${c.color}` }}>
                        <div className="stat-icon-wrap" style={{ background:c.color+'22' }}><span style={{ color:c.color }}>{c.icon}</span></div>
                        <div className="stat-value">{c.value}</div>
                        <div className="stat-label">{c.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
                <div className="widget-card" style={{ marginBottom:0 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>📚 My Courses</h3>
                    {data?.recent_courses?.map((c,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                            <div style={{ width:36, height:36, borderRadius:'var(--r-md)', background:'var(--primary-muted)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--primary)', fontSize:11, fontWeight:700 }}>{c.code?.slice(0,3)}</div>
                            <div style={{ flex:1 }}>
                                <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
                                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.teacher} · {c.schedule}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="widget-card" style={{ marginBottom:0 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>📋 Upcoming Assignments</h3>
                    {data?.upcoming_assignments?.length===0 && <div className="empty-title" style={{ color:'var(--text-muted)', fontSize:13 }}>All caught up! 🎉</div>}
                    {data?.upcoming_assignments?.map((a,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                            <div>
                                <div style={{ fontSize:13, fontWeight:600 }}>{a.title}</div>
                                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.course} · Due: {a.deadline ? new Date(a.deadline).toLocaleDateString() : '—'}</div>
                            </div>
                            <span className={`badge ${a.status==='Submitted'?'badge-success':'badge-warning'}`} style={{ marginLeft:'auto' }}>{a.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
