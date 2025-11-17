import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Event, User, Comment } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { Users, LogOut, Send, Trash2, Shield, MoreVertical, Pin, X, Mic, MicOff, PhoneOff } from 'lucide-react';
import { formatTimeAgo } from '../utils/time';

interface EventRoomProps {
    event: Event;
    currentUser: User;
    allUsers: User[];
    onLeave: () => void;
    onEndEvent: (eventId: number) => void;
    onAddComment: (eventId: number, text: string) => void;
    onDeleteComment: (eventId: number, commentId: number) => void;
    onPinComment: (eventId: number, commentId: number | null) => void;
    onToggleModerator: (eventId: number, userId: string) => void;
    onToggleMuteSpeaker: (eventId: number, speakerId: string) => void;
}

const UserOptionsMenu: React.FC<{
    user: User;
    isModerator: boolean;
    onToggleModerator: () => void;
    onClose: () => void;
}> = ({ user, isModerator, onToggleModerator, onClose }) => {
    const { t } = useTranslation();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-100 dark:border-slate-600 z-20"
        >
            <button onClick={onToggleModerator} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600">
                <Shield size={16} />
                <span>{isModerator ? t('eventRoom.moderation.removeMod') : t('eventRoom.moderation.makeMod')}</span>
            </button>
        </motion.div>
    );
};

