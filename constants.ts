
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

// Start with empty users for production/fresh start
export const USERS: User[] = [];

// FIX: Export CURRENT_USER_ID to resolve module import errors. 
// In a real app with Supabase, this constant is used less, but kept for legacy type safety in some components.
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

// Updated keys to v3 to clear old data
export const POSTS_STORAGE_KEY = "seest_posts_v3";
export const USERS_STORAGE_KEY = 'seest_users_v3';
export const AUTH_SESSION_KEY = 'seest_auth_session_v3';
export const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const STATUS_BACKGROUNDS = [
    'bg-gradient-to-br from-cyan-400 to-blue-500',
    'bg-gradient-to-br from-pink-400 to-rose-500',
    'bg-gradient-to-br from-green-400 to-teal-500',
    'bg-gradient-to-br from-yellow-400 to-orange-500',
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-slate-600 to-gray-800',
];

// Start with 0 activity
export const SAMPLE_POSTS: Post[] = [];
