import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdEventAvailable } from 'react-icons/md';

const STATUS_COLORS = { Present:'#86EFAC', Absent:'#FCA5A5', Late:'#FFE5C6' };

const StudentAttendance = () => {
    const { api } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/student/attendance').then(r => { setRecords(r.data); setLoading(false); }).catch(console.error);
    }, []);

    const counts = records.reduce((a,r)=>{a[r.status]=(a[r.status]||0)+1;return a;},{});
    const rate = records.length ? Math.round((counts.Present||0)/records.length*100) : 0;

    if (loading) return <div className="page-content" style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }}/></div>;

    return (
        <div className="page-content animate-fade">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                <div>
                    <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Attendance Record</h1>
                    <p style={{ color:'var(--text-muted)', fontSize:13 }}>{records.length} total sessions recorded</p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                    {Object.entries(counts).map(([s,n]) => (
                        <span key={s} className="badge" style={{ background:STATUS_COLORS[s]+'22', color:STATUS_COLORS[s], border:`1px solid ${STATUS_COLORS[s]}44`, padding:'5px 12px' }}>{s}: {n}</span>
                    ))}
                    <span className="badge badge-success" style={{ padding:'5px 12px' }}>Rate: {rate}%</span>
                </div>
            </div>

            {records.length===0 ? <div className="empty-state"><div className="empty-icon"><MdEventAvailable size={20}/></div><div className="empty-title">No attendance records yet</div></div> : (
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Date</th><th>Course</th><th>Code</th><th>Status</th></tr></thead>
                        <tbody>
                            {records.map((r,i) => (
                                <tr key={i}>
                                    <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{new Date(r.date).toLocaleDateString('en-US',{weekday:'short',year:'numeric',month:'short',day:'numeric'})}</td>
                                    <td style={{ fontWeight:600, fontSize:13 }}>{r.course_name}</td>
                                    <td><span className="badge badge-neutral">{r.code}</span></td>
                                    <td>
                                        <span className="badge" style={{ background:STATUS_COLORS[r.status]+'22', color:STATUS_COLORS[r.status], border:`1px solid ${STATUS_COLORS[r.status]}44` }}>
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentAttendance;
