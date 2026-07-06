import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../utils/api';
import { UploadCloud, Image as ImageIcon, FileText, Trash2, Download } from 'lucide-react';

const FileGallery = ({ projectId, user, readOnly = false }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fetchFiles = async () => {
        try {
            const data = await apiFetch(`/project-files/?project=${projectId}`);
            let projectFiles = data;
            if (Array.isArray(data)) {
                projectFiles = data.filter(f => f.project === projectId);
            } else {
                projectFiles = [];
            }
            setFiles(projectFiles);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (projectId) {
            fetchFiles();
        }
    }, [projectId]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('project', projectId);
        formData.append('uploader', user?.user_id || 1);
        formData.append('file_type', file.type.startsWith('image/') ? 'Image' : 'Document');
        formData.append('category', 'General');
        formData.append('file', file);

        try {
            const token = sessionStorage.getItem('access_token');
            const res = await fetch('http://localhost:8000/api/project-files/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (res.ok) {
                fetchFiles();
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this file?')) {
            await apiFetch(`/project-files/${id}/`, { method: 'DELETE' });
            fetchFiles();
        }
    };

    if (loading) return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading files...</div>;

    return (
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', margin: 0 }}>Files & Assets</h3>
                {!readOnly && (
                    <>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                        <button onClick={handleUploadClick} disabled={uploading} className="btn primary-btn" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                            <UploadCloud size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
                        </button>
                    </>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {files.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        No files uploaded for this project yet.
                    </div>
                ) : (
                    files.map(file => (
                        <div key={file.id} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                                {file.file_type === 'Image' && file.file ? (
                                    <img src={file.file} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <FileText size={48} style={{ color: 'var(--text-muted)' }} />
                                )}
                            </div>
                            <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {file.file ? file.file.split('/').pop() : 'Unknown file'}
                                    </span>
                                    {(!readOnly && (user?.role === 'admin' || user?.role === 'pm' || user?.username === file.uploader_name)) && (
                                        <button onClick={() => handleDelete(file.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '2px' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Uploaded by {file.uploader_name || 'System'}</span>
                                <a href={file.file} target="_blank" rel="noopener noreferrer" className="btn outline-btn" style={{ marginTop: 'auto', padding: '0.3rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '0.3rem', alignItems: 'center' }}>
                                    <Download size={14} /> Download
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FileGallery;
