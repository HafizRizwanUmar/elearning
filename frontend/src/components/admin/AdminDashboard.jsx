import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdPeople, MdSchool, MdMenuBook, MdTrendingUp, MdEventAvailable, MdStar, MdPersonAdd, MdBarChart } from 'react-icons/md';

const StatCard = ({ icon, label, value, sub, color }) => (
    <div className="stat-card animate-fade" style={{ borderLeft: `3px solid ${color}` }}>
        <div className="stat-icon-wrap" style={{ background: color + '22' }}>
            <span style={{ color }}>{icon}</span>
        </div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-change up" style={{ marginTop: 8 }}>{sub}</div>}
    </div>
);

const AdminDashboard = () => {
    const { api } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/api/admin/stats'), api.get('/api/admin/reports')])
            .then(([s, r]) => { setStats(s.data); setReports(r.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
    );

    const statCards = [
        { icon: <MdPeople size={18} />, label: 'Total Students', value: stats?.students ?? 0, color: '#DAFF96', sub: `${stats?.enrollments ?? 0} enrollments` },
        { icon: <MdSchool size={18} />, label: 'Total Teachers', value: stats?.teachers ?? 0, color: '#A7D8DE', sub: 'Active staff' },
        { icon: <MdMenuBook size={18} />, label: 'Total Courses', value: stats?.courses ?? 0, color: '#FFE5C6', sub: `${stats?.enrollments ?? 0} enrolled` },
        { icon: <MdEventAvailable size={18} />, label: 'Attendance Rate', value: `${stats?.attendance_rate ?? 0}%`, color: '#86EFAC', sub: 'Overall average' },
        { icon: <MdStar size={18} />, label: 'Avg Grade', value: `${stats?.avg_grade ?? 0}%`, color: '#FCA5A5', sub: 'Across all courses' },
        { icon: <MdBarChart size={18} />, label: 'Total Enrollments', value: stats?.enrollments ?? 0, color: '#C4B5FD', sub: 'All courses combined' },
    ];

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>System Overview</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Real-time analytics across all platform activity</p>
            </div>

            {/* Stat Grid */}
            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {statCards.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Tables Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Top Students */}
                <div className="widget-card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700 }}>🏆 Top Performers</h3>
                    </div>
                    {reports?.top_students?.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: ['#DAFF96','#A7D8DE','#FFE5C6','#86EFAC','#FCA5A5'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: 11, fontWeight: 700 }}>{i+1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.student_id}</div>
                            </div>
                            <span className="badge badge-success">{s.avg}%</span>
                        </div>
                    ))}
                </div>

                {/* Grades by Course */}
                <div className="widget-card" style={{ marginBottom: 0 }}>
                    <div style={{ marginBottom: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700 }}>📊 Course Grades</h3>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead><tr><th>Course</th><th>Avg</th><th>Max</th></tr></thead>
                            <tbody>
                                {reports?.grades_by_course?.map((g, i) => (
                                    <tr key={i}>
                                        <td><span className="badge badge-neutral">{g.code}</span> <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{g.course}</span></td>
                                        <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{g.avg_score ?? '—'}</span></td>
                                        <td>{g.max_score ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Attendance by Course */}
            <div className="widget-card" style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📅 Attendance by Course</h3>
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Course</th><th>Present</th><th>Absent</th><th>Late</th><th>Rate</th></tr></thead>
                        <tbody>
                            {reports?.attendance_by_course?.map((a, i) => {
                                const rate = a.total ? Math.round(a.present / a.total * 100) : 0;
                                return (
                                    <tr key={i}>
                                        <td><span className="badge badge-neutral">{a.code}</span> <span style={{ fontSize: 12 }}>{a.course}</span></td>
                                        <td><span className="badge badge-success">{a.present}</span></td>
                                        <td><span className="badge badge-danger">{a.absent}</span></td>
                                        <td><span className="badge badge-warning">{a.late}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="progress-bar" style={{ width: 60 }}>
                                                    <div className="progress-fill" style={{ width: `${rate}%`, background: rate > 80 ? 'var(--success)' : rate > 60 ? 'var(--warning)' : 'var(--danger)' }} />
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 600 }}>{rate}%</span>
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

export default AdminDashboard;
