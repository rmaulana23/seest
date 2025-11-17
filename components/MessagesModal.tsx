import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, PrivateMessage } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { X, MessageSquare, Users as UsersIcon } from 'lucide-react';
import { formatTimeAgo } from '../utils/time';

interface MessagesModalProps {
  currentUser: User;
  allUsers: User[];
  messages: PrivateMessage[];
  mutualFriends: User[];
  onOpenChat: (user: User) => void;
  onClose: () => void;
}

const TabButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold transition-colors ${
            isActive
                ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent'
        }`}
    >
        {icon}
        {label}
    </button>
)

export const MessagesModal: React.FC<MessagesModalProps> = ({ currentUser, allUsers, messages, mutualFriends, onOpenChat, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');

  const chatPartners = useMemo(() => {
    const conversations: { [userId: string]: PrivateMessage } = {};

    messages.forEach(msg => {
        const otherUserId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
        if (!conversations[otherUserId] || new Date(msg.createdAt) > new Date(conversations[otherUserId].createdAt)) {
            conversations[otherUserId] = msg;
        }
    });

    const sortedPartnerIds = Object.keys(conversations).sort((a, b) => 
        new Date(conversations[b].createdAt).getTime() - new Date(conversations[a].createdAt).getTime()
    );

    return sortedPartnerIds.map(id => {
        const user = allUsers.find(u => u.id === id);
        return user ? { user, lastMessage: conversations[id] } : null;
    }).filter((item): item is { user: User, lastMessage: PrivateMessage } => !!item);

  }, [messages, currentUser, allUsers]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-md w-full h-[70vh] mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col"
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('messages.title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </header>

        <div className="flex border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <TabButton icon={<MessageSquare size={16}/>} label={t('messages.chats')} isActive={activeTab === 'chats'} onClick={() => setActiveTab('chats')} />
          <TabButton icon={<UsersIcon size={16}/>} label={t('messages.friends')} isActive={activeTab === 'friends'} onClick={() => setActiveTab('friends')} />
        </div>
        
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'chats' && (
                    chatPartners.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-slate-700">
                            {chatPartners.map(({ user, lastMessage }) => (
                                <button key={user.id} onClick={() => onOpenChat(user)} className="w-full text-left flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="h-12 w-12 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-xl flex-shrink-0">{user.avatar}</div>
                                    <div className="flex-grow overflow-hidden">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-bold text-gray-800 dark:text-gray-100 truncate">@{user.name}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{formatTimeAgo(lastMessage.createdAt, t)}</p>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {lastMessage.senderId === currentUser.id ? `${t('post.user.you')}: ` : ''}
                                            {lastMessage.text || (lastMessage.imageUrl ? 'Sent an image' : '')}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-12 text-gray-500 dark:text-gray-400">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4"/>
                            <h3 className="text-lg font-semibold">{t('messages.empty.chats')}</h3>
                        </div>
                    )
                )}

                {activeTab === 'friends' && (
                    mutualFriends.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-slate-700">
                            {mutualFriends.map(friend => (
                                <div key={friend.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-xl flex-shrink-0">{friend.avatar}</div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100">@{friend.name}</p>
                                    </div>
                                    <button onClick={() => onOpenChat(friend)} className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors shadow-sm">
                                        {t('messages.startChat')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-12 text-gray-500 dark:text-gray-400">
                            <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4"/>
                            <h3 className="text-lg font-semibold">{t('messages.empty.friends')}</h3>
                        </div>
                    )
                )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};