export const EventRoom: React.FC<EventRoomProps> = ({ event, currentUser, allUsers, onLeave, onEndEvent, onAddComment, onDeleteComment, onPinComment, onToggleModerator, onToggleMuteSpeaker }) => {
    const { t } = useTranslation();
    const isCreator = event.creatorId === currentUser.id;
    const isModerator = (event.moderators || []).includes(currentUser.id);
    const canModerate = isCreator || isModerator;

    const [commentText, setCommentText] = useState('');
    const [activeUserMenu, setActiveUserMenu] = useState<string | null>(null);
    const [duration, setDuration] = useState('00:00:00');
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const seconds = Math.floor((new Date().getTime() - new Date(event.createdAt).getTime()) / 1000);
            if (seconds < 0) return;
            const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            setDuration(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(timer);
    }, [event.createdAt]);

    const speakers = useMemo(() => event.speakers.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[], [event.speakers, allUsers]);
    const moderators = useMemo(() => (event.moderators || []).map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[], [event.moderators, allUsers]);
    const listeners = useMemo(() => event.listeners.map(id => allUsers.find(u => u.id === id)).filter(u => u && !event.speakers.includes(u.id)) as User[], [event.listeners, event.speakers, allUsers]);
    const pinnedComment = useMemo(() => event.pinnedCommentId ? (event.comments || []).find(c => c.id === event.pinnedCommentId) : null, [event.pinnedCommentId, event.comments]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [event.comments]);

    const handleEndEvent = () => {
        if (confirm(t('eventRoom.endConfirmation.message'))) {
            onEndEvent(event.id);
            onLeave();
        }
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            onAddComment(event.id, commentText);
            setCommentText('');
        }
    };

    const getUser = (userId: string) => allUsers.find(u => u.id === userId);

    const UserListItem: React.FC<{ user: User; role: 'speaker' | 'moderator' | 'listener' }> = ({ user, role }) => {
        const userIsMuted = useMemo(() => (event.mutedSpeakers || []).includes(user.id), [event.mutedSpeakers, user.id]);
        return (
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">{user.avatar}</div>
                        {role === 'moderator' && <Shield size={12} className="absolute -bottom-1 -right-1 text-white bg-blue-500 rounded-full p-0.5" />}
                    </div>
                    <span className="font-semibold text-sm">{user.name}</span>
                    {role === 'speaker' && user.id !== currentUser.id && userIsMuted && <MicOff size={14} className="text-brand-500" />}
                </div>

                {role === 'speaker' && user.id === currentUser.id && (
                    <button
                        onClick={() => onToggleMuteSpeaker(event.id, currentUser.id)}
                        title={userIsMuted ? t('eventRoom.unmute') : t('eventRoom.mute')}
                        className={`p-2 rounded-full text-white shadow-sm transform hover:scale-105 transition-all ${userIsMuted ? 'bg-brand-600 hover:bg-brand-700' : 'bg-brand-600 hover:bg-brand-700'}`}
                    >
                        {userIsMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                )}

                {isCreator && user.id !== currentUser.id && (
                    <div className="relative">
                        <button onClick={() => setActiveUserMenu(user.id === activeUserMenu ? null : user.id)} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600">
                            <MoreVertical size={16} />
                        </button>
                        <AnimatePresence>
                            {activeUserMenu === user.id && (
                                <UserOptionsMenu
                                    user={user}
                                    isModerator={(event.moderators || []).includes(user.id)}
                                    onToggleModerator={() => onToggleModerator(event.id, user.id)}
                                    onClose={() => setActiveUserMenu(null)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 flex flex-col h-full"
        >
            <header className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex items-start gap-4">
                    {event.coverImage && (
                        <img src={event.coverImage} alt={event.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-slate-100 dark:bg-slate-700" />
                    )}
                    <div className="flex-grow">
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 text-xs font-bold text-red-100 bg-brand-600 rounded-full">{t('events.live')}</span>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 font-mono">{duration}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-2">{event.title}</h2>
                        {event.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{event.description}</p>}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <main className="flex-1 flex flex-col p-4 order-2 md:order-1 min-h-0">
                    {pinnedComment && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 rounded-r-lg flex-shrink-0">
                            <div className="flex justify-between items-center text-xs font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                                <span><Pin size={12} className="inline-block mr-1"/>{t('eventRoom.chat.pinned')}</span>
                                {canModerate && (
                                    <button onClick={() => onPinComment(event.id, null)} className="p-1 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/50"><X size={12} /></button>
                                )}
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="h-6 w-6 rounded-full bg-white border border-brand-500 flex items-center justify-center text-brand-600 font-bold text-[10px] flex-shrink-0">{getUser(pinnedComment.userId)?.avatar}</div>
                                <div>
                                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 mr-2">{getUser(pinnedComment.userId)?.name}</span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 inline">{pinnedComment.text}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar pr-2">
                        {(event.comments || []).map(comment => {
                            const author = getUser(comment.userId);
                            if (!author) return null;
                            const isAuthorModerator = (event.moderators || []).includes(author.id);
                            return (
                                <div key={comment.id} className="group flex items-start gap-3">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-lg flex-shrink-0">{author.avatar}</div>
                                        {isAuthorModerator && <Shield size={14} className="absolute -bottom-1 -right-1 text-white bg-blue-500 rounded-full p-0.5" />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-semibold text-sm">{author.name}</span>
                                            <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt, t)}</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                                    </div>
                                    {canModerate && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-slate-700 rounded-full shadow-sm border dark:border-slate-600">
                                            <button title={t('eventRoom.moderation.pin')} onClick={() => onPinComment(event.id, comment.id)} className="p-1.5 text-gray-500 hover:text-blue-500"><Pin size={14} /></button>
                                            <button title={t('eventRoom.moderation.delete')} onClick={() => onDeleteComment(event.id, comment.id)} className="p-1.5 text-gray-500 hover:text-brand-500"><Trash2 size={14} /></button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div ref={commentsEndRef}></div>
                    </div>
                    
                    <footer className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex-shrink-0">
                        <form onSubmit={handleAddComment} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={t('eventRoom.chat.placeholder')}
                                className="flex-grow border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-brand-400 dark:focus:ring-brand-500 transition-shadow"
                            />
                            <button type="submit" className="p-3 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors disabled:bg-brand-400"><Send size={18} /></button>
                        </form>
                    </footer>
                </main>
                <aside className="w-full md:w-64 p-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-700 order-1 md:order-2 flex flex-col gap-4">
                    <div className="flex-shrink-0">
                        {isCreator ? (
                            <button onClick={handleEndEvent} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white font-semibold rounded-lg text-sm shadow-sm hover:bg-brand-700 transition-colors"><PhoneOff size={16} />{t('eventRoom.end')}</button>
                        ) : (
                            <button onClick={onLeave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-600 font-semibold rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"><LogOut size={16} />{t('eventRoom.leave')}</button>
                        )}
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar min-h-0">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-800 py-2">
                            <Users size={20} />{t('eventRoom.participants')} ({event.listeners.length + event.speakers.length})
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="font-semibold text-brand-700 dark:text-brand-400 text-sm mb-1">{t('events.speakers')} ({speakers.length})</p>
                                {speakers.map(s => <UserListItem key={s.id} user={s} role="speaker" />)}
                            </div>
                             {moderators.length > 0 && (
                                <div>
                                    <p className="font-semibold text-blue-700 dark:text-blue-400 text-sm mb-1">{t('eventRoom.moderators')} ({moderators.length})</p>
                                    {moderators.map(m => <UserListItem key={m.id} user={m} role="moderator" />)}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-600 dark:text-gray-300 text-sm mb-1">{t('events.listeners')} ({listeners.length})</p>
                                {listeners.map(l => <UserListItem key={l.id} user={l} role="listener" />)}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </motion.div>
    );
};