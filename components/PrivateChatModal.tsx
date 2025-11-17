import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, PrivateMessage } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { X, Send, Image as ImageIcon } from 'lucide-react';
import { formatTimeAgo } from '../utils/time';

interface PrivateChatModalProps {
  currentUser: User;
  targetUser: User;
  messages: PrivateMessage[];
  onSendMessage: (message: { receiverId: string; text?: string; imageUrl?: string }) => void;
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const PrivateChatModal: React.FC<PrivateChatModalProps> = ({ currentUser, targetUser, messages, onSendMessage, onClose }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage({ receiverId: targetUser.id, text });
      setText('');
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
          try {
              const base64 = await fileToBase64(files[0]);
              onSendMessage({ receiverId: targetUser.id, imageUrl: base64 });
          } catch (error) {
              console.error("Error converting file", error);
              alert("Could not upload image.");
          }
      }
      if(fileInputRef.current) fileInputRef.current.value = "";
  };

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
        className="max-w-md w-full h-[80vh] mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col"
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-lg">
                {targetUser.avatar}
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {t('chat.title', { user: targetUser.name })}
              </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </header>

        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4">
          {messages.map(msg => {
            const isSent = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isSent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl ${isSent ? 'bg-brand-600 text-white rounded-br-md' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-md'}`}>
                  {msg.text && <p className="text-sm">{msg.text}</p>}
                  {msg.imageUrl && <img src={msg.imageUrl} alt="chat attachment" className="rounded-lg max-w-full h-auto mt-1" />}
                  <p className={`text-xs mt-1 ${isSent ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'} text-right`}>
                      {formatTimeAgo(msg.createdAt, t)}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <button type="button" title={t('chat.uploadImage')} onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <ImageIcon size={20} />
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-grow border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400 dark:focus:ring-brand-500 dark:focus:border-brand-500 transition-shadow dark:text-gray-200"
            />
            <button type="submit" title={t('chat.send')} className="p-2.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors disabled:bg-brand-400 disabled:cursor-not-allowed" disabled={!text.trim()}>
              <Send size={20} />
            </button>
          </form>
        </footer>
      </motion.div>
    </motion.div>
  );
};
