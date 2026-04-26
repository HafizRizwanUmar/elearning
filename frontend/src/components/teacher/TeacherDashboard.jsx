import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdMenuBook, MdPeople, MdAssignment, MdEventAvailable, MdStar } from 'react-icons/md';

const TeacherDashboard = () => {
    const { api } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/teacher/dashboard').then(r => { setStats(r.data); setLoading(false); }).catch(console.error);
    }, []);

    if (loading) return <div className="page-content" style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }} /></div>;

    const cards = [
        { icon: <MdMenuBook size={18}/>, label:'My Courses', value: stats?.my_courses??0, color:'#DAFF96' },
        { icon: <MdPeople size={18}/>, label:'My Students', value: stats?.my_students??0, color:'#A7D8DE' },
        { icon: <MdAssignment size={18}/>, label:'Assignments', value: stats?.my_assignments??0, color:'#FFE5C6' },
        { icon: <MdEventAvailable size={18}/>, label:'Attendance Rate', value:`${stats?.attendance_rate??0}%`, color:'#86EFAC' },
        { icon: <MdStar size={18}/>, label:'Submissions', value: stats?.submissions??0, color:'#C4B5FD' },
    ];

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Teacher Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Overview of your classes and student activity</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:32 }}>
                {cards.map((c,i) => (
                    <div key={i} className="stat-card animate-fade" style={{ borderLeft:`3px solid ${c.color}` }}>
                        <div className="stat-icon-wrap" style={{ background: c.color+'22' }}><span style={{ color:c.color }}>{c.icon}</span></div>
                        <div className="stat-value">{c.value}</div>
                        <div className="stat-label">{c.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
                <div className="widget-card" style={{ marginBottom:0 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>📨 Recent Submissions</h3>
                    {stats?.recent_submissions?.length === 0 && <div className="empty-state"><div className="empty-title">No submissions yet</div></div>}
                    {stats?.recent_submissions?.map((s,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                            <div className="avatar avatar-sm" style={{ background:'#A7D8DE', color:'black' }}>{s.student_name[0]}</div>
                            <div style={{ flex:1 }}>
                                <div style={{ fontSize:13, fontWeight:600 }}>{s.student_name}</div>
                                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.assignment_title} · <span className="badge badge-neutral">{s.code}</span></div>
                            </div>
                            <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : ''}</div>
                        </div>
                    ))}
                </div>

                <div className="widget-card" style={{ marginBottom:0 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>💡 Quick Actions</h3>
                    {[
                        { label:'Mark Attendance', desc:'Record today\'s attendance', color:'#DAFF96' },
                        { label:'Enter Grades', desc:'Update student grades', color:'#A7D8DE' },
                        { label:'Post Assignment', desc:'Create a new assignment', color:'#FFE5C6' },
                        { label:'Make Announcement', desc:'Notify your students', color:'#C4B5FD' },
                    ].map((a,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:'var(--r-md)', background:'var(--bg-card)', marginBottom:8 }}>
                            <div style={{ width:8, height:8, borderRadius:'50%', background:a.color, flexShrink:0 }} />
                            <div>
                                <div style={{ fontSize:13, fontWeight:600 }}>{a.label}</div>
                                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
