import { useState, useEffect, useCallback } from 'react';
import { PrivateMessage } from '../types';
import { CURRENT_USER_ID } from '../constants';

const MESSAGES_STORAGE_KEY = 'seest_messages_v1';

export const usePrivateMessages = () => {
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const saveMessages = useCallback((updatedMessages: PrivateMessage[]) => {
      try {
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
        setMessages(updatedMessages);
      } catch (error) {
          console.error("Failed to save messages to storage", error);
      }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MESSAGES_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setMessages(parsed);
    } catch (error) {
      console.error("Failed to load messages from storage", error);
      setMessages([]);
    }
    setIsLoading(false);
  }, []);

  const addMessage = useCallback((newMessageData: { receiverId: string, text?: string, imageUrl?: string }) => {
    const newMessage: PrivateMessage = {
      id: Date.now(),
      senderId: CURRENT_USER_ID,
      receiverId: newMessageData.receiverId,
      text: newMessageData.text,
      imageUrl: newMessageData.imageUrl,
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, newMessage];
        updatedMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        saveMessages(updatedMessages);
        return updatedMessages;
    });
  }, [saveMessages]);
  
  return { messages, addMessage, isLoading };
};