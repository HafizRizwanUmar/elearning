import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
    MdPeople, MdSchool, MdMenuBook, MdEventAvailable,
    MdStar, MdBarChart, MdTrendingUp, MdArrowUpward
} from 'react-icons/md';

const StatCard = ({ icon, label, value, sub, gradient, delay }) => (
    <div className="admin-stat-card animate-fade" style={{ animationDelay: `${delay}s` }}>
        <div className="admin-stat-icon-wrap" style={{ background: gradient }}>
            {icon}
        </div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
        {sub && (
            <div className="admin-stat-sub">
                <MdArrowUpward size={11} /> {sub}
            </div>
        )}
    </div>
);

const AdminDashboard = () => {
    const { api, user } = useContext(AuthContext);
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
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3, borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#6366F1' }} />
        </div>
    );

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const statCards = [
        { icon: <MdPeople size={20} color="white" />, label: 'Total Students', value: stats?.students ?? 0, sub: `${stats?.enrollments ?? 0} active enrollments`, gradient: 'linear-gradient(135deg,#6366F1,#8B5CF6)', delay: 0 },
        { icon: <MdSchool size={20} color="white" />, label: 'Total Teachers', value: stats?.teachers ?? 0, sub: 'Active faculty staff', gradient: 'linear-gradient(135deg,#3B82F6,#06B6D4)', delay: 0.05 },
        { icon: <MdMenuBook size={20} color="white" />, label: 'Total Courses', value: stats?.courses ?? 0, sub: `${stats?.enrollments ?? 0} total enrolled`, gradient: 'linear-gradient(135deg,#F59E0B,#F97316)', delay: 0.10 },
        { icon: <MdEventAvailable size={20} color="white" />, label: 'Attendance Rate', value: `${stats?.attendance_rate ?? 0}%`, sub: 'Overall platform average', gradient: 'linear-gradient(135deg,#10B981,#06B6D4)', delay: 0.15 },
        { icon: <MdStar size={20} color="white" />, label: 'Avg Grade', value: `${stats?.avg_grade ?? 0}%`, sub: 'Across all courses', gradient: 'linear-gradient(135deg,#EF4444,#EC4899)', delay: 0.20 },
        { icon: <MdBarChart size={20} color="white" />, label: 'Enrollments', value: stats?.enrollments ?? 0, sub: 'All courses combined', gradient: 'linear-gradient(135deg,#8B5CF6,#6366F1)', delay: 0.25 },
    ];

    const rankColors = ['#6366F1','#8B5CF6','#3B82F6','#10B981','#F59E0B'];

    return (
        <div className="page-content animate-fade">

            {/* ── Hero Welcome Banner ── */}
            <div className="admin-hero-banner">
                <div className="admin-hero-content">
                    <div className="admin-hero-greeting">{greeting}, {user?.name?.split(' ')[0] || 'Admin'} 👋</div>
                    <div className="admin-hero-title">System Overview</div>
                    <div className="admin-hero-sub">Real-time analytics across all platform activity</div>
                </div>
                <div className="admin-hero-art">
                    <div className="admin-hero-ring admin-hero-ring-1" />
                    <div className="admin-hero-ring admin-hero-ring-2" />
                    <div className="admin-hero-ring admin-hero-ring-3" />
                    <MdTrendingUp size={48} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
            </div>

            {/* ── Stat Grid ── */}
            <div className="admin-stat-grid">
                {statCards.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* ── Tables Row ── */}
            <div className="admin-dash-grid">
                {/* Top Performers */}
                <div className="admin-dash-card">
                    <div className="admin-dash-card-header">
                        <span className="admin-dash-card-icon" style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>🏆</span>
                        <div>
                            <div className="admin-dash-card-title">Top Performers</div>
                            <div className="admin-dash-card-sub">Highest average grades</div>
                        </div>
                    </div>
                    <div className="admin-performers-list">
                        {reports?.top_students?.length === 0 && (
                            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No grade data yet</div>
                        )}
                        {reports?.top_students?.map((s, i) => (
                            <div key={i} className="admin-performer-row">
                                <div className="admin-performer-rank" style={{ background: rankColors[i] + '20', color: rankColors[i], border: `2px solid ${rankColors[i]}40` }}>
                                    {i + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="admin-performer-name">{s.name}</div>
                                    <div className="admin-performer-id">{s.student_id || 'No ID'}</div>
                                </div>
                                <div className="admin-performer-score" style={{ background: rankColors[i] + '15', color: rankColors[i] }}>
                                    {s.avg}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Grades */}
                <div className="admin-dash-card">
                    <div className="admin-dash-card-header">
                        <span className="admin-dash-card-icon" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>📊</span>
                        <div>
                            <div className="admin-dash-card-title">Course Grades</div>
                            <div className="admin-dash-card-sub">Average scores by course</div>
                        </div>
                    </div>
                    <div className="admin-table-wrap" style={{ marginTop: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Avg</th>
                                    <th>Max</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports?.grades_by_course?.map((g, i) => (
                                    <tr key={i} className="admin-table-row">
                                        <td>
                                            <span className="admin-id-badge">{g.code}</span>
                                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>{g.course}</span>
                                        </td>
                                        <td><span style={{ color: '#6366F1', fontWeight: 700, fontSize: 13 }}>{g.avg_score ?? '—'}</span></td>
                                        <td><span className="admin-muted">{g.max_score ?? '—'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Attendance Table ── */}
            <div className="admin-dash-card" style={{ marginTop: 24 }}>
                <div className="admin-dash-card-header">
                    <span className="admin-dash-card-icon" style={{ background: 'linear-gradient(135deg,#10B981,#06B6D4)' }}>📅</span>
                    <div>
                        <div className="admin-dash-card-title">Attendance by Course</div>
                        <div className="admin-dash-card-sub">Presence, absence and late tracking</div>
                    </div>
                </div>
                <div className="admin-table-wrap" style={{ marginTop: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Late</th>
                                <th>Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports?.attendance_by_course?.map((a, i) => {
                                const rate = a.total ? Math.round(a.present / a.total * 100) : 0;
                                const rateColor = rate > 80 ? '#10B981' : rate > 60 ? '#F59E0B' : '#EF4444';
                                return (
                                    <tr key={i} className="admin-table-row">
                                        <td>
                                            <span className="admin-id-badge">{a.code}</span>
                                            <span style={{ fontSize: 12, marginLeft: 8 }}>{a.course}</span>
                                        </td>
                                        <td><span style={{ color: '#10B981', fontWeight: 600, fontSize: 13 }}>{a.present}</span></td>
                                        <td><span style={{ color: '#EF4444', fontWeight: 600, fontSize: 13 }}>{a.absent}</span></td>
                                        <td><span style={{ color: '#F59E0B', fontWeight: 600, fontSize: 13 }}>{a.late}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden', minWidth: 60 }}>
                                                    <div style={{ height: '100%', width: `${rate}%`, background: rateColor, borderRadius: 99, transition: 'width 0.6s ease' }} />
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: rateColor, minWidth: 36 }}>{rate}%</span>
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
