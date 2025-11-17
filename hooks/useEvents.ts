
import { useState, useEffect, useCallback } from 'react';
import { Event, EventMessage, Comment } from '../types';
import { CURRENT_USER_ID } from '../constants';

const EVENTS_STORAGE_KEY = 'seest_events_v2';

const getEventsFromStorage = (): Event[] => {
    try {
        const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
        const events = raw ? JSON.parse(raw) : [];
        return events.filter((e: Event) => e.status === 'live');
    } catch (error) {
        console.error("Failed to load events from storage", error);
        return [];
    }
};

const saveEventsToStorage = (events: Event[]) => {
    try {
        const liveEvents = events.filter(e => e.status === 'live');
        liveEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(liveEvents));
    } catch (error) {
        console.error("Failed to save events to storage", error);
    }
};


export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to load events from storage on mount
  useEffect(() => {
    setEvents(getEventsFromStorage());
    setIsLoading(false);
  }, []);

  // Effect for polling and cross-tab sync
  useEffect(() => {
      const syncEvents = () => setEvents(getEventsFromStorage());

      const handleStorageChange = (e: StorageEvent) => {
          if (e.key === EVENTS_STORAGE_KEY) {
              syncEvents();
          }
      };

      window.addEventListener('storage', handleStorageChange);
      const intervalId = setInterval(syncEvents, 2000); // Poll every 2 seconds

      return () => {
          window.removeEventListener('storage', handleStorageChange);
          clearInterval(intervalId);
      };
  }, []);

  const updateEvents = (updater: (currentEvents: Event[]) => Event[]) => {
      const currentEvents = getEventsFromStorage();
      const newEvents = updater(currentEvents);
      saveEventsToStorage(newEvents);
      setEvents(newEvents.filter(e => e.status === 'live'));
  };

  const addEvent = useCallback((eventData: { title: string; description: string; type: 'stand-up' | 'podcast'; speakers: string[]; coverImage?: string; }) => {
    const newEvent: Event = {
      id: Date.now(),
      creatorId: CURRENT_USER_ID,
      title: eventData.title,
      description: eventData.description,
      type: eventData.type,
      speakers: [CURRENT_USER_ID, ...eventData.speakers],
      listeners: [],
      messages: [],
      comments: [],
      pinnedCommentId: null,
      moderators: [],
      mutedSpeakers: [],
      status: 'live',
      createdAt: new Date().toISOString(),
      coverImage: eventData.coverImage,
    };
    
    updateEvents(currentEvents => [...currentEvents, newEvent]);
    return newEvent;
  }, []);

  const endEvent = useCallback((eventId: number) => {
    updateEvents(currentEvents =>
        currentEvents.map(e => e.id === eventId ? { ...e, status: 'ended' as 'ended' } : e)
    );
  }, []);

  const joinEvent = useCallback((eventId: number) => {
      updateEvents(currentEvents =>
          currentEvents.map(event => {
              if (event.id === eventId) {
                  const newListeners = [...new Set([...event.listeners, CURRENT_USER_ID])];
                  return { ...event, listeners: newListeners };
              }
              return event;
          })
      );
  }, []);
  
  const leaveEvent = useCallback((eventId: number) => {
       updateEvents(currentEvents =>
          currentEvents.map(event => {
              if (event.id === eventId) {
                  const newListeners = event.listeners.filter(id => id !== CURRENT_USER_ID);
                  return { ...event, listeners: newListeners };
              }
              return event;
          })
      );
  }, []);

  const addComment = useCallback((eventId: number, text: string) => {
    const newComment: Comment = {
        id: Date.now(),
        userId: CURRENT_USER_ID,
        text,
        createdAt: new Date().toISOString(),
    };
    updateEvents(currentEvents =>
        currentEvents.map(event => {
            if (event.id === eventId) {
                return { ...event, comments: [...(event.comments || []), newComment] };
            }
            return event;
        })
    );
  }, []);

  const deleteComment = useCallback((eventId: number, commentId: number) => {
    updateEvents(currentEvents =>
        currentEvents.map(event => {
            if (event.id === eventId) {
                const newComments = (event.comments || []).filter(c => c.id !== commentId);
                const newPinnedId = event.pinnedCommentId === commentId ? null : event.pinnedCommentId;
                return { ...event, comments: newComments, pinnedCommentId: newPinnedId };
            }
            return event;
        })
    );
  }, []);

  const pinComment = useCallback((eventId: number, commentId: number | null) => {
    updateEvents(currentEvents =>
        currentEvents.map(event => {
            if (event.id === eventId) {
                const newPinnedId = event.pinnedCommentId === commentId ? null : commentId;
                return { ...event, pinnedCommentId: newPinnedId };
            }
            return event;
        })
    );
  }, []);

  const toggleModerator = useCallback((eventId: number, userId: string) => {
    updateEvents(currentEvents =>
        currentEvents.map(event => {
            if (event.id === eventId) {
                const moderators = event.moderators || [];
                const isMod = moderators.includes(userId);
                const newModerators = isMod 
                    ? moderators.filter(id => id !== userId)
                    : [...moderators, userId];
                return { ...event, moderators: newModerators };
            }
            return event;
        })
    );
  }, []);
  
  const toggleMuteSpeaker = useCallback((eventId: number, speakerId: string) => {
    updateEvents(currentEvents =>
        currentEvents.map(event => {
            if (event.id === eventId) {
                const muted = event.mutedSpeakers || [];
                const isMuted = muted.includes(speakerId);
                const newMutedSpeakers = isMuted
                    ? muted.filter(id => id !== speakerId)
                    : [...muted, speakerId];
                return { ...event, mutedSpeakers: newMutedSpeakers };
            }
            return event;
        })
    );
  }, []);

  return { events, addEvent, endEvent, joinEvent, leaveEvent, addComment, deleteComment, pinComment, toggleModerator, toggleMuteSpeaker, isLoading };
};
