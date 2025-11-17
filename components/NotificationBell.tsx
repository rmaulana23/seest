
import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification, User } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { formatTimeAgo } from '../utils/time';

interface NotificationBellProps {
    isHeader?: boolean;
    notifications: Notification[];
    users: User[];
    onMarkAllRead: () => void;
    hasUnread: boolean;
    onNotificationClick?: (notification: Notification) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ isHeader, notifications, users, onMarkAllRead, hasUnread, onNotificationClick }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const buttonClasses = isHeader 
        ? "relative p-2.5 text-white hover:bg-white/10 rounded-full transition-colors"
        : "relative p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shadow-sm";

    const toggleOpen = () => {
        if (!isOpen && hasUnread) {
            onMarkAllRead();
        }
        setIsOpen(!isOpen);
    };

    const handleClickItem = (notif: Notification) => {
        if (onNotificationClick) {
            onNotificationClick(notif);
        }
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={toggleOpen}
                className={buttonClasses}
                aria-label="Notifications"
                title="Notifications"
            >
                <Bell size={isHeader ? 22 : 20} />
                {hasUnread && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-yellow-400 border-2 border-brand-600"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-4 right-4 top-20 w-auto md:absolute md:top-full md:right-0 md:w-80 md:mt-2 md:left-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">{t('notifications.title')}</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map(notif => {
                                    const user = users.find(u => u.id === notif.userId);
                                    return (
                                        <div 
                                            key={notif.id} 
                                            onClick={() => handleClickItem(notif)}
                                            className={`p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-brand-50 dark:bg-slate-700/30' : ''}`}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-white border border-brand-200 flex items-center justify-center text-brand-600 font-bold text-xs flex-shrink-0">
                                                {user ? user.avatar : '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                                    <span className="font-semibold">{user ? user.name : 'Unknown'}</span> {notif.text}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(notif.createdAt, t)}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                    {t('notifications.empty')}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
