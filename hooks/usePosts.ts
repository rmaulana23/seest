
import { useState, useEffect, useCallback } from 'react';
import { Post, Activity, Reply, PostComment } from '../types';
import { supabase } from '../lib/supabase';

export const usePosts = (bookmarkedIds: number[]) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAuthId, setCurrentAuthId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setCurrentAuthId(session?.user.id || null);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentAuthId(session?.user.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
        // In a real app, we would have a complex query or view for the feed.
        // For now, we fetch all posts and filter them client side or assume RLS handles visibility.
        // We need 'ask' posts (public) and 'status' posts (friends).
        // Simple approach: Fetch recently created posts.
        
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100); // Limit for performance

        if (error) throw error;

        if (data) {
            const mappedPosts: Post[] = data.map((p: any) => ({
                id: p.id,
                userId: p.post_type === 'ask' ? 'anonymous' : p.user_id, // Hide ID for Ask locally
                activity: p.activity as Activity,
                text: p.text,
                media: p.media || [],
                backgroundColor: p.background_color,
                createdAt: p.created_at,
                reactions: {}, // Placeholder, implementation would require a separate table join
                postType: p.post_type,
                replies: [], // Placeholder
                comments: [], // Placeholder
                aspectRatio: p.aspect_ratio,
            }));
            setPosts(mappedPosts);
        }
    } catch (error) {
        console.error("Failed to load posts from supabase", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    const sub = supabase
        .channel('public:posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
        .subscribe();
        
    return () => { supabase.removeChannel(sub); }
  }, [fetchPosts]);

  const addPost = useCallback(async (userId: string, postData: { text: string; activity: Activity; media: { url: string, type: 'image' | 'video' }[]; backgroundColor: string | null; postType: 'status' | 'ask', aspectRatio?: 'portrait' | 'landscape' }) => {
    if (!currentAuthId) return;

    const newPostPayload = {
        user_id: currentAuthId,
        text: postData.text.slice(0, 150),
        activity: postData.activity,
        media: postData.media, // Supabase handles JSONB
        background_color: postData.backgroundColor,
        post_type: postData.postType,
        aspect_ratio: postData.aspectRatio
    };

    try {
        const { data: postDataResult, error } = await supabase.from('posts').insert(newPostPayload).select().single();
        if (error) throw error;

        // --- Logic for Mutual Notifications on 'Ask' ---
        if (postData.postType === 'ask' && postDataResult) {
            // 1. Get Mutual Friends
            // A mutual is someone I follow AND who follows me.
            
            // Get people I follow
            const { data: followingData } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentAuthId);
                
            // Get people who follow me
            const { data: followerData } = await supabase
                .from('follows')
                .select('follower_id')
                .eq('following_id', currentAuthId);

            if (followingData && followerData) {
                const followingIds = followingData.map(f => f.following_id);
                const followerIds = followerData.map(f => f.follower_id);
                
                // Intersection
                const mutualIds = followingIds.filter(id => followerIds.includes(id));
                
                if (mutualIds.length > 0) {
                    const notifications = mutualIds.map(mutualId => ({
                        user_id: mutualId,
                        actor_id: currentAuthId,
                        type: 'ask',
                        text: 'asked an anonymous question in your circle.',
                        related_id: postDataResult.id
                    }));
                    
                    await supabase.from('notifications').insert(notifications);
                }
            }
        }

    } catch (e) {
        console.error("Error creating post:", e);
    }
  }, [currentAuthId]);

  // Placeholder functions for features not fully migrated to DB in this step (reactions/comments)
  // To fully implement, we'd need the `post_reactions` and `post_comments` tables linked in `fetchPosts`.
  // For now, we keep the UI working but these won't persist beautifully without those SQL joins implemented in fetch.
  
  const addReaction = useCallback((userId: string, postId: number, emoji: string) => {
      // Todo: Implement supabase insert to post_reactions
      console.log("Reaction added (local simulation only until full DB join implemented)");
  }, []);
  
  const addReply = useCallback((userId: string, postId: number, replyText: string) => {
       // Todo: Implement supabase insert to post_replies
  }, []);

  const addComment = useCallback((userId: string, postId: number, commentText: string) => {
       // Todo: Implement supabase insert to post_comments
  }, []);
  
  const deletePost = useCallback(async (postId: number) => {
    try {
        await supabase.from('posts').delete().eq('id', postId);
        // Realtime will update UI
    } catch (e) {
        console.error("Error deleting post:", e);
    }
  }, []);

  const updatePost = useCallback(async (postId: number, updates: { text: string; activity: Activity }) => {
      try {
          await supabase.from('posts').update({ text: updates.text, activity: updates.activity }).eq('id', postId);
      } catch (e) {
          console.error("Error updating post:", e);
      }
  }, []);

  return { posts, addPost, addReaction, addReply, addComment, deletePost, updatePost, isLoading };
};
