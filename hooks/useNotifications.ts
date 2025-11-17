
import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';

const NOTIFICATIONS_KEY = 'seest_notifications_v2';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY);
      if (raw) {
        setNotifications(JSON.parse(raw));
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  }, []);

  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newNotifications));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const hasUnread = notifications.some(n => !n.isRead);

  return {
    notifications,
    addNotification,
    markAllAsRead,
    hasUnread
  };
};
