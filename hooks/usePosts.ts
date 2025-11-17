
import { useState, useEffect, useCallback } from 'react';
import { Post, Activity, Reply, PostComment } from '../types';
import { supabase } from '../lib/supabase';

export const usePosts = (bookmarkedIds: number[]) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAuthId, setCurrentAuthId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentAuthId(session?.user.id || null);
    };
    getAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentAuthId(session?.user.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchPosts = useCallback(async () => {
    // Don't set loading to true on background refreshes to avoid flickering
    // setIsLoading(true); 
    try {
        // Calculate 24 hours ago in ISO string
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Filter: Get posts created AFTER 24 hours ago
        // Fetch relations: reactions, comments, replies
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                reactions:post_reactions(user_id, emoji),
                comments:post_comments(id, user_id, text, created_at),
                replies:post_replies(user_id, text)
            `)
            .gt('created_at', twentyFourHoursAgo) 
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        if (data) {
            const mappedPosts: Post[] = data.map((p: any) => {
                // Map reactions array to object { userId: emoji }
                const reactionsMap: Record<string, string> = {};
                if (p.reactions && Array.isArray(p.reactions)) {
                    p.reactions.forEach((r: any) => {
                        reactionsMap[r.user_id] = r.emoji;
                    });
                }

                return {
                    id: p.id,
                    userId: p.post_type === 'ask' ? 'anonymous' : p.user_id,
                    activity: p.activity as Activity,
                    text: p.text,
                    media: p.media || [],
                    backgroundColor: p.background_color,
                    createdAt: p.created_at,
                    reactions: reactionsMap, 
                    postType: p.post_type,
                    replies: p.replies || [], 
                    comments: p.comments || [], 
                    aspectRatio: p.aspect_ratio,
                };
            });
            setPosts(mappedPosts);
        }
    } catch (error) {
        console.error("Failed to load posts from supabase", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true); // Initial load
    fetchPosts();

    // Subscribe to changes on posts and related tables
    const sub = supabase
        .channel('public:posts_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, fetchPosts)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, fetchPosts)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'post_replies' }, fetchPosts)
        .subscribe();
        
    return () => { supabase.removeChannel(sub); }
  }, [fetchPosts]);

  const addPost = useCallback(async (userId: string, postData: { text: string; activity: Activity; media: { url: string, type: 'image' | 'video' }[]; backgroundColor: string | null; postType: 'status' | 'ask', aspectRatio?: 'portrait' | 'landscape' }) => {
    if (!currentAuthId) {
        console.error("Cannot post: User not authenticated");
        return;
    }

    const newPostPayload = {
        user_id: currentAuthId,
        text: postData.text.slice(0, 150),
        activity: postData.activity,
        media: postData.media,
        background_color: postData.backgroundColor,
        post_type: postData.postType,
        aspect_ratio: postData.aspectRatio
    };

    try {
        const { data: postDataResult, error } = await supabase.from('posts').insert(newPostPayload).select().single();
        
        if (error) {
            console.error("Supabase Insert Error:", error.message);
            alert("Gagal memposting cerita: " + error.message);
            throw error;
        }

        // Immediately refresh posts to update UI
        fetchPosts();

        // --- Logic for Mutual Notifications on 'Ask' ---
        if (postData.postType === 'ask' && postDataResult) {
            const { data: followingData } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentAuthId);
                
            const { data: followerData } = await supabase
                .from('follows')
                .select('follower_id')
                .eq('following_id', currentAuthId);

            if (followingData && followerData) {
                const followingIds = followingData.map(f => f.following_id);
                const followerIds = followerData.map(f => f.follower_id);
                
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
        console.error("Error creating post logic:", e);
    }
  }, [currentAuthId, fetchPosts]);

  const addReaction = useCallback(async (userId: string, postId: number, emoji: string) => {
      if (!currentAuthId) return;

      try {
          // 1. Upsert Reaction
          const { error } = await supabase
            .from('post_reactions')
            .upsert({ post_id: postId, user_id: currentAuthId, emoji }, { onConflict: 'post_id,user_id' });
          
          if (error) throw error;

          // 2. Send Notification (if not self-reaction)
          const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single();
          
          if (post && post.user_id !== currentAuthId) {
              await supabase.from('notifications').insert({
                  user_id: post.user_id,
                  actor_id: currentAuthId,
                  type: 'like',
                  text: 'liked your story.',
                  related_id: postId
              });
          }
          fetchPosts();
      } catch (error) {
          console.error("Error adding reaction:", error);
      }
  }, [currentAuthId, fetchPosts]);
  
  const addReply = useCallback(async (userId: string, postId: number, replyText: string) => {
      if (!currentAuthId) return;

       try {
          // 1. Insert Reply
          const { error } = await supabase
            .from('post_replies')
            .insert({ post_id: postId, user_id: currentAuthId, text: replyText });
          
          if (error) throw error;

          // 2. Send Notification
          const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single();
          
          if (post && post.user_id !== currentAuthId) {
              await supabase.from('notifications').insert({
                  user_id: post.user_id,
                  actor_id: currentAuthId,
                  type: 'comment', // Treating reply as comment for notification type simplicity
                  text: 'replied to your anonymous question.',
                  related_id: postId
              });
          }
          fetchPosts();
      } catch (error) {
          console.error("Error adding reply:", error);
      }
  }, [currentAuthId, fetchPosts]);

  const addComment = useCallback(async (userId: string, postId: number, commentText: string) => {
      if (!currentAuthId) return;

      try {
          // 1. Insert Comment
          const { error } = await supabase
            .from('post_comments')
            .insert({ post_id: postId, user_id: currentAuthId, text: commentText });
          
          if (error) throw error;

          // 2. Send Notification
          const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single();
          
          if (post && post.user_id !== currentAuthId) {
              await supabase.from('notifications').insert({
                  user_id: post.user_id,
                  actor_id: currentAuthId,
                  type: 'comment',
                  text: 'commented on your story.',
                  related_id: postId
              });
          }
          fetchPosts();
      } catch (error) {
           console.error("Error adding comment:", error);
      }
  }, [currentAuthId, fetchPosts]);
  
  const deletePost = useCallback(async (postId: number) => {
    try {
        await supabase.from('posts').delete().eq('id', postId);
        fetchPosts();
    } catch (e) {
        console.error("Error deleting post:", e);
    }
  }, [fetchPosts]);

  const updatePost = useCallback(async (postId: number, updates: { text: string; activity: Activity }) => {
      try {
          await supabase.from('posts').update({ text: updates.text, activity: updates.activity }).eq('id', postId);
          fetchPosts();
      } catch (e) {
          console.error("Error updating post:", e);
      }
  }, [fetchPosts]);

  return { posts, addPost, addReaction, addReply, addComment, deletePost, updatePost, isLoading };
};
