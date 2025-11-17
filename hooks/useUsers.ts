
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Activity } from '../types';
import { supabase } from '../lib/supabase';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAuthId, setCurrentAuthId] = useState<string | null>(null);

  // Fetch the current authenticated user's ID
  useEffect(() => {
    const getAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentAuthId(session?.user.id || null);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentAuthId(session?.user.id || null);
        });
        return () => subscription.unsubscribe();
    };
    getAuth();
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        // Fetch Profiles
        const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
        if (profilesError) throw profilesError;

        // Fetch Follows
        const { data: follows, error: followsError } = await supabase.from('follows').select('*');
        if (followsError) throw followsError;

        // Fetch Saved Posts
        const { data: savedPosts, error: savedError } = await supabase.from('saved_posts').select('*');
        if (savedError) throw savedError;

        const mappedUsers: User[] = profiles.map((p: any) => {
            const userFollowers = follows.filter((f: any) => f.following_id === p.id).map((f: any) => f.follower_id);
            const userFollowing = follows.filter((f: any) => f.follower_id === p.id).map((f: any) => f.following_id);
            const userFavorites = savedPosts.filter((s: any) => s.user_id === p.id).map((s: any) => s.post_id);

            // Fallback for username if not present in legacy data
            let username = p.username;
            if (!username) {
                const base = p.email ? p.email.split('@')[0] : (p.name || 'user').toLowerCase().replace(/\s/g, '');
                username = base;
            }

            return {
                id: p.id,
                name: p.name || p.email?.split('@')[0] || 'User',
                username: username,
                email: p.email,
                avatar: p.avatar || '?',
                bio: p.bio,
                lastSeen: p.last_seen || new Date().toISOString(),
                currentActivity: p.current_activity as Activity,
                savedPostsVisibility: p.saved_posts_visibility,
                followers: userFollowers,
                following: userFollowing,
                favoritePostIds: userFavorites,
                lastUsernameChange: p.last_username_change,
            };
        });
        
        setUsers(mappedUsers);

    } catch (error) {
        console.error("Error fetching users from Supabase:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  // Failsafe: Ensure profile exists if auth exists
  useEffect(() => {
    const ensureProfile = async () => {
        if (currentAuthId && !isLoading) {
            // Check if we have the user in our loaded list
            const found = users.find(u => u.id === currentAuthId);
            
            if (!found) {
                console.log("Profile missing for auth user, attempting recovery...");
                // Profile missing! Create it manually if trigger failed
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const cleanName = user.user_metadata?.name 
                        ? user.user_metadata.name.toLowerCase().replace(/[^a-z0-9]/g, '') 
                        : user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                    
                    const baseUsername = cleanName || 'user';

                    const newProfile = {
                        id: user.id,
                        email: user.email,
                        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                        username: baseUsername,
                        avatar: user.user_metadata?.avatar || user.email?.charAt(0).toUpperCase() || 'U',
                        bio: '',
                        current_activity: 'Relaxing',
                        last_seen: new Date().toISOString()
                    };
                    
                    let { error } = await supabase.from('profiles').upsert(newProfile);

                    // If error is unique violation (username taken), try appending random number
                    if (error && error.code === '23505') {
                        console.log("Username collision detected during recovery, trying random suffix...");
                        newProfile.username = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
                        const retry = await supabase.from('profiles').upsert(newProfile);
                        error = retry.error;
                    }
                    
                    if (!error) {
                        console.log("Profile recovered successfully.");
                        fetchData(); // Refresh data
                    } else {
                        // Log the actual error message for debugging
                        console.error("Failed to recover profile:", error.message || error);
                    }
                }
            }
        }
    };
    
    ensureProfile();
  }, [currentAuthId, users, isLoading, fetchData]);

  useEffect(() => {
    // Fetch data immediately when the hook mounts OR when auth ID changes (Login/Logout)
    fetchData();
    
    // Subscribe to Realtime changes
    const profilesSub = supabase.channel('public:profiles').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData).subscribe();
    const followsSub = supabase.channel('public:follows').on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, fetchData).subscribe();
    const savedSub = supabase.channel('public:saved_posts').on('postgres_changes', { event: '*', schema: 'public', table: 'saved_posts' }, fetchData).subscribe();

    return () => {
        supabase.removeChannel(profilesSub);
        supabase.removeChannel(followsSub);
        supabase.removeChannel(savedSub);
    }
  }, [fetchData, currentAuthId]);

  const addUser = useCallback((newUser: User) => {
      // Logic handled by Supabase Auth Trigger (public.handle_new_user)
      console.log("User registration handled by Supabase Auth", newUser);
  }, []);

  const followUser = useCallback(async (targetId: string) => {
     if(!currentAuthId) return;
     try {
         await supabase.from('follows').insert({ follower_id: currentAuthId, following_id: targetId });
         
         // Send Notification to target
         await supabase.from('notifications').insert({
             user_id: targetId, // Recipient
             actor_id: currentAuthId, // Sender
             type: 'follow',
             text: 'started following you.',
             related_id: currentAuthId
         });

         // Force immediate refresh to update UI faster than realtime
         fetchData();
     } catch(e) { console.error(e); }
  }, [currentAuthId, fetchData]);

  const unfollowUser = useCallback(async (targetId: string) => {
     if(!currentAuthId) return;
     try {
        await supabase.from('follows').delete().match({ follower_id: currentAuthId, following_id: targetId });
        // Force immediate refresh
        fetchData();
     } catch(e) { console.error(e); }
  }, [currentAuthId, fetchData]);
  
  const updateUserProfile = useCallback(async (userId: string, updates: { bio: string, currentActivity: Activity, username?: string }): Promise<{error?: string}> => {
    if (userId !== currentAuthId) return { error: 'Unauthorized' };
    
    const currentUser = users.find(u => u.id === userId);
    const updatesPayload: any = {
        bio: updates.bio.slice(0, 160),
        current_activity: updates.currentActivity,
        last_seen: new Date().toISOString()
    };

    // Handle Username Change logic
    if (updates.username && currentUser && updates.username !== currentUser.username) {
        const now = new Date();
        const lastChange = currentUser.lastUsernameChange ? new Date(currentUser.lastUsernameChange) : null;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (lastChange && (now.getTime() - lastChange.getTime() < sevenDays)) {
            return { error: 'Username can only be changed once every 7 days.' };
        }
        
        updatesPayload.username = updates.username;
        updatesPayload.last_username_change = now.toISOString();
    }

    try {
        const { error } = await supabase.from('profiles').update(updatesPayload).eq('id', userId);
        
        if (error) {
            // Check for unique violation (code 23505 in Postgres)
            if (error.code === '23505') {
                return { error: 'Username already taken. Please choose another.' };
            }
            throw error;
        }
        fetchData();
        return {};
    } catch(e: any) { 
        console.error(e);
        return { error: e.message || 'Failed to update profile' };
    }
  }, [currentAuthId, users, fetchData]);
  
  const toggleFavorite = useCallback(async (userId: string, postId: number) => {
     if(userId !== currentAuthId) return;
     const currentUser = users.find(u => u.id === userId);
     const isFavorited = currentUser?.favoritePostIds?.includes(postId);

     try {
         if (isFavorited) {
             await supabase.from('saved_posts').delete().match({ user_id: userId, post_id: postId });
         } else {
             await supabase.from('saved_posts').insert({ user_id: userId, post_id: postId });
         }
         fetchData();
     } catch(e) { console.error(e); }
  }, [currentAuthId, users, fetchData]);

  const updateUserVisibility = useCallback(async (userId: string, visibility: 'private' | 'public') => {
     if(userId !== currentAuthId) return;
     try {
         await supabase.from('profiles').update({ saved_posts_visibility: visibility }).eq('id', userId);
         fetchData();
     } catch(e) { console.error(e); }
  }, [currentAuthId, fetchData]);


  const currentUser = useMemo(() => users.find(u => u.id === currentAuthId), [users, currentAuthId]);

  return { users, currentUser, followUser, unfollowUser, updateUserProfile, toggleFavorite, updateUserVisibility, addUser, isLoading };
};
