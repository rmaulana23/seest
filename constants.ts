import React from 'react';
import { Post, Activity, User } from './types';
import { Coffee, Briefcase, Palmtree, UtensilsCrossed, Dumbbell, Clapperboard, Music, MoreHorizontal } from 'lucide-react';

export const ACTIVITIES: Activity[] = ["Relaxing", "Working", "Vacation", "Eating", "Exercise", "Watching", "Music", "Others"];

type ActivityConfig = {
    [key in Activity]: {
        icon: React.ElementType;
        colorClasses: string;
    }
}

export const USERS: User[] = [
  { id: 'user-you', name: 'You', avatar: 'Y', email: 'you@seest.com', password: 'password123', following: ['user-rina', 'user-dimas', 'user-mila'], followers: ['user-rina'], bio: 'Just a person enjoying the little things in life. Let\'s connect!', lastSeen: new Date().toISOString(), currentActivity: 'Watching', savedPostsVisibility: 'private', favoritePostIds: [2, 4] },
  { id: 'user-rina', name: 'Rina', avatar: 'R', email: 'rina@seest.com', password: 'password123', following: ['user-you', 'user-mila'], followers: ['user-you', 'user-dimas'], bio: 'Coffee enthusiast and book lover. Currently exploring the world one page at a time.', lastSeen: new Date(Date.now() - 4 * 60 * 1000).toISOString(), currentActivity: 'Relaxing', savedPostsVisibility: 'private', favoritePostIds: [] },
  { id: 'user-dimas', name: 'Dimas', avatar: 'D', email: 'dimas@seest.com', password: 'password123', following: ['user-rina'], followers: ['user-you'], bio: 'Tech geek, night owl, and aspiring photographer. Capturing moments in code and pixels.', lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), currentActivity: 'Working', savedPostsVisibility: 'public', favoritePostIds: [1] },
  { id: 'user-mila', name: 'Mila', avatar: 'M', email: 'mila@seest.com', password: 'password123', following: [], followers: ['user-you', 'user-rina'], bio: 'Mountain trails are my happy place. Always planning the next adventure.', lastSeen: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), currentActivity: 'Vacation', savedPostsVisibility: 'private', favoritePostIds: [] },
  { id: 'user-andi', name: 'Andi', avatar: 'A', email: 'andi@seest.com', password: 'password123', following: [], followers: [], bio: 'Foodie on a mission to find the best street food. Any recommendations?', lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), currentActivity: 'Eating', savedPostsVisibility: 'private', favoritePostIds: [] },
  { id: 'user-citra', name: 'Citra', avatar: 'C', email: 'citra@seest.com', password: 'password123', following: [], followers: [], bio: 'Film buff and pop culture expert. Let\'s talk movies!', lastSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), currentActivity: 'Watching', savedPostsVisibility: 'private', favoritePostIds: [] },
  { id: 'user-dandi', name: 'Dandi', avatar: 'D', email: 'dandi@seest.com', password: 'password123', following: [], followers: [], bio: 'Music is my escape. Share your favorite playlist with me!', lastSeen: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), currentActivity: 'Music', savedPostsVisibility: 'private', favoritePostIds: [] },
  { id: 'anonymous', name: 'Anonymous', avatar: '?', email: 'anonymous@seest.com', password: 'password123', following: [], followers: [], lastSeen: new Date().toISOString(), savedPostsVisibility: 'private', favoritePostIds: [] },
  { id: 'user-dummy', name: 'Dummy User', avatar: 'D', email: 'user@seest.com', password: 'password123', following: ['user-rina'], followers: [], bio: 'This is a dummy account for login.', lastSeen: new Date().toISOString(), currentActivity: 'Relaxing', savedPostsVisibility: 'private', favoritePostIds: [] },
];

// FIX: Export CURRENT_USER_ID to resolve module import errors.
export const CURRENT_USER_ID = 'user-you';

