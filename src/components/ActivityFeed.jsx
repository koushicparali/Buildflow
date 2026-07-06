import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { MessageSquare, Send, User } from 'lucide-react';

const ActivityFeed = ({ projectId, user }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = async () => {
        if (!projectId) return;
        try {
            const data = await apiFetch(`/comments/?project=${projectId}`);
            if (!data.error) {
                // Assuming data is an array of comments or { results: [...] }
                const commentsList = Array.isArray(data) ? data : data.results || [];
                // Sort by created_at desc (newest first)
                commentsList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setComments(commentsList);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchComments();
        // Optional: Implement simple polling for real-time feel if needed
        const interval = setInterval(fetchComments, 10000);
        return () => clearInterval(interval);
    }, [projectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await apiFetch('/comments/', {
                method: 'POST',
                body: JSON.stringify({
                    project: projectId,
                    author: user?.user_id,
                    text: newComment.trim()
                })
            });
            if (!res.error) {
                setNewComment('');
                fetchComments(); // Refresh immediately
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
        setSubmitting(false);
    };

    if (loading) return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading activity...</div>;

    return (
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <MessageSquare size={20} color="var(--primary)" />
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', margin: 0 }}>Activity & Comments</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
                {comments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        No activity yet. Be the first to start the conversation!
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} style={{ display: 'flex', gap: '1rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                                {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : <User size={18} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{comment.author_name || 'System'}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(comment.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                    {comment.text}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your update or comment..."
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                    disabled={submitting}
                />
                <button type="submit" disabled={!newComment.trim() || submitting} className="btn primary-btn" style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ActivityFeed;
