import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdMenuBook } from 'react-icons/md';

const StudentCourses = () => {
    const { api } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/student/courses').then(r => { setCourses(r.data); setLoading(false); }).catch(console.error);
    }, []);

    if (loading) return <div className="page-content" style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }}/></div>;

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom:24 }}>
                <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>My Courses</h1>
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>Enrolled in {courses.length} courses this semester</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
                {courses.length===0 && <div className="empty-state"><div className="empty-icon"><MdMenuBook size={20}/></div><div className="empty-title">Not enrolled in any courses</div></div>}
                {courses.map(c => (
                    <div key={c.id} className="stat-card" style={{ padding:20, borderLeft:'3px solid var(--primary)' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                            <span className="badge badge-primary">{c.code}</span>
                            <span className="badge badge-neutral">{c.credits} cr</span>
                        </div>
                        <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{c.name}</div>
                        {c.description && <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12, lineHeight:1.6 }}>{c.description}</div>}
                        <div>
                            <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:4 }}>👨‍🏫 {c.teacher_name || 'TBA'}</div>
                            {c.schedule && <div style={{ fontSize:12, color:'var(--text-muted)' }}>📅 {c.schedule}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentCourses;
