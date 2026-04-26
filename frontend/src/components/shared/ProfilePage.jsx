import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdPerson, MdSave } from 'react-icons/md';

const ProfilePage = () => {
    const { api, user, updateUser } = useContext(AuthContext);
    const [form, setForm] = useState({ name:'', phone:'', department:'', major:'', bio:'' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text:'', type:'' });

    useEffect(() => {
        api.get('/api/shared/profile').then(r => {
            const d = r.data;
            setForm({ name:d.name||'', phone:d.phone||'', department:d.department||'', major:d.major||'', bio:d.bio||'' });
            setLoading(false);
        }).catch(console.error);
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            const { data } = await api.put('/api/shared/profile', form);
            updateUser(data);
            setMsg({ text:'Profile updated successfully!', type:'success' });
        } catch { setMsg({ text:'Failed to save profile', type:'error' }); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="page-content" style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }}/></div>;

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom:24 }}>
                <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>My Profile</h1>
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>Manage your personal information</p>
            </div>

            {msg.text && <div className={`alert alert-${msg.type==='success'?'success':'error'}`} style={{ marginBottom:16 }}>{msg.text}</div>}

            <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:24 }}>
                {/* Avatar panel */}
                <div className="widget-card" style={{ marginBottom:0, textAlign:'center' }}>
                    <div className="avatar avatar-xl" style={{ background:'var(--primary)', color:'black', margin:'0 auto 16px' }}>{user?.name?.[0]||'U'}</div>
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{user?.name}</div>
                    <span className="badge" style={{ background:user?.role==='Admin'?'rgba(252,165,165,0.2)':user?.role==='Teacher'?'rgba(167,216,222,0.2)':'rgba(218,255,150,0.2)', color:user?.role==='Admin'?'#FCA5A5':user?.role==='Teacher'?'#A7D8DE':'#DAFF96' }}>{user?.role}</span>
                    <div style={{ marginTop:14, fontSize:12, color:'var(--text-muted)' }}>{user?.email}</div>
                    {user?.student_id && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>ID: {user.student_id}</div>}
                    {user?.teacher_id && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>ID: {user.teacher_id}</div>}
                </div>

                {/* Form */}
                <div className="widget-card" style={{ marginBottom:0 }}>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+92 300 0000000"/></div>
                    </div>
                    {user?.role !== 'Student' && (
                        <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/></div>
                    )}
                    {user?.role === 'Student' && (
                        <div className="form-group"><label className="form-label">Major</label><input className="form-input" value={form.major} onChange={e=>setForm({...form,major:e.target.value})}/></div>
                    )}
                    <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="A little about yourself…"/></div>
                    <button className="btn btn-primary" onClick={save} disabled={saving}>
                        {saving?<><div className="spinner"/>Saving…</>:<><MdSave size={16}/>Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
