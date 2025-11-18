
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Post, User, Event } from '../types';
import { PostCard } from './PostCard';
import { useTranslation } from '../contexts/LanguageContext';
import { Lock, Star, Share2, Check } from 'lucide-react';
import { formatLastSeen } from '../utils/time';
import { ACTIVITY_CONFIG } from '../constants';

interface ProfileViewProps {
  posts: Post[];
  users: User[];
  profileUser: User;
  currentUser: User;
  onReact: (postId: number, emoji: string) => void;
  onReply: (postId: number, text: string) => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
  onEditProfile: () => void;
  onOpenChat: (user: User) => void;
  favoriteIds: number[];
  onToggleFavorite: (postId: number) => void;
  liveEvents: Event[];
  onJoinEvent: (eventId: number) => void;
  onUpdateUserVisibility: (userId: string, visibility: 'private' | 'public') => void;
  onViewMedia: (media: Post['media'], startIndex: number) => void;
}

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-semibold transition-colors w-full sm:w-auto ${
            isActive
                ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent'
        }`}
    >
        {label}
    </button>
)

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  posts, 
  users, 
  profileUser, 
  currentUser, 
  onReact, 
  onReply, 
  onFollow, 
  onUnfollow,
  onViewProfile,
  onEdit,
  onDelete,
  onEditProfile,
  onOpenChat,
  favoriteIds,
  onToggleFavorite,
  liveEvents,
  onJoinEvent,
  onUpdateUserVisibility,
  onViewMedia,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'stories' | 'saved'>('stories');
  const [isCopied, setIsCopied] = useState(false);
  
  const isCurrentUserProfile = profileUser.id === currentUser.id;
  const isFollowing = currentUser.following.includes(profileUser.id);
  const isMutual = isFollowing && profileUser.following.includes(currentUser.id);
  
  const canViewContent = isCurrentUserProfile || isMutual;
  const canViewSaved = isCurrentUserProfile || (profileUser.savedPostsVisibility || 'private') === 'public';


  const userPosts = useMemo(() => posts.filter(p => p.userId === profileUser.id && p.postType === 'status'), [posts, profileUser.id]);
  const userSavedPosts = useMemo(() => {
    return posts.filter(p => (profileUser.favoritePostIds || []).includes(p.id));
  }, [posts, profileUser.favoritePostIds]);

  // Display username (handle) primarily, name as secondary
  const handle = profileUser.id === 'user-you' ? t('post.user.you') : (profileUser.username || profileUser.name);
  const displayName = profileUser.name;
  
  const lastSeenText = formatLastSeen(profileUser.lastSeen, t);
  const currentProfileActivity = profileUser.currentActivity ? ACTIVITY_CONFIG[profileUser.currentActivity] : null;
  const userLiveEvent = liveEvents.find(e => e.creatorId === profileUser.id);

  const handleVisibilityChange = () => {
      const newVisibility = (profileUser.savedPostsVisibility === 'public') ? 'private' : 'public';
      onUpdateUserVisibility(profileUser.id, newVisibility);
  };
  
  const handleCopyLink = () => {
      // Construct the URL. Assuming app uses hash router logic in App.tsx
      const profileHandle = profileUser.username || profileUser.id;
      const url = `${window.location.origin}/#/@${profileHandle}`;
      navigator.clipboard.writeText(url).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      });
  };
  
  const postsToRender = activeTab === 'stories' ? userPosts : userSavedPosts;
  const isFeedEmpty = postsToRender.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 mb-6 overflow-hidden">
        <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-white border-4 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-5xl shadow-lg">
                    {profileUser.avatar}
                  </div>
                  {lastSeenText === t('time.activeNow') && <span className="absolute bottom-1 right-1 bg-green-500 h-6 w-6 rounded-full border-4 border-white dark:border-slate-800"></span>}
                </div>
                
                <div className="flex-grow w-full">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">@{handle}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                       {profileUser.name && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{displayName}</span>}
                       <span className="text-xs text-gray-500 dark:text-gray-400">&bull; {lastSeenText}</span>
                  </div>
                  
                  <div className="flex justify-center sm:justify-start items-center gap-4 text-gray-600 dark:text-gray-400 text-sm border-t border-b border-gray-100 dark:border-slate-700 py-2 mb-4">
                    <div><span className="font-bold text-lg text-gray-800 dark:text-gray-200">{userPosts.length}</span> {t('profile.tabs.stories')}</div>
                    <div className="border-l h-5 border-gray-200 dark:border-slate-600"></div>
                    <div><span className="font-bold text-lg text-gray-800 dark:text-gray-200">{profileUser.followers.length}</span> {t('profile.followers')}</div>
                    <div className="border-l h-5 border-gray-200 dark:border-slate-600"></div>
                    <div><span className="font-bold text-lg text-gray-800 dark:text-gray-200">{profileUser.following.length}</span> {t('profile.followingCount')}</div>
                  </div>

                  {/* Activity and Bio Row */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                       {currentProfileActivity && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-brand-50 dark:bg-slate-700/50 border border-brand-200 dark:border-slate-700 flex-shrink-0">
                              <span className={`flex items-center justify-center h-6 w-6 rounded-md ${currentProfileActivity.colorClasses}`}>
                                  <currentProfileActivity.icon size={14} />
                              </span>
                              <span className="text-gray-800 dark:text-gray-200">{t(`activity.${profileUser.currentActivity!}` as any)}</span>
                          </div>
                      )}
                      {profileUser.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{profileUser.bio}"</p>
                      )}
                  </div>

                  <div className="mt-6 flex justify-center sm:justify-start flex-wrap gap-3">
                    {!isCurrentUserProfile ? (
                        <>
                            {isFollowing ? (
                                <button onClick={() => onUnfollow(profileUser.id)} className="px-6 py-2 rounded-lg bg-brand-100 text-brand-800 dark:bg-slate-700 dark:text-brand-200 font-semibold hover:bg-brand-200 dark:hover:bg-slate-600 transition-colors">
                                    {t('profile.following')}
                                </button>
                            ) : (
                                <button onClick={() => onFollow(profileUser.id)} className="px-6 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors shadow-md">
                                    {t('profile.follow')}
                                </button>
                            )}
                            <button onClick={() => onOpenChat(profileUser)} className="px-6 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors shadow-md">
                                {t('profile.askMe')}
                            </button>
                        </>
                    ) : (
                      <>
                        <button onClick={onEditProfile} className="w-full sm:w-auto px-6 py-2 rounded-lg bg-brand-100 text-brand-800 dark:bg-slate-700 dark:text-brand-200 font-semibold hover:bg-brand-200 dark:hover:bg-slate-600 transition-colors">
                          {t('profile.edit.button')}
                        </button>
                        <button 
                            onClick={handleCopyLink} 
                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                        >
                            {isCopied ? <Check size={18} /> : <Share2 size={18} />}
                            <span>{isCopied ? t('profile.share.copied') : t('profile.share')}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
            </div>
        </div>

        <div className="flex border-t border-gray-200 dark:border-slate-700">
            <TabButton label={t('profile.tabs.stories')} isActive={activeTab === 'stories'} onClick={() => setActiveTab('stories')} />
            {canViewSaved && <TabButton label={t('profile.tabs.saved')} isActive={activeTab === 'saved'} onClick={() => setActiveTab('saved')} />}
        </div>
      </div>
      
      {userLiveEvent && (
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6 rounded-2xl shadow-xl mb-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <p className="font-bold text-sm tracking-wider uppercase">{t('profile.liveEvent.title')}</p>
                <h4 className="text-2xl font-bold mt-1">{userLiveEvent.title}</h4>
            </div>
            <button
                onClick={() => onJoinEvent(userLiveEvent.id)}
                className="w-full sm:w-auto flex-shrink-0 bg-white text-brand-700 px-6 py-3 rounded-lg font-bold hover:bg-brand-50 transition-all transform hover:scale-105 shadow-md"
            >
                {t('profile.liveEvent.joinButton')}
            </button>
        </div>
      )}

      <div>
        {isCurrentUserProfile && activeTab === 'saved' && (
            <div className="my-4 p-3 bg-brand-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-between text-sm">
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">{t('saved.visibility.title')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {profileUser.savedPostsVisibility === 'public'
                            ? t('saved.visibility.description.public')
                            : t('saved.visibility.description.private')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleVisibilityChange}
                    className={`relative inline-flex items-center h-6 w-11 cursor-pointer rounded-full transition-colors ${profileUser.savedPostsVisibility === 'public' ? 'bg-brand-600' : 'bg-gray-200 dark:bg-slate-600'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profileUser.savedPostsVisibility === 'public' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        )}
        
        {canViewContent ? (
          <div className="space-y-6">
            {isFeedEmpty ? (
               <div className="text-center text-gray-500 dark:text-gray-400 p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:border dark:border-slate-700">
                  {activeTab === 'saved' ? (
                      <>
                          <Star className="mx-auto h-12 w-12 text-gray-400 mb-4"/>
                          <h3 className="text-xl font-semibold mb-2">{t('saved.empty.title')}</h3>
                          <p>{t('saved.empty.description')}</p>
                      </>
                  ) : (
                      <>
                          <h3 className="text-xl font-semibold mb-2">{t('profile.feed.empty.title')}</h3>
                          <p>{t('profile.feed.empty.description')}</p>
                      </>
                  )}
                </div>
            ) : (
                postsToRender.map(p => (
                  <PostCard 
                    key={p.id} 
                    post={p} 
                    users={users}
                    currentUserId={currentUser.id}
                    onReact={onReact}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewProfile={onViewProfile}
                    isFavorited={favoriteIds.includes(p.id)}
                    onToggleFavorite={onToggleFavorite}
                    onViewMedia={onViewMedia}
                  />
                ))
            )}
          </div>
        ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:border dark:border-slate-700">
                <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4"/>
                <h3 className="text-xl font-semibold mb-2">{t('profile.locked.title')}</h3>
                <p>{t('profile.locked.description')}</p>
            </div>
        )}
      </div>

    </motion.div>
  );
};
    