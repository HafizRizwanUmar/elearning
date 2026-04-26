import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdSchedule } from 'react-icons/md';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const StudentSchedule = () => {
    const { api } = useContext(AuthContext);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/student/schedule').then(r=>{setSchedule(r.data);setLoading(false);}).catch(console.error);
    }, []);

    if (loading) return <div className="page-content" style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }}/></div>;

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom:24 }}>
                <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>My Schedule</h1>
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>Weekly class timetable</p>
            </div>
            {schedule.length===0 && <div className="empty-state"><div className="empty-icon"><MdSchedule size={20}/></div><div className="empty-title">No schedule data</div></div>}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
                {schedule.map((c,i) => {
                    const colors = ['#DAFF96','#A7D8DE','#FFE5C6','#C4B5FD','#86EFAC'];
                    const col = colors[i % colors.length];
                    return (
                        <div key={c.id} className="stat-card" style={{ padding:18, borderLeft:`3px solid ${col}` }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                                <span className="badge badge-primary">{c.code}</span>
                                <span className="badge badge-neutral">{c.credits} cr</span>
                            </div>
                            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{c.name}</div>
                            <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:6 }}>👨‍🏫 {c.teacher_name || 'TBA'}</div>
                            <div style={{ fontSize:12, color:'var(--text-muted)', background:'var(--bg-elevated)', padding:'6px 10px', borderRadius:'var(--r-sm)' }}>📅 {c.schedule || 'TBA'}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentSchedule;
