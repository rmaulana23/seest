
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Page, Activity, Post, User, PrivateMessage, Event, EventMessage, Notification } from './types';
import { usePosts } from './hooks/usePosts';
import { useUsers } from './hooks/useUsers';
import { useTheme } from './hooks/useTheme';
import { usePrivateMessages } from './hooks/usePrivateMessages';
import { useEvents } from './hooks/useEvents';
import { useNotifications } from './hooks/useNotifications';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { PostCard } from './components/PostCard';
import { CreatePostForm } from './components/CreatePostForm';
import { EditPostForm } from './components/EditPostForm';
import { EditProfileForm } from './components/EditProfileForm';
import { ProfileView } from './components/ProfileView';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsConditions } from './components/TermsConditions';
import { FriendsView } from './components/FriendsView';
import { PrivateChatModal } from './components/PrivateChatModal';
import { MessagesModal } from './components/MessagesModal';
import { EventsView } from './components/EventsView';
import { CreateEventForm } from './components/CreateEventForm';
import { EventRoom } from './components/EventRoom';
import { BottomNavbar } from './components/BottomNavbar';
import { Header } from './components/Header';
import { StoryReel } from './components/StoryReel';
import { StoryViewer } from './components/StoryViewer';
import { Sun, Moon, ChevronRight, Star, Image, HelpCircle, Plus, LogOut } from 'lucide-react';
import { useTranslation } from './contexts/LanguageContext';
import { CURRENT_USER_ID } from './constants';
import { ComingSoonView } from './components/ComingSoonView';
import { MediaViewerModal } from './components/MediaViewerModal';
import { LandingPage } from './components/LandingPage';
import { supabase } from './lib/supabase';


