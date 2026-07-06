import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { usePolling } from '../hooks/usePolling';

// Note: standard apiFetch handles JSON. For files, we'll need a custom fetch or to omit Content-Type.
const uploadFile = async (endpoint, formData) => {
    const token = sessionStorage.getItem('access_token');
    const response = await fetch(`http://localhost:8000/api${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Upload failed: ${response.status}`);
    }
    return response.json();
};

const getFiles = async (endpoint) => {
    const token = sessionStorage.getItem('access_token');
    const response = await fetch(`http://localhost:8000/api${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Failed to fetch files");
    return response.json();
};

const ProjectFilesPanel = ({ projectId }) => {
    const { addToast } = useToast();
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const fetchFiles = async () => {
        try {
            const allFiles = await getFiles('/project-files/');
            setFiles(allFiles.filter(f => f.project === parseInt(projectId)));
        } catch (e) {
            console.error("Error fetching files:", e);
        }
    };

    usePolling(fetchFiles, 10000);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('project', projectId);
        formData.append('category', 'General');
        formData.append('file_type', file.type.startsWith('image/') ? 'Image' : 'Document');
        
        const user = JSON.parse(sessionStorage.getItem('user_info') || '{}');
        if (user.id) formData.append('uploader', user.id);

        setIsUploading(true);
        addToast('Uploading file...', 'info');
        try {
            await uploadFile('/project-files/', formData);
            addToast('File uploaded successfully!', 'success');
            fetchFiles();
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setIsUploading(false);
            e.target.value = null; // reset input
        }
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>File Center</h2>
                <div>
                    <input 
                        type="file" 
                        id="fileUpload" 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange} 
                        disabled={isUploading}
                    />
                    <label htmlFor="fileUpload" className="btn primary-btn" style={{ cursor: 'pointer', display: 'inline-block' }}>
                        {isUploading ? 'Uploading...' : '+ Upload File'}
                    </label>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {files.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No files uploaded yet.</p>
                ) : (
                    files.map(f => (
                        <div key={f.id} className="task-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
                                    {f.file ? f.file.split('/').pop() : 'Unnamed File'}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Type: {f.file_type}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date: {new Date(f.upload_date).toLocaleDateString()}</p>
                            </div>
                            {f.file && (
                                <a href={f.file.startsWith('http') ? f.file : `http://localhost:8000${f.file}`} target="_blank" rel="noreferrer" className="btn outline-btn" style={{ marginTop: '1rem', textAlign: 'center', textDecoration: 'none' }}>
                                    Download
                                </a>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectFilesPanel;
