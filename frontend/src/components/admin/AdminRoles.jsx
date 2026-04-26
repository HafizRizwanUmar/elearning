import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdAdminPanelSettings, MdSearch } from 'react-icons/md';

const ROLES = ['Admin', 'Teacher', 'Student'];
const roleColors = { Admin: '#FCA5A5', Teacher: '#A7D8DE', Student: '#DAFF96' };

const AdminRoles = () => {
    const { api } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [changing, setChanging] = useState({});

    const load = async () => {
        try { const { data } = await api.get('/api/admin/users'); setUsers(data); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const changeRole = async (uid, role) => {
        setChanging(p => ({ ...p, [uid]: true }));
        try {
            await api.put(`/api/admin/users/${uid}/role`, { role });
            setMsg({ text: `Role updated to ${role}`, type: 'success' });
            load();
        } catch { setMsg({ text: 'Failed to update role', type: 'error' }); }
        finally { setChanging(p => ({ ...p, [uid]: false })); }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>User Roles</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage access levels for all users</p>
            </div>

            {msg.text && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

            <div className="search-bar">
                <div className="search-input-wrap">
                    <span className="search-icon"><MdSearch /></span>
                    <input className="form-input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {/* Role filter chips */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {ROLES.map(r => (
                        <span key={r} className="badge" style={{ background: roleColors[r] + '22', color: roleColors[r], border: `1px solid ${roleColors[r]}44`, cursor: 'pointer', padding: '4px 12px' }}
                            onClick={() => setSearch(r)}>
                            {r}
                        </span>
                    ))}
                    {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead><tr><th>User</th><th>Current Role</th><th>Department</th><th>Joined</th><th>Change Role</th></tr></thead>
                    <tbody>
                        {loading ? (<tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>)
                        : filtered.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="avatar avatar-sm" style={{ background: roleColors[u.role], color: 'black' }}>{u.name[0]}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{u.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge" style={{ background: roleColors[u.role] + '22', color: roleColors[u.role], border: `1px solid ${roleColors[u.role]}44` }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {ROLES.filter(r => r !== u.role).map(r => (
                                            <button key={r} className="btn btn-ghost btn-sm" disabled={changing[u.id]}
                                                onClick={() => changeRole(u.id, r)}
                                                style={{ fontSize: 11, color: roleColors[r] }}>
                                                → {r}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRoles;
