
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, User } from '../types';
import { REACTION_EMOJIS, ACTIVITY_CONFIG } from '../constants';
import { formatTimeAgo, getExpiryHours } from '../utils/time';
import { Clock, MessageCircle, Send, HelpCircle, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight, Star, Play, Pause, Maximize } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface PostCardProps {
  post: Post;
  users: User[];
  currentUserId: string;
  onReact: (postId: number, emoji: string) => void;
  onReply?: (postId: number, replyText: string) => void;
  onComment?: (postId: number, commentText: string) => void;
  onViewProfile: (userId: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
  isFavorited: boolean;
  onToggleFavorite: (postId: number) => void;
  onViewMedia: (media: Post['media'], startIndex: number) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const PostOptionsMenu: React.FC<{
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
  onClose: () => void;
}> = ({ post, onEdit, onDelete, onClose }) => {
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
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-100 dark:border-slate-600 z-20 overflow-hidden"
    >
      <button
        onClick={() => { onEdit(post); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Edit size={16} />
        <span>{t('post.options.edit')}</span>
      </button>
      <button
        onClick={() => { onDelete(post.id); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
      >
        <Trash2 size={16} />
        <span>{t('post.options.delete')}</span>
      </button>
    </motion.div>
  );
};

const ReplySection: React.FC<{ 
    post: Post, 
    onReply: NonNullable<PostCardProps['onReply']>, 
    users: User[], 
    onViewProfile: (userId: string) => void,
    showReplyInput: boolean,
    onClose: () => void,
    currentUserId: string,
}> = ({ post, onReply, users, onViewProfile, showReplyInput, onClose, currentUserId }) => {
    const { t } = useTranslation();
    const [replyText, setReplyText] = useState('');
    const currentUser = users.find(u => u.id === currentUserId);

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyText.trim()) {
            onReply(post.id, replyText);
            setReplyText('');
            onClose();
        }
    }

    // Always show section if there are replies, regardless of input state
    if (!showReplyInput && (!post.replies || post.replies.length === 0)) return null;

    return (
        <div className="px-5 pt-3 pb-4">
             {post.replies && post.replies.length > 0 && (
                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {post.replies.map((reply, index) => {
                        const user = users.find(u => u.id === reply.userId);
                        // Fallback if user not loaded yet
                        const userName = user ? (user.id === currentUserId ? t('post.user.you') : user.name) : 'User';
                        const userAvatar = user ? user.avatar : '?';

                        return (
                            <div key={index} className="flex items-start gap-2">
                                <button onClick={() => user && onViewProfile(user.id)} className="h-7 w-7 mt-0.5 rounded-full bg-white border border-brand-600 flex items-center justify-center text-brand-600 font-bold text-xs flex-shrink-0">
                                    {userAvatar}
                                </button>
                                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-r-xl rounded-bl-xl p-2 text-sm">
                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-xs block mb-0.5">@{userName}</span>
                                    <p className="text-gray-700 dark:text-gray-300">{reply.text}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
             )}
            <AnimatePresence>
            {showReplyInput && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700"
                >
                    <div className="h-8 w-8 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-xs flex-shrink-0">
                        {currentUser?.avatar || '?'}
                    </div>
                    <form onSubmit={handleReplySubmit} className="flex-grow flex items-center gap-2">
                        <input 
                            type="text"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder={t('post.reply.placeholder')}
                            className="flex-grow bg-gray-100 dark:bg-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-200"
                            autoFocus
                        />
                        <button type="submit" className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" disabled={!replyText.trim()}>
                            <Send size={16} />
                        </button>
                    </form>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    )
}

export const PostCard: React.FC<PostCardProps> = ({ post, users, currentUserId, onReact, onReply, onComment, onViewProfile, onEdit, onDelete, isFavorited, onToggleFavorite, onViewMedia }) => {
  const { t } = useTranslation();
  
  // Handle anonymous posts
  const postUser = post.userId === 'anonymous' 
      ? { id: 'anonymous', name: t('post.user.anonymous'), avatar: '?', following: [], followers: [] } as User 
      : users.find(u => u.id === post.userId);

  const [showOptions, setShowOptions] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showReply, setShowReply] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!postUser) return null;

  const activityConfig = ACTIVITY_CONFIG[post.activity];
  const userName = post.userId === 'anonymous' ? t('post.user.anonymous') : (post.userId === currentUserId ? t('post.user.you') : postUser.name);
  const expiryHours = getExpiryHours(post.createdAt);
  const commentsCount = post.comments ? post.comments.length : 0;

  const aspectRatioClass = post.aspectRatio === 'portrait' ? 'aspect-[9/16]' : 'aspect-video';
  
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleMediaNav = (e: React.MouseEvent, direction: 'next' | 'prev') => {
      e.stopPropagation();
      const newIndex = direction === 'next'
          ? (currentMediaIndex + 1) % post.media.length
          : (currentMediaIndex - 1 + post.media.length) % post.media.length;
      setCurrentMediaIndex(newIndex);
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(commentText.trim() && onComment) {
          onComment(post.id, commentText);
          setCommentText('');
      }
  };
  
  const hasMultipleMedia = post.media && post.media.length > 1;

  return (
    <motion.div id={`post-${post.id}`} variants={cardVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Post Header */}
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => post.userId !== 'anonymous' && onViewProfile(postUser.id)} 
            className={`h-12 w-12 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-xl flex-shrink-0 ${post.userId === 'anonymous' ? 'cursor-default' : ''}`}
          >
             {post.postType === 'ask' ? <HelpCircle size={24} /> : postUser.avatar}
          </button>
          <div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => post.userId !== 'anonymous' && onViewProfile(postUser.id)} 
                    className={`font-bold text-gray-800 dark:text-gray-100 ${post.userId === 'anonymous' ? 'cursor-default' : ''}`}
                >
                    @{userName}
                </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <activityConfig.icon size={12} />
              <span>{t(`activity.${post.activity}` as any)}</span>
              <span className="mx-1">&middot;</span>
              <span>{formatTimeAgo(post.createdAt, t)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
           {post.userId === currentUserId && (
              <button onClick={() => onToggleFavorite(post.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                <Star size={20} className={`transition-colors ${isFavorited ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              </button>
            )}
           {post.userId === currentUserId && post.postType === 'status' && (
             <div className="relative">
                <button onClick={() => setShowOptions(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                  <MoreVertical size={20} className="text-gray-500" />
                </button>
                <AnimatePresence>
                  {showOptions && <PostOptionsMenu post={post} onEdit={onEdit} onDelete={onDelete} onClose={() => setShowOptions(false)} />}
                </AnimatePresence>
            </div>
           )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-5 pb-3">
        <p className="text-gray-700 dark:text-gray-300">{post.text}</p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 ? (
        <div 
            className={`relative w-full overflow-hidden bg-slate-50 dark:bg-slate-900/50 group ${aspectRatioClass} p-3`}
            onClick={() => onViewMedia(post.media, currentMediaIndex)}
        >
            <AnimatePresence initial={false}>
                <motion.div
                    key={currentMediaIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="absolute inset-3 cursor-pointer"
                >
                    {post.media[currentMediaIndex].type === 'image' ? (
                        <img src={post.media[currentMediaIndex].url} alt="Post media" className="w-full h-full object-cover rounded-lg shadow-sm"/>
                    ) : (
                        <video ref={videoRef} src={post.media[currentMediaIndex].url} onClick={togglePlay} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} loop muted className="w-full h-full object-cover rounded-lg shadow-sm"/>
                    )}
                </motion.div>
            </AnimatePresence>

            {post.media[currentMediaIndex].type === 'video' && (
                <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {isPlaying ? <Pause size={48}/> : <Play size={48}/>}
                </button>
            )}
            
            {hasMultipleMedia && (
                <>
                    <button onClick={(e) => handleMediaNav(e, 'prev')} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-opacity opacity-0 group-hover:opacity-100 z-10"><ChevronLeft size={20}/></button>
                    <button onClick={(e) => handleMediaNav(e, 'next')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-opacity opacity-0 group-hover:opacity-100 z-10"><ChevronRight size={20}/></button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {post.media.map((_, i) => <div key={i} className={`h-1.5 w-1.5 rounded-full transition-colors shadow-sm ${i === currentMediaIndex ? 'bg-white' : 'bg-white/50'}`}/>)}
                    </div>
                </>
            )}

             <button
                onClick={(e) => {
                    e.stopPropagation();
                    onViewMedia(post.media, currentMediaIndex);
                }}
                className="absolute bottom-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-opacity opacity-0 group-hover:opacity-100 z-10"
                aria-label={t('post.media.viewFull')}
             >
                <Maximize size={18} />
             </button>
        </div>
      ) : post.backgroundColor && (
        <div className={`w-full h-64 flex items-center justify-center p-8 ${post.backgroundColor}`}>
            <p className="text-2xl font-bold text-center text-white drop-shadow-lg">{post.text}</p>
        </div>
      )}

      {/* Expiry and Reactions */}
      <div className="px-5 pt-4 pb-1">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{t('post.vanishesIn')} {expiryHours}h</span>
          </div>
          <div className="flex items-center gap-3">
            {commentsCount > 0 && (
                <span className="cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>{commentsCount} {t('post.comments')}</span>
            )}
            {Object.keys(post.reactions).length > 0 && (
                <div className="flex items-center gap-1">
                    {Object.entries(post.reactions).slice(0, 3).map(([userId, emoji]) => (
                        <span key={userId} className="text-base">{emoji}</span>
                    ))}
                    <span>{Object.keys(post.reactions).length}</span>
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="px-5 py-2 flex items-center justify-between border-t border-gray-100 dark:border-slate-700/50 mt-2">
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                {REACTION_EMOJIS.map(emoji => (
                    <button 
                        key={emoji}
                        onClick={() => onReact(post.id, emoji)}
                        className={`px-3 py-2 text-xl rounded-full transition-all transform hover:scale-125 ${post.reactions[currentUserId] === emoji ? 'bg-brand-100 dark:bg-slate-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
             {post.postType === 'status' && onComment && (
                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`p-2 rounded-full transition-colors ${showComments ? 'bg-brand-100 text-brand-600 dark:bg-slate-700 dark:text-brand-400' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400'}`}
                    title={showComments ? t('post.comments.hide') : t('post.comments.show')}
                >
                    <MessageCircle size={22} />
                </button>
             )}
        </div>
        
        {post.postType === 'ask' && onReply && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
              <MessageCircle size={16} />
              <span>{t('post.reply.button')} ({post.replies?.length || 0})</span>
            </button>
        )}
      </div>

      {/* Comments Section (Status) */}
      <AnimatePresence>
          {showComments && post.postType === 'status' && onComment && (
              <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700"
              >
                  <div className="p-4 space-y-3">
                       {post.comments && post.comments.map(comment => {
                           const user = users.find(u => u.id === comment.userId);
                           return (
                               <div key={comment.id} className="flex items-start gap-2.5">
                                   <button onClick={() => user && onViewProfile(user.id)} className="h-8 w-8 rounded-full bg-white border border-brand-200 flex-shrink-0 flex items-center justify-center text-brand-600 font-bold text-xs">
                                        {user ? user.avatar : '?'}
                                   </button>
                                   <div className="bg-white dark:bg-slate-700 p-2.5 rounded-2xl rounded-tl-none shadow-sm">
                                       <div className="flex items-baseline gap-2 mb-0.5">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{user ? user.name : 'Unknown'}</span>
                                            <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt, t)}</span>
                                       </div>
                                       <p className="text-sm text-gray-700 dark:text-gray-200">{comment.text}</p>
                                   </div>
                               </div>
                           )
                       })}
                  </div>
                  
                  <div className="p-4 pt-0">
                      <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={t('post.comments.placeholder')}
                            className="flex-grow bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <button type="submit" disabled={!commentText.trim()} className="p-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 disabled:opacity-50">
                              <Send size={20} />
                          </button>
                      </form>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {post.postType === 'ask' && onReply && <ReplySection post={post} onReply={onReply} users={users} onViewProfile={onViewProfile} showReplyInput={showReply} onClose={() => setShowReply(false)} currentUserId={currentUserId} />}
      
    </motion.div>
  );
};