const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 pb-24 md:pb-8"
    >
        {children}
    </motion.main>
);

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  // Data Hooks
  const { users, currentUser: loadedCurrentUser, followUser, unfollowUser, updateUserProfile, toggleFavorite, updateUserVisibility, addUser, isLoading: usersLoading } = useUsers();
  
  const [page, setPage] = useState<Page>("home");

  // Supabase Auth Listener
  useEffect(() => {
      // Check active session
      supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
              setAuthUserId(session.user.id);
              setIsAuthenticated(true);
          }
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
              setAuthUserId(session.user.id);
              setIsAuthenticated(true);
              
              // Force navigation to home on login to prevent sticking on settings/landing
              // This fixes the issue where users land on the wrong page after auth
              if (event === 'SIGNED_IN') {
                  setPage('home');
                  window.location.hash = '/status';
              }
          } else {
              setAuthUserId(null);
              setIsAuthenticated(false);
              setPage('home');
          }
      });

      return () => subscription.unsubscribe();
  }, []);

  // Derived Current User based on Auth
  const currentUser = useMemo(() => {
      if (!authUserId) return undefined;
      return users.find(u => u.id === authUserId);
  }, [users, authUserId]);

  const favoriteIds = useMemo(() => currentUser?.favoritePostIds || [], [currentUser]);
  const { posts, addPost, addReaction, addReply, addComment, deletePost, updatePost, isLoading: postsLoading } = usePosts(favoriteIds);
  const { messages, addMessage, isLoading: messagesLoading } = usePrivateMessages();
  const { events, addEvent, endEvent, joinEvent, leaveEvent, addComment: addEventComment, deleteComment: deleteEventComment, pinComment, toggleModerator, toggleMuteSpeaker, isLoading: eventsLoading } = useEvents();
  const { notifications, addNotification, markAllAsRead, hasUnread } = useNotifications();
  
  const [activityFilter, setActivityFilter] = useState<Activity | null>(null);
  const [theme, toggleTheme] = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const [viewingProfileFor, setViewingProfileFor] = useState<string | null>(null);
  const [createEntryPage, setCreateEntryPage] = useState<Page>('home');
  const [startAsAsk, setStartAsAsk] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [chattingWithUser, setChattingWithUser] = useState<User | null>(null);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [creatingEventType, setCreatingEventType] = useState<'stand-up' | 'podcast'>('stand-up');
  const [viewingStoryForUserIndex, setViewingStoryForUserIndex] = useState<number | null>(null);
  const [mediaViewerState, setMediaViewerState] = useState<{ media: Post['media']; startIndex: number } | null>(null);
  const [highlightedPostId, setHighlightedPostId] = useState<number | null>(null);

  const liveEvents = useMemo(() => events.filter(e => e.status === 'live'), [events]);
  const currentActiveEvent = useMemo(() => activeEventId ? events.find(e => e.id === activeEventId) : null, [activeEventId, events]);

  const isLoading = postsLoading || usersLoading || messagesLoading || eventsLoading;

  // Scroll to highlighted post when it exists and page matches
  useEffect(() => {
      if (highlightedPostId) {
          // Give a small delay for the DOM to render
          const timer = setTimeout(() => {
              const element = document.getElementById(`post-${highlightedPostId}`);
              if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Optional: Add a visual highlight effect here via class manipulation
                  element.classList.add('ring-2', 'ring-brand-500', 'ring-offset-2', 'dark:ring-offset-slate-900');
                  setTimeout(() => {
                      element.classList.remove('ring-2', 'ring-brand-500', 'ring-offset-2', 'dark:ring-offset-slate-900');
                  }, 2000);
              }
              setHighlightedPostId(null);
          }, 500);
          return () => clearTimeout(timer);
      }
  }, [highlightedPostId, page]);

  // --- Auth Handlers (Supabase) ---

  const handleLogin = async (email: string, pass: string) => {
      return await supabase.auth.signInWithPassword({ email, password: pass });
  };

  const handleRegister = async (name: string, email: string, password: string) => {
      return await supabase.auth.signUp({ 
          email, 
          password,
          options: {
              data: {
                  name: name,
                  avatar: name.charAt(0).toUpperCase()
              }
          }
      });
  };

  const handleResetPassword = async (email: string) => {
      return await supabase.auth.resetPasswordForEmail(email);
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
  };

  // --- App Logic ---

  const handleToggleFavorite = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if(currentUser && post && post.userId === currentUser.id) {
        toggleFavorite(currentUser.id, postId);
    }
  };

  const handleNavigateToCreate = (options: { asAsk: boolean, from: Page }) => {
    setStartAsAsk(options.asAsk);
    setCreateEntryPage(options.from);
    navigateTo('create');
  };

  const navigateTo = useCallback((page: Page, options: { userId?: string, eventId?: number } = {}) => {
      switch (page) {
          case 'home':
              window.location.hash = '/status';
              break;
          case 'profile':
              if (options.userId) {
                  const user = users.find(u => u.id === options.userId);
                  if (user) {
                      // Use username for routing instead of name
                      const profileHandle = user.id === currentUser?.id ? 'kamu' : (user.username || user.id);
                      window.location.hash = `/@${profileHandle}`;
                  }
              }
              break;
          case 'privacy':
              window.location.hash = '/settings/privacy';
              break;
          case 'terms':
              window.location.hash = '/settings/terms';
              break;
          case 'friends':
              window.location.hash = '/friends';
              break;
          case 'events':
              window.location.hash = '/events';
              break;
          case 'create-event':
              window.location.hash = '/events/create';
              break;
          case 'event-room':
              if (options.eventId) {
                  window.location.hash = `/events/${options.eventId}`;
              }
              break;
          default:
              window.location.hash = `/${page}`;
      }
  }, [users, currentUser]);

  const parseHashAndNavigate = useCallback(() => {
      if (users.length === 0) return;

      const hash = window.location.hash.substring(1);
      
       const eventRoomMatch = hash.match(/^\/events\/(\d+)$/);
      if (eventRoomMatch) {
          const eventId = parseInt(eventRoomMatch[1], 10);
          const eventExists = events.find(e => e.id === eventId);
          if (eventExists) {
              setActiveEventId(eventId);
              setPage('event-room');
          } else if (!eventsLoading) {
              navigateTo('events');
          }
          return;
      }

      if (hash.startsWith('/@')) {
          const handle = hash.substring(2);
          // Check by username specifically
          const user = users.find(u => {
              if (u.id === currentUser?.id && handle === 'kamu') return true;
              return u.username && u.username.toLowerCase() === handle.toLowerCase();
          });

          if (user) {
              setViewingProfileFor(user.id);
              setPage('profile');
          } else {
              navigateTo('home');
          }
          return;
      }

      switch (hash) {
          case '/status':
          case '':
              setPage('home');
              if (hash === '') window.location.hash = '/status';
              break;
          case '/create':
              setPage('create');
              break;
          case '/ask':
              setPage('ask');
              break;
          case '/friends':
              setPage('friends');
              break;
          case '/events':
              setPage('events');
              break;
          case '/events/create':
              setPage('create-event');
              break;
          case '/settings':
              setPage('settings');
              break;
          case '/settings/privacy':
              setPage('privacy');
              break;
          case '/settings/terms':
              setPage('terms');
              break;
          default:
              navigateTo('home');
      }
  }, [users, navigateTo, events, eventsLoading, currentUser]);

  useEffect(() => {
      if (!usersLoading && isAuthenticated) {
          parseHashAndNavigate();
          window.addEventListener('hashchange', parseHashAndNavigate);
      }
      return () => {
          window.removeEventListener('hashchange', parseHashAndNavigate);
      };
  }, [usersLoading, parseHashAndNavigate, isAuthenticated]);

  const mutuals = useMemo(() => {
    if (!currentUser) return [];
    return currentUser.following.filter(followedId => {
        const followedUser = users.find(u => u.id === followedId);
        return followedUser?.following.includes(currentUser.id);
    });
  }, [currentUser, users]);
  
  const statusPosts = useMemo(() => {
    if (!currentUser) return [];
    const idsToShow = [currentUser.id, ...mutuals];
    // Filter posts. Note: Supabase posts will be implemented later, for now usePosts is still local
    const allStatusPosts = posts.filter(p => p.postType === 'status' && idsToShow.includes(p.userId));
    
    if (!activityFilter) return allStatusPosts;
    return allStatusPosts.filter(post => post.activity === activityFilter);
  }, [posts, activityFilter, currentUser, mutuals]);

  const askPosts = useMemo(() => posts.filter(p => p.postType === 'ask'), [posts]);
  
  const usersWithStories = useMemo(() => {
    if (!currentUser) return [];
    const userIds = [...new Set(statusPosts.map(p => p.userId))];
    const storyUsers = userIds.map(id => users.find(u => u.id === id)).filter((u): u is User => !!u);
    
    // FILTER: Only show stories from friends/mutuals, NOT the current user
    const friendStories = storyUsers.filter(u => u.id !== currentUser.id);

    friendStories.sort((a, b) => {
        // Simple sort by name for now since date sorting logic was complex here
        return a.name.localeCompare(b.name);
    });
    return friendStories;
  }, [statusPosts, users, currentUser]);

  const conversationMessages = useMemo(() => {
    if (!chattingWithUser || !currentUser) return [];
    return messages.filter(
      msg =>
        (msg.senderId === currentUser.id && msg.receiverId === chattingWithUser.id) ||
        (msg.senderId === chattingWithUser.id && msg.receiverId === currentUser.id)
    );
  }, [messages, chattingWithUser, currentUser]);

  const handleAddPost = (postData: { text: string; activity: Activity; media: { url: string, type: 'image' | 'video' }[]; backgroundColor: string | null; postType: 'status' | 'ask'; aspectRatio?: 'portrait' | 'landscape' }) => {
    if (currentUser) {
      addPost(currentUser.id, postData);
      navigateTo(postData.postType === 'ask' ? 'ask' : 'home');
      setActivityFilter(null);
    }
  };
  
  const handleFilterActivity = (activity: Activity | null) => {
    setActivityFilter(activity);
    if (page !== 'home') {
        navigateTo('home');
    }
  }

  const handleViewProfile = (userId: string) => {
    navigateTo('profile', { userId });
  };
  
  const handleNavigateToProfile = () => {
    if (currentUser) {
      handleViewProfile(currentUser.id);
    }
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleDeletePost = (postId: number) => {
    if (window.confirm(t('post.delete.confirm.message'))) {
      deletePost(postId);
    }
  };

  const handleUpdatePost = (postId: number, updates: { text: string; activity: Activity; }) => {
    updatePost(postId, updates);
    setEditingPost(null);
  };
  
  const handleOpenEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleUpdateUserProfile = async (updates: { bio: string, currentActivity: Activity, username?: string }) => {
    if (currentUser) {
      const result = await updateUserProfile(currentUser.id, updates);
      if (!result.error) {
          setIsEditingProfile(false);
      } else {
          alert(result.error); // Ideally show this in the form
      }
    }
  };

  const handleOpenChat = (user: User) => {
    setChattingWithUser(user);
  };
  
  const handleCloseChat = () => {
    setChattingWithUser(null);
  };
  
  const handleSendMessage = (message: { receiverId: string; text?: string; imageUrl?: string }) => {
    addMessage(message);
  };
  
  const handleOpenMessagesModal = () => setIsMessagesModalOpen(true);
  const handleCloseMessagesModal = () => setIsMessagesModalOpen(false);

  const handleCreateEvent = (eventData: { title: string; description: string; type: 'stand-up' | 'podcast'; speakers: string[]; coverImage?: string; }) => {
      const newEvent = addEvent(eventData);
      setActiveEventId(newEvent.id);
      navigateTo('event-room', { eventId: newEvent.id });
  }
  
  const handleNavigateToCreateEvent = (type: 'stand-up' | 'podcast') => {
      setCreatingEventType(type);
      navigateTo('create-event');
  };

  const handleJoinEvent = (eventId: number) => {
      joinEvent(eventId);
      setActiveEventId(eventId);
      navigateTo('event-room', { eventId });
  }
  
  const handleLeaveEvent = () => {
      if (activeEventId) {
          leaveEvent(activeEventId);
      }
      setActiveEventId(null);
      navigateTo('events');
  }

  const handleViewMedia = (media: Post['media'], startIndex: number) => {
    setMediaViewerState({ media, startIndex });
  };
  
  const handlePostComment = (postId: number, text: string) => {
      if (currentUser) {
          addComment(currentUser.id, postId, text);
      }
  }
  
  const handleNotificationClick = (notif: Notification) => {
      if (notif.type === 'follow') {
          handleViewProfile(notif.relatedId as string);
      } else if (['like', 'comment', 'ask'].includes(notif.type)) {
          // Try to find the post in the loaded posts
          const postId = Number(notif.relatedId);
          const post = posts.find(p => p.id === postId);
          
          if (post) {
              if (post.postType === 'ask') {
                  navigateTo('ask');
              } else {
                  navigateTo('home');
              }
              // Trigger scroll logic
              setHighlightedPostId(postId);
          } else {
             // Fallback if post isn't loaded (e.g. old post not in initial fetch)
             // For now just navigate to home, better logic would be to fetch single post
             navigateTo('home');
          }
      }
  };

  const viewingProfileUser = users.find(u => u.id === viewingProfileFor);

  // --- RENDER ---

  if (!isAuthenticated) {
      return (
          <LandingPage 
              users={users} 
              onLogin={handleLogin} 
              onRegister={handleRegister}
              onResetPassword={handleResetPassword}
          />
      );
  }
  
  // Render the existing app...
  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 font-sans">
      {/* ... all other components remain the same ... */}
      <Header 
        currentUser={currentUser}
        users={users}
        onOpenMessages={handleOpenMessagesModal}
        onNavigateToProfile={handleNavigateToProfile}
        activityFilter={activityFilter}
        onFilterActivity={handleFilterActivity}
        notifications={notifications}
        onMarkAllRead={markAllAsRead}
        hasUnreadNotifications={hasUnread}
        onNotificationClick={handleNotificationClick}
      />
      <div className="w-full max-w-7xl mx-auto flex pt-28">
        <LeftSidebar 
          activePage={page} 
          setPage={navigateTo} 
          currentUser={currentUser}
          onNavigateToProfile={handleNavigateToProfile}
          liveEvents={liveEvents}
          onCreatePost={() => handleNavigateToCreate({ asAsk: false, from: 'home' })}
        />
        
        <div className="flex-1 flex flex-col md:flex-row min-w-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
               {page === "event-room" && currentActiveEvent && currentUser ? (
                  <motion.div 
                      key="event-room"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 p-4 sm:p-8 flex min-h-0"
                  >
                      <EventRoom
                        event={currentActiveEvent}
                        currentUser={currentUser}
                        allUsers={users}
                        onLeave={handleLeaveEvent}
                        onEndEvent={endEvent}
                        onAddComment={addEventComment}
                        onDeleteComment={deleteEventComment}
                        onPinComment={pinComment}
                        onToggleModerator={toggleModerator}
                        onToggleMuteSpeaker={toggleMuteSpeaker}
                      />
                  </motion.div>
                ) : (
                  <MainContent key={page + (viewingProfileFor || '')}>
                    {/* Page content rendering logic... */}
                    {page === 'home' && currentUser && (
                      <div className="max-w-2xl mx-auto">
                        <div className="px-4 sm:px-8">
                          <StoryReel 
                             usersWithStories={usersWithStories} 
                             posts={statusPosts} 
                             onViewStory={setViewingStoryForUserIndex} 
                             onNavigateToFriends={() => navigateTo('friends')}
                          />
                        </div>
                        <div className="space-y-6 px-4 sm:px-8 pt-6">
                          {isLoading && <div className="text-center p-8 text-gray-500 dark:text-gray-400">{t('app.loading')}</div>}
                          {!isLoading && statusPosts.length === 0 && (
                            <div className="text-center text-gray-500 dark:text-gray-400 p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:border dark:border-slate-700">
                              <h3 className="text-xl font-semibold mb-2">{t('app.empty.title')}</h3>
                              <p>
                                {activityFilter 
                                  ? `${t('app.empty.description.withFilter')} "${t(`activity.${activityFilter}` as any)}".`
                                  : t('app.empty.description.noFilter')
                                }
                              </p>
                              <button onClick={() => navigateTo('create')} className="mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 transition-colors">
                                {t('app.empty.button.post')}
                              </button>
                            </div>
                          )}
                          <AnimatePresence>
                            {statusPosts.map(p => (
                               <motion.div
                                  key={p.id}
                                  layout
                                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                  transition={{ duration: 0.5, type: 'spring' }}
                                >
                                  <PostCard 
                                    post={p} 
                                    users={users} 
                                    currentUserId={currentUser.id} 
                                    onReact={(postId, emoji) => currentUser && addReaction(currentUser.id, postId, emoji)} 
                                    onReply={(postId, replyText) => currentUser && addReply(currentUser.id, postId, replyText)} 
                                    onComment={handlePostComment}
                                    onViewProfile={handleViewProfile} 
                                    onEdit={handleEditPost} 
                                    onDelete={handleDeletePost} 
                                    isFavorited={favoriteIds.includes(p.id)} 
                                    onToggleFavorite={handleToggleFavorite} 
                                    onViewMedia={handleViewMedia} 
                                  />
                                </motion.div>
                            ))}
                          </AnimatePresence>
                           {!isLoading && statusPosts.length > 0 && (
                            <footer className="text-center text-sm text-gray-400 dark:text-gray-500">
                              <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
                            </footer>
                          )}
                        </div>
                      </div>
                    )}
                     
                    {/* Other pages (friends, events, etc) */}
                    {page !== 'home' && page !== 'event-room' && (
                      <div className="p-4 sm:p-8 h-full">
                        {page === "events" && <ComingSoonView />}

                        {page === "create-event" && currentUser && (
                          <CreateEventForm
                            type={creatingEventType}
                            currentUser={currentUser}
                            allUsers={users}
                            onCreateEvent={handleCreateEvent}
                            onClose={() => navigateTo('events')}
                          />
                        )}

                        {page === "ask" && currentUser && (
                          <div className="max-w-2xl mx-auto space-y-6">
                            {/* Ask Page Content */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('ask.title')}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('ask.subtitle')}</p>
                              </div>
                              <button 
                                onClick={() => handleNavigateToCreate({ asAsk: true, from: 'ask' })}
                                className="flex-shrink-0 flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                              >
                                {t('ask.button.create')}
                              </button>
                            </div>
                            {isLoading && <div className="text-center p-8 text-gray-500 dark:text-gray-400">{t('app.loading')}</div>}
                            {!isLoading && askPosts.length === 0 && (
                              <div className="text-center text-gray-500 dark:text-gray-400 p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:border dark:border-slate-700">
                                <h3 className="text-xl font-semibold mb-2">{t('ask.empty.title')}</h3>
                                <p>{t('ask.empty.description')}</p>
                              </div>
                            )}
                             <AnimatePresence>
                              {askPosts.map(p => (
                                 <motion.div
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ duration: 0.5, type: 'spring' }}
                                  >
                                    <PostCard post={p} users={users} currentUserId={currentUser.id} onReact={(postId, emoji) => currentUser && addReaction(currentUser.id, postId, emoji)} onReply={(postId, replyText) => currentUser && addReply(currentUser.id, postId, replyText)} onViewProfile={handleViewProfile} onEdit={handleEditPost} onDelete={handleDeletePost} isFavorited={false} onToggleFavorite={() => {}} onViewMedia={handleViewMedia} />
                                  </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}

                        {page === "create" && <CreatePostForm onAddPost={handleAddPost} onClose={() => navigateTo(createEntryPage)} startAsAnonymous={startAsAsk} />}
                        
                        {page === "friends" && currentUser && (
                          <FriendsView 
                            allUsers={users}
                            currentUser={currentUser}
                            onViewProfile={handleViewProfile}
                            onFollow={followUser}
                            onUnfollow={unfollowUser}
                            liveEvents={liveEvents}
                          />
                        )}

                        {page === "profile" && viewingProfileUser && currentUser && (
                          <ProfileView 
                            posts={posts} 
                            users={users}
                            profileUser={viewingProfileUser}
                            currentUser={currentUser}
                            onReact={(postId, emoji) => currentUser && addReaction(currentUser.id, postId, emoji)} 
                            onReply={(postId, text) => currentUser && addReply(currentUser.id, postId, text)}
                            onComment={handlePostComment}
                            onFollow={followUser}
                            onUnfollow={unfollowUser}
                            onViewProfile={handleViewProfile}
                            onEdit={handleEditPost}
                            onDelete={handleDeletePost}
                            onEditProfile={handleOpenEditProfile}
                            onOpenChat={handleOpenChat}
                            favoriteIds={favoriteIds}
                            onToggleFavorite={handleToggleFavorite}
                            liveEvents={liveEvents}
                            onJoinEvent={handleJoinEvent}
                            onUpdateUserVisibility={updateUserVisibility}
                            onViewMedia={handleViewMedia}
                          />
                        )}
                        
                        {page === "settings" && (
                            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl dark:border dark:border-slate-700 space-y-6">
                                <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">{t('settings.title')}</h2>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between p-4 bg-brand-50 dark:bg-slate-700/50 rounded-lg">
                                    <div>
                                       <span className="font-semibold text-gray-700 dark:text-gray-200">{t('settings.appearance.title')}</span>
                                       <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.appearance.description')}</p>
                                    </div>
                                    <button 
                                      onClick={toggleTheme} 
                                      className="relative inline-flex items-center h-8 w-14 cursor-pointer rounded-full bg-brand-200 dark:bg-slate-600 transition-colors duration-300 ease-in-out"
                                      aria-label="Toggle Dark Mode"
                                    >
                                      <span className={`inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}>
                                        {theme === 'light' ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-slate-400" />}
                                      </span>
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between p-4 bg-brand-50 dark:bg-slate-700/50 rounded-lg">
                                    <div>
                                       <span className="font-semibold text-gray-700 dark:text-gray-200">{t('settings.language.title')}</span>
                                       <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.language.description')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <button onClick={() => setLanguage('id')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${language === 'id' ? 'bg-brand-600 text-white' : 'bg-brand-200 text-brand-800 hover:bg-brand-300 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500'}`}>
                                          ID
                                       </button>
                                       <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${language === 'en' ? 'bg-brand-600 text-white' : 'bg-brand-200 text-brand-800 hover:bg-brand-300 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500'}`}>
                                          EN
                                       </button>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">{t('settings.legal.sectionTitle')}</h3>
                                  <div className="bg-brand-50 dark:bg-slate-700/50 rounded-lg overflow-hidden">
                                    <button onClick={() => navigateTo('privacy')} className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-100 dark:hover:bg-slate-600/50 transition-colors">
                                      <span className="font-semibold text-gray-700 dark:text-gray-200">{t('settings.legal.privacy')}</span>
                                      <ChevronRight size={20} className="text-gray-400" />
                                    </button>
                                    <div className="border-t border-brand-200 dark:border-slate-600/50 mx-4"></div>
                                    <button onClick={() => navigateTo('terms')} className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-100 dark:hover:bg-slate-600/50 transition-colors">
                                      <span className="font-semibold text-gray-700 dark:text-gray-200">{t('settings.legal.terms')}</span>
                                      <ChevronRight size={20} className="text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                                
                                 <div>
                                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">Akun</h3>
                                  <div className="bg-brand-50 dark:bg-slate-700/50 rounded-lg overflow-hidden">
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400">
                                      <LogOut size={20} />
                                      <span className="font-semibold">Keluar</span>
                                    </button>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-500 dark:text-gray-400 pt-4 text-center">{t('settings.more')}</p>
                            </div>
                        )}
                        
                        {page === "privacy" && <PrivacyPolicy onBack={() => navigateTo('settings')} />}
                        
                        {page === "terms" && <TermsConditions onBack={() => navigateTo('settings')} />}
                      </div>
                    )}

                  </MainContent>
                )
              }
            </AnimatePresence>
          </div>

          <RightSidebar 
            posts={posts} 
            users={users} 
            currentUser={currentUser} 
            onViewProfile={handleViewProfile} 
            viewingProfileId={viewingProfileFor}
            activityFilter={activityFilter}
            onFilterActivity={handleFilterActivity}
          />
        </div>
      </div>
      
      <BottomNavbar 
        activePage={page}
        setPage={navigateTo}
        onNavigateToProfile={handleNavigateToProfile}
      />

      <AnimatePresence>
        {editingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <EditPostForm
              post={editingPost}
              onUpdatePost={handleUpdatePost}
              onClose={() => setEditingPost(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isEditingProfile && currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <EditProfileForm
              currentUser={currentUser}
              onUpdateProfile={handleUpdateUserProfile}
              onClose={() => setIsEditingProfile(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chattingWithUser && currentUser && (
          <PrivateChatModal
            currentUser={currentUser}
            targetUser={chattingWithUser}
            messages={conversationMessages}
            onSendMessage={handleSendMessage}
            onClose={handleCloseChat}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isMessagesModalOpen && currentUser && (
          <MessagesModal
            currentUser={currentUser}
            allUsers={users}
            messages={messages}
            mutualFriends={mutuals.map(id => users.find(u => u.id === id)).filter(Boolean) as User[]}
            onOpenChat={(user) => {
                handleCloseMessagesModal();
                handleOpenChat(user);
            }}
            onClose={handleCloseMessagesModal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingStoryForUserIndex !== null && (
            <StoryViewer
                usersWithStories={usersWithStories}
                allPosts={posts}
                initialUserIndex={viewingStoryForUserIndex}
                onClose={() => setViewingStoryForUserIndex(null)}
                onReact={(postId, emoji) => currentUser && addReaction(currentUser.id, postId, emoji)}
                onViewProfile={(userId) => {
                    setViewingStoryForUserIndex(null);
                    handleViewProfile(userId);
                }}
                isFavorited={(postId) => favoriteIds.includes(postId)}
                onToggleFavorite={handleToggleFavorite}
            />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {mediaViewerState && (
            <MediaViewerModal
                media={mediaViewerState.media}
                startIndex={mediaViewerState.startIndex}
                onClose={() => setMediaViewerState(null)}
            />
        )}
      </AnimatePresence>

    </div>
  );
}
