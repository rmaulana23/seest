
import { useState, useEffect, useCallback } from 'react';
import { PrivateMessage } from '../types';
import { supabase } from '../lib/supabase';

export const usePrivateMessages = () => {
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
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

  const fetchMessages = useCallback(async () => {
      if (!currentAuthId) return;
      setIsLoading(true);
      
      // Fetch messages where current user is sender OR receiver
      const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${currentAuthId},receiver_id.eq.${currentAuthId}`)
          .order('created_at', { ascending: true });

      if (error) {
          console.error("Error fetching messages:", error);
      } else if (data) {
          const mappedMessages: PrivateMessage[] = data.map((m: any) => ({
              id: m.id,
              senderId: m.sender_id,
              receiverId: m.receiver_id,
              text: m.text,
              imageUrl: m.image_url,
              createdAt: m.created_at
          }));
          setMessages(mappedMessages);
      }
      setIsLoading(false);
  }, [currentAuthId]);

  useEffect(() => {
      fetchMessages();

      if (!currentAuthId) return;

      // Subscribe to new messages relevant to this user
      const sub = supabase
          .channel('public:messages')
          .on('postgres_changes', 
              { 
                  event: 'INSERT', 
                  schema: 'public', 
                  table: 'messages',
                  // Filter is tricky with OR logic in realtime, so we filter in callback or subscribe generally
                  // Ideally: filter: `receiver_id=eq.${currentAuthId}` AND another sub for sender_id
                  // For simplicity/reliability in this setup, we subscribe to all inserts and filter in JS
              }, 
              (payload) => {
                  const newMsg = payload.new as any;
                  if (newMsg.sender_id === currentAuthId || newMsg.receiver_id === currentAuthId) {
                      const mapped: PrivateMessage = {
                          id: newMsg.id,
                          senderId: newMsg.sender_id,
                          receiverId: newMsg.receiver_id,
                          text: newMsg.text,
                          imageUrl: newMsg.image_url,
                          createdAt: newMsg.created_at
                      };
                      setMessages(prev => [...prev, mapped]);
                  }
              }
          )
          .subscribe();

      return () => { supabase.removeChannel(sub); };
  }, [fetchMessages, currentAuthId]);

  const addMessage = useCallback(async (newMessageData: { receiverId: string, text?: string, imageUrl?: string }) => {
    if (!currentAuthId) return;

    const payload = {
        sender_id: currentAuthId,
        receiver_id: newMessageData.receiverId,
        text: newMessageData.text,
        image_url: newMessageData.imageUrl,
    };

    try {
        const { error } = await supabase.from('messages').insert(payload);
        if (error) throw error;
        // Realtime subscription will update the UI
    } catch (error) {
        console.error("Failed to send message:", error);
        alert("Gagal mengirim pesan.");
    }
  }, [currentAuthId]);
  
  return { messages, addMessage, isLoading };
};
