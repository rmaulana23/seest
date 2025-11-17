import { useState, useEffect, useCallback } from 'react';
import { Post, Activity, Reply, PostComment } from '../types';
import { POSTS_STORAGE_KEY, TTL_MS, SAMPLE_POSTS } from '../constants';

const isFresh = (post: Post) => (Date.now() - new Date(post.createdAt).getTime()) < TTL_MS;

export const usePosts = (bookmarkedIds: number[]) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isFreshOrBookmarked = useCallback((post: Post) => {
    return isFresh(post) || bookmarkedIds.includes(post.id);
  }, [bookmarkedIds]);

  const cleanAndSave = useCallback((postsToClean: Post[]) => {
    const relevantPosts = postsToClean.filter(isFreshOrBookmarked);
    relevantPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(relevantPosts));
    return relevantPosts;
  }, [isFreshOrBookmarked]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(POSTS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : SAMPLE_POSTS;
      const fresh = cleanAndSave(parsed);
      setPosts(fresh);
    } catch (error) {
      console.error("Failed to load posts from storage", error);
      const fresh = cleanAndSave(SAMPLE_POSTS);
      setPosts(fresh);
    }
    setIsLoading(false);
  }, [cleanAndSave]);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
        setPosts(prevPosts => cleanAndSave(prevPosts));
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [cleanAndSave]);


  const addPost = useCallback((userId: string, postData: { text: string; activity: Activity; media: { url: string, type: 'image' | 'video' }[]; backgroundColor: string | null; postType: 'status' | 'ask', aspectRatio?: 'portrait' | 'landscape' }) => {
    const isAsk = postData.postType === 'ask';
    
    const newPost: Post = {
      id: Date.now(),
      userId: isAsk ? "anonymous" : userId,
      activity: postData.activity,
      text: postData.text.slice(0, 150),
      media: isAsk ? [] : (postData.backgroundColor ? [] : postData.media),
      backgroundColor: isAsk ? undefined : postData.backgroundColor ?? undefined,
      createdAt: new Date().toISOString(),
      reactions: {},
      postType: postData.postType,
      replies: [],
      comments: [],
      aspectRatio: postData.media.length > 0 ? postData.aspectRatio : undefined,
    };
    setPosts(prevPosts => {
        const updatedPosts = [newPost, ...prevPosts];
        return cleanAndSave(updatedPosts);
    });
  }, [cleanAndSave]);

  const addReaction = useCallback((userId: string, postId: number, emoji: string) => {
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(p => {
        if (p.id === postId) {
          const newReactions = { ...p.reactions };
          const currentUserReaction = newReactions[userId];

          if (currentUserReaction === emoji) {
            // User clicked the same emoji again, so remove reaction
            delete newReactions[userId];
          } else {
            // User adds a new reaction or changes existing one
            newReactions[userId] = emoji;
          }
          
          return { ...p, reactions: newReactions };
        }
        return p;
      });
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      return updatedPosts;
    });
  }, []);
  
  const addReply = useCallback((userId: string, postId: number, replyText: string) => {
    const newReply: Reply = {
      userId: userId,
      text: replyText,
    };
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(p =>
        p.id === postId
          ? {
              ...p,
              replies: [...(p.replies || []), newReply],
            }
          : p
      );
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      return updatedPosts;
    });
  }, []);

  const addComment = useCallback((userId: string, postId: number, commentText: string) => {
    const newComment: PostComment = {
      id: Date.now(),
      userId: userId,
      text: commentText,
      createdAt: new Date().toISOString(),
    };
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(p => 
        p.id === postId 
        ? {
            ...p,
            comments: [...(p.comments || []), newComment]
          }
        : p
      );
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      return updatedPosts;
    });
  }, []);
  
  const deletePost = useCallback((postId: number) => {
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.filter(p => p.id !== postId);
      return cleanAndSave(updatedPosts);
    });
  }, [cleanAndSave]);

  const updatePost = useCallback((postId: number, updates: { text: string; activity: Activity }) => {
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(p =>
        p.id === postId
          ? {
              ...p,
              text: updates.text,
              activity: updates.activity,
            }
          : p
      );
      return cleanAndSave(updatedPosts);
    });
  }, [cleanAndSave]);

  return { posts, addPost, addReaction, addReply, addComment, deletePost, updatePost, isLoading };
};