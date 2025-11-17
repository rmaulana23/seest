
import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { supabase } from '../lib/supabase';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  const fetchNotifications = useCallback(async () => {
      if (!currentAuthId) return;
      
      const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentAuthId)
          .order('created_at', { ascending: false });
      
      if (error) {
          console.error('Error fetching notifications:', error);
      } else if (data) {
          const mapped: Notification[] = data.map((n: any) => ({
              id: n.id,
              userId: n.actor_id, // The actor who caused the notif
              type: n.type,
              text: n.text,
              isRead: n.is_read,
              createdAt: n.created_at,
              relatedId: n.related_id
          }));
          setNotifications(mapped);
      }
  }, [currentAuthId]);

  useEffect(() => {
    fetchNotifications();
    
    if (!currentAuthId) return;

    // Subscribe to new notifications specifically for this user
    const sub = supabase
        .channel('public:notifications')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'notifications', 
                filter: `user_id=eq.${currentAuthId}` 
            },
            (payload) => {
                const newNotif = payload.new as any;
                const mapped: Notification = {
                    id: newNotif.id,
                    userId: newNotif.actor_id,
                    type: newNotif.type,
                    text: newNotif.text,
                    isRead: newNotif.is_read,
                    createdAt: newNotif.created_at,
                    relatedId: newNotif.related_id
                };
                setNotifications(prev => [mapped, ...prev]);
            }
        )
        .subscribe();

    return () => { supabase.removeChannel(sub); }
  }, [fetchNotifications, currentAuthId]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    // Handled by DB/Supabase calls in other hooks
    console.log("Add notification called client side (simulated)", notification);
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!currentAuthId) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentAuthId)
        .eq('is_read', false);
        
  }, [currentAuthId]);

  const hasUnread = notifications.some(n => !n.isRead);

  return {
    notifications,
    addNotification,
    markAllAsRead,
    hasUnread
  };
};
