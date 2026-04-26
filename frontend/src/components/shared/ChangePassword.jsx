import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdLock, MdSave } from 'react-icons/md';

const ChangePassword = () => {
    const { api } = useContext(AuthContext);
    const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text:'', type:'' });

    const save = async () => {
        if (!form.currentPassword || !form.newPassword) return setMsg({ text:'All fields required', type:'error' });
        if (form.newPassword !== form.confirmPassword) return setMsg({ text:'New passwords do not match', type:'error' });
        if (form.newPassword.length < 6) return setMsg({ text:'Password must be at least 6 characters', type:'error' });
        setSaving(true);
        try {
            await api.post('/api/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
            setMsg({ text:'Password changed successfully!', type:'success' });
            setForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
        } catch (e) { setMsg({ text: e.response?.data?.message || 'Failed to change password', type:'error' }); }
        finally { setSaving(false); }
    };

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom:24 }}>
                <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Change Password</h1>
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>Keep your account secure with a strong password</p>
            </div>

            {msg.text && <div className={`alert alert-${msg.type==='success'?'success':'error'}`} style={{ marginBottom:16 }}>{msg.text}</div>}

            <div className="widget-card" style={{ maxWidth:480 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <div style={{ width:40, height:40, borderRadius:'var(--r-md)', background:'rgba(218,255,150,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}><MdLock size={20} color="var(--primary)"/></div>
                    <div>
                        <div style={{ fontWeight:700, fontSize:14 }}>Update Password</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)' }}>Minimum 6 characters</div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-input" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})} placeholder="••••••••"/>
                </div>
                <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})} placeholder="••••••••"/>
                </div>
                <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} placeholder="••••••••"/>
                </div>

                {form.newPassword && (
                    <div style={{ marginBottom:16 }}>
                        <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>Password strength</div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: form.newPassword.length < 6?'25%':form.newPassword.length<10?'60%':'100%', background: form.newPassword.length<6?'var(--danger)':form.newPassword.length<10?'#FFE5C6':'var(--success)' }}/>
                        </div>
                    </div>
                )}

                <button className="btn btn-primary" onClick={save} disabled={saving}>
                    {saving?<><div className="spinner"/>Saving…</>:<><MdSave size={16}/>Change Password</>}
                </button>
            </div>
        </div>
    );
};

export default ChangePassword;
