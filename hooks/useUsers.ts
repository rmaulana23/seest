import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Activity } from '../types';
import { USERS as INITIAL_USERS, CURRENT_USER_ID } from '../constants';

const USERS_STORAGE_KEY = 'seest_users_v1';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const saveUsers = useCallback((updatedUsers: User[]) => {
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
      } catch (error) {
          console.error("Failed to save users to storage", error);
      }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : INITIAL_USERS;
      setUsers(parsed);
    } catch (error) {
      console.error("Failed to load users from storage", error);
      setUsers(INITIAL_USERS);
    }
    setIsLoading(false);
  }, []);
  
  const addUser = useCallback((newUser: User) => {
      setUsers(prevUsers => {
          const updatedUsers = [...prevUsers, newUser];
          saveUsers(updatedUsers);
          return updatedUsers;
      });
  }, [saveUsers]);

  const followUser = useCallback((targetUserId: string) => {
    setUsers(prevUsers => {
        const newUsers = prevUsers.map(user => {
            // Add target to current user's following list
            if (user.id === CURRENT_USER_ID) {
                return { ...user, following: [...new Set([...user.following, targetUserId])] };
            }
            // Add current user to target's followers list
            if (user.id === targetUserId) {
                return { ...user, followers: [...new Set([...user.followers, CURRENT_USER_ID])] };
            }
            return user;
        });
        saveUsers(newUsers);
        return newUsers;
    });
  }, [saveUsers]);

  const unfollowUser = useCallback((targetUserId: string) => {
    setUsers(prevUsers => {
        const newUsers = prevUsers.map(user => {
            // Remove target from current user's following list
            if (user.id === CURRENT_USER_ID) {
                return { ...user, following: user.following.filter(id => id !== targetUserId) };
            }
            // Remove current user from target's followers list
            if (user.id === targetUserId) {
                return { ...user, followers: user.followers.filter(id => id !== CURRENT_USER_ID) };
            }
            return user;
        });
        saveUsers(newUsers);
        return newUsers;
    });
  }, [saveUsers]);
  
  const updateUserProfile = useCallback((userId: string, updates: { bio: string, currentActivity: Activity }) => {
    setUsers(prevUsers => {
        const newUsers = prevUsers.map(user => {
            if (user.id === userId) {
                return { 
                  ...user, 
                  bio: updates.bio.slice(0, 160),
                  currentActivity: updates.currentActivity,
                };
            }
            return user;
        });
        saveUsers(newUsers);
        return newUsers;
    });
  }, [saveUsers]);
  
  const toggleFavorite = useCallback((userId: string, postId: number) => {
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.id === userId) {
          const currentFavorites = user.favoritePostIds || [];
          const isFavorited = currentFavorites.includes(postId);
          const newFavorites = isFavorited
            ? currentFavorites.filter(id => id !== postId)
            : [...currentFavorites, postId];
          return { ...user, favoritePostIds: newFavorites };
        }
        return user;
      });
      saveUsers(newUsers);
      return newUsers;
    });
  }, [saveUsers]);

  const updateUserVisibility = useCallback((userId: string, visibility: 'private' | 'public') => {
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.id === userId) {
          return { ...user, savedPostsVisibility: visibility };
        }
        return user;
      });
      saveUsers(newUsers);
      return newUsers;
    });
  }, [saveUsers]);


  const currentUser = useMemo(() => users.find(u => u.id === CURRENT_USER_ID), [users]);

  return { users, currentUser, followUser, unfollowUser, updateUserProfile, toggleFavorite, updateUserVisibility, addUser, isLoading };
};