export const ACTIVITY_CONFIG: ActivityConfig = {
    "Relaxing": { icon: Coffee, colorClasses: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
    "Working": { icon: Briefcase, colorClasses: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200" },
    "Vacation": { icon: Palmtree, colorClasses: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    "Eating": { icon: UtensilsCrossed, colorClasses: "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200" },
    "Exercise": { icon: Dumbbell, colorClasses: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200" },
    "Watching": { icon: Clapperboard, colorClasses: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
    "Music": { icon: Music, colorClasses: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
    "Others": { icon: MoreHorizontal, colorClasses: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200" },
};

export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];
export const POSTS_STORAGE_KEY = "seest_v1_posts";
export const USERS_STORAGE_KEY = 'seest_users_v1';
export const AUTH_SESSION_KEY = 'seest_auth_session_v1';
export const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const STATUS_BACKGROUNDS = [
    'bg-gradient-to-br from-cyan-400 to-blue-500',
    'bg-gradient-to-br from-pink-400 to-rose-500',
    'bg-gradient-to-br from-green-400 to-teal-500',
    'bg-gradient-to-br from-yellow-400 to-orange-500',
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-slate-600 to-gray-800',
];

export const SAMPLE_POSTS: Post[] = [
  {
    id: 1,
    userId: "user-rina",
    activity: "Relaxing",
    text: "Santai sore ditemani buku bagus & kopi. Hari yang sempurna ☕️",
    media: [{ url: "https://picsum.photos/800/600?random=1", type: "image"}],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reactions: { "user-dimas": "👍", "user-mila": "❤️", "user-you": "👍" },
    postType: 'status',
    aspectRatio: 'landscape',
    comments: [],
  },
  {
    id: 8,
    userId: "anonymous",
    activity: "Working",
    text: "Ada rekomendasi tempat WFC yang enak di Jakarta Selatan? Butuh suasana baru nih.",
    media: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reactions: { "user-rina": "👍", "user-you": "👍" },
    postType: 'ask',
    replies: [
        { userId: 'user-dimas', text: 'Banyak sih, coba deh di daerah Senopati, banyak pilihan.'},
        { userId: 'user-rina', text: 'Setuju! Atau kalau mau yang lebih tenang, bisa coba di Cikajang.'},
    ],
    comments: [],
  },
  {
    id: 9,
    userId: "anonymous",
    activity: "Others",
    text: "Rekomendasi film horor yang beneran serem dong, tapi jangan yang jumpscare-nya murahan.",
    media: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reactions: { "user-citra": "👍" },
    postType: 'ask',
    replies: [
        { userId: 'user-citra', text: 'Coba nonton The Wailing (2016), horor Korea, ceritanya dalem banget.'},
    ],
    comments: [],
  },
  {
    id: 2,
    userId: "user-dimas",
    activity: "Working",
    text: "Kerja lembur selesai. Pemandangan kota dari atas sini estetik banget. #devcore",
    media: [{ url: "https://picsum.photos/600/800?random=2", type: "image"}],
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    reactions: { "user-rina": "❤️", "user-you": "👍" },
    postType: 'status',
    aspectRatio: 'portrait',
    comments: [],
  },
  {
    id: 3,
    userId: "user-mila",
    activity: "Vacation",
    text: "Pendakian tadi seru banget! Pemandangannya? Juara. Berasa jadi karakter utama.",
    media: [],
    backgroundColor: STATUS_BACKGROUNDS[4],
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    reactions: { "user-you": "❤️", "user-rina": "😮" },
    postType: 'status',
    comments: [],
  },
  {
    id: 4,
    userId: "user-andi",
    activity: "Eating",
    text: "Video pemandangan dari drone! Keren banget.",
    media: [{ url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", type: "video"}],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    reactions: { "user-mila": "👍", "user-dimas": "👍" },
    postType: 'status',
    aspectRatio: 'landscape',
    comments: [],
  },
  {
    id: 5,
    userId: "user-citra",
    activity: "Watching",
    text: "Lagi maraton nonton serial favorit musim terbaru. Tidur itu untuk yang lemah 🍿",
    media: [
      { url: "https://picsum.photos/800/500?random=5", type: "image"},
      { url: "https://picsum.photos/800/500?random=6", type: "image"},
      { url: "https://picsum.photos/800/500?random=9", type: "image"},
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reactions: { "user-you": "😂", "user-dimas": "❤️" },
    postType: 'status',
    aspectRatio: 'landscape',
    comments: [],
  },
  {
    id: 6,
    userId: "user-dummy",
    activity: "Watching",
    text: "Mulai nonton serial sci-fi baru yang lagi heboh dibicarain!",
    media: [],
    backgroundColor: STATUS_BACKGROUNDS[0],
    createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    reactions: { "user-rina": "😮" },
    postType: 'status',
    comments: [],
  },
  {
    id: 7,
    userId: "user-dandi",
    activity: "Watching",
    text: "Malam mingguan! Nonton film klasik.",
    media: [{ url: "https://picsum.photos/800/550?random=7", type: "image"}],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    reactions: { "user-mila": "👍" },
    postType: 'status',
    aspectRatio: 'landscape',
    comments: [],
  },
];