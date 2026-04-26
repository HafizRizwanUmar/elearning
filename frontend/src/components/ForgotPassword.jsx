import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdEmail, MdArrowBack, MdSchool } from 'react-icons/md';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    return (
        <div className="login-page">
            <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32, justifyContent:'center' }}>
                    <div style={{ width:34, height:34, background:'var(--primary)', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', justifyContent:'center', color:'black' }}><MdSchool size={18}/></div>
                    <span style={{ fontSize:16, fontWeight:800, textTransform:'uppercase', letterSpacing:'-0.02em' }}>Classeta</span>
                </div>

                <div className="login-card animate-scale" style={{ display:'block', maxWidth:'100%', padding:'40px 36px' }}>
                    {!submitted ? (
                        <>
                            <div style={{ fontSize:11, fontWeight:600, color:'var(--primary)', letterSpacing:'0.10em', textTransform:'uppercase', marginBottom:8 }}>Account Recovery</div>
                            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6, letterSpacing:'-0.03em' }}>Reset your password</h2>
                            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:24 }}>Enter your registered email and we'll send recovery instructions.</p>

                            <div className="form-group">
                                <label className="form-label">Email address</label>
                                <div className="input-group">
                                    <span className="input-group-prefix"><MdEmail size={15}/></span>
                                    <input type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@school.edu" required/>
                                </div>
                            </div>

                            <button className="btn btn-primary w-full btn-lg" onClick={()=>email&&setSubmitted(true)}>Send Reset Instructions</button>

                            <div style={{ marginTop:20, textAlign:'center' }}>
                                <Link to="/login" style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:13, color:'var(--text-muted)' }}>
                                    <MdArrowBack size={14}/> Back to login
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign:'center' }}>
                            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(218,255,150,0.15)', border:'1px solid var(--primary-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                                <MdEmail size={28} color="var(--primary)"/>
                            </div>
                            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:8, letterSpacing:'-0.02em' }}>Check your email</h2>
                            <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7, marginBottom:24 }}>
                                If <strong style={{ color:'var(--text-secondary)' }}>{email}</strong> is registered, you'll receive password reset instructions shortly.
                            </p>
                            <Link to="/login" className="btn btn-primary w-full btn-lg"><MdArrowBack size={16}/> Back to Login</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
