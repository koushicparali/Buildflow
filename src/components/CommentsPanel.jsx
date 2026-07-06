import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { usePolling } from '../hooks/usePolling';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';

const CommentsPanel = ({ projectId }) => {
    const { addToast } = useToast();
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newText, setNewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef(null);

    const fetchComments = async () => {
        try {
            const allComments = await apiFetch('/comments/');
            setComments(allComments.filter(c => c.project === parseInt(projectId)).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        } catch (e) {
            console.error("Error fetching comments:", e);
        }
    };

    usePolling(fetchComments, 5000); // Fast poll for chat

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;

        setIsSubmitting(true);
        const user = JSON.parse(sessionStorage.getItem('user_info') || '{}');
        
        try {
            await apiFetch('/comments/', {
                method: 'POST',
                body: JSON.stringify({
                    project: projectId,
                    author: user.id || 1,
                    text: newText
                })
            });
            setNewText('');
            fetchComments();
        } catch (err) {
            addToast('Failed to post comment: ' + err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ marginTop: '2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', height: '500px' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-main)' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Project Discussion</h2>
            </div>
            
            <div ref={scrollRef} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>No messages yet. Start the conversation!</p>
                ) : (
                    comments.map(c => {
                        const isMine = c.author === (user?.user_id || user?.id || 1);
                        return (
                            <div key={c.id} style={{ 
                                alignSelf: isMine ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMine ? 'flex-end' : 'flex-start'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', padding: '0 4px' }}>
                                    {isMine ? 'You' : `User ${c.author}`} • {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div style={{ 
                                    background: isMine ? 'var(--accent)' : 'var(--bg-main)', 
                                    color: isMine ? '#fff' : 'var(--text-main)',
                                    padding: '0.8rem 1.2rem', 
                                    borderRadius: '18px', 
                                    borderBottomRightRadius: isMine ? '4px' : '18px',
                                    borderBottomLeftRadius: isMine ? '18px' : '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>{c.text}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '1rem', background: 'var(--bg-card)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '24px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                    disabled={isSubmitting}
                />
                <button type="submit" className="btn primary-btn hover-lift" style={{ borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }} disabled={isSubmitting || !newText.trim()}>
                    <Send size={20} style={{ marginLeft: '4px' }} />
                </button>
            </form>
        </div>
    );
};

export default CommentsPanel;
