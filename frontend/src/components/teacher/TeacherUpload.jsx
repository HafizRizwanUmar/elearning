import React from 'react';
import { Link } from 'react-router-dom';
import { MdUpload } from 'react-icons/md';

const TeacherUpload = () => (
    <div className="page-content animate-fade">
        <div style={{ marginBottom:24 }}>
            <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Upload Materials</h1>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>Share course materials with your students</p>
        </div>
        <div className="empty-state" style={{ padding:80 }}>
            <div className="empty-icon" style={{ width:64, height:64 }}><MdUpload size={32} color="var(--text-muted)"/></div>
            <div className="empty-title">File Upload</div>
            <div className="empty-body">File upload functionality requires server-side storage configuration. Please contact your administrator.</div>
        </div>
    </div>
);

export default TeacherUpload;
