import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdBarChart } from 'react-icons/md';

const AdminReports = () => {
    const { api } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/admin/reports').then(r => { setData(r.data); setLoading(false); }).catch(console.error);
    }, []);

    if (loading) return <div className="page-content" style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }} /></div>;

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Reports & Analytics</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Platform-wide performance statistics</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                {/* Top Students */}
                <div className="widget-card" style={{ marginBottom: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🏆 Top Performing Students</h3>
                    {data?.top_students?.map((s, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < data.top_students.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ width:28, height:28, borderRadius:'50%', background: ['#DAFF96','#A7D8DE','#FFE5C6','#86EFAC','#FCA5A5'][i], display:'flex', alignItems:'center', justifyContent:'center', color:'black', fontSize:11, fontWeight:700 }}>{i+1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.student_id}</div>
                            </div>
                            <div>
                                <div className="progress-bar" style={{ width: 80, marginBottom: 4 }}>
                                    <div className="progress-fill" style={{ width: `${s.avg}%` }} />
                                </div>
                                <div style={{ fontSize:11, color:'var(--primary)', fontWeight:700, textAlign:'right' }}>{s.avg}%</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grade distribution */}
                <div className="widget-card" style={{ marginBottom: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📊 Grade Distribution by Course</h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead><tr><th>Course</th><th>Avg</th><th>Best</th><th>Lowest</th><th>Graded</th></tr></thead>
                            <tbody>
                                {data?.grades_by_course?.map((g, i) => (
                                    <tr key={i}>
                                        <td><span className="badge badge-neutral">{g.code}</span></td>
                                        <td style={{ color:'var(--primary)', fontWeight:600 }}>{g.avg_score ?? '—'}</td>
                                        <td style={{ color:'var(--success-text)' }}>{g.max_score ?? '—'}</td>
                                        <td style={{ color:'var(--danger-text)' }}>{g.min_score ?? '—'}</td>
                                        <td>{g.graded_students}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Attendance by course */}
            <div className="widget-card">
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📅 Attendance Report by Course</h3>
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Course</th><th>Total Records</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance Rate</th></tr></thead>
                        <tbody>
                            {data?.attendance_by_course?.map((a, i) => {
                                const rate = a.total ? Math.round(a.present / a.total * 100) : 0;
                                return (
                                    <tr key={i}>
                                        <td><span className="badge badge-primary">{a.code}</span> <span style={{ fontSize:12 }}>{a.course}</span></td>
                                        <td>{a.total}</td>
                                        <td><span className="badge badge-success">{a.present}</span></td>
                                        <td><span className="badge badge-danger">{a.absent}</span></td>
                                        <td><span className="badge badge-warning">{a.late}</span></td>
                                        <td>
                                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                <div className="progress-bar" style={{ width:80 }}>
                                                    <div className="progress-fill" style={{ width:`${rate}%`, background: rate>80?'var(--success)':rate>60?'#FFE5C6':'var(--danger)' }} />
                                                </div>
                                                <span style={{ fontSize:12, fontWeight:700 }}>{rate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
