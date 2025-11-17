

export interface User {
  id: string;
  name: string;
  avatar: string;
  following: string[]; // array of user ids
  followers: string[]; // array of user ids
  bio?: string;
  lastSeen: string; // ISO string
  currentActivity?: Activity;
  savedPostsVisibility?: 'private' | 'public';
  favoritePostIds?: number[];
  email?: string;
  password?: string;
}

export type Activity = "Relaxing" | "Working" | "Vacation" | "Eating" | "Exercise" | "Watching" | "Music" | "Others";

export type Reactions = {
  [userId: string]: string; // emoji
};

export interface Reply {
    userId: string;
    text: string;
}

export interface PostComment {
  id: number;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: number;
  userId: string;
  activity: Activity;
  text: string;
  media: { url: string; type: 'image' | 'video' }[];
  backgroundColor?: string;
  createdAt: string; // ISO string
  reactions: Reactions;
  postType: 'status' | 'ask';
  replies?: Reply[];
  comments?: PostComment[];
  aspectRatio?: 'portrait' | 'landscape';
}

export interface PrivateMessage {
  id: number;
  senderId: string;
  receiverId: string;
  text?: string;
  imageUrl?: string;
  createdAt: string; // ISO string
}

export type Page = "home" | "create" | "profile" | "settings" | "ask" | "privacy" | "terms" | "friends" | "events" | "create-event" | "event-room";

export interface EventMessage {
  id: number;
  speakerId: string;
  audioUrl: string; // base64 data URL
  createdAt: string;
}

export interface Comment {
    id: number;
    userId: string;
    text: string;
    createdAt: string;
}

export interface Event {
  id: number;
  creatorId: string;
  title: string;
  description: string;
  type: 'stand-up' | 'podcast';
  speakers: string[]; // user ids
  listeners: string[]; // user ids
  messages: EventMessage[];
  comments: Comment[];
  pinnedCommentId: number | null;
  moderators: string[];
  mutedSpeakers: string[];
  status: 'live' | 'ended';
  createdAt: string;
  coverImage?: string;
}

export interface Notification {
  id: string;
  userId: string; // The user who performed the action
  type: 'like' | 'comment' | 'follow' | 'mention';
  text: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: number | string; // Post ID or User ID
}
