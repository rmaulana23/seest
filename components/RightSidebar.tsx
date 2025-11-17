import React from 'react';
import { Post, Activity, User } from '../types';
import { ACTIVITY_CONFIG, ACTIVITIES } from '../constants';
import { useTranslation } from '../contexts/LanguageContext';
import { LayoutGrid } from 'lucide-react';

interface RightSidebarProps {
  posts: Post[];
  users: User[];
  currentUser: User | undefined;
  onViewProfile: (userId: string) => void;
  viewingProfileId: string | null;
  activityFilter: Activity | null;
  onFilterActivity: (activity: Activity | null) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ posts, users, currentUser, onViewProfile, viewingProfileId, activityFilter, onFilterActivity }) => {
  const { t } = useTranslation();

  // FIX: Explicitly type the initial value for `reduce` to fix type inference for the accumulator.
  const trendingActivities = posts.reduce((acc, post) => {
    if (post.postType === 'status') {
      acc[post.activity] = (acc[post.activity] || 0) + 1;
    }
    return acc;
  }, {} as Record<Activity, number>);

  // FIX: Use indexed access for sorting to avoid type inference issues with destructuring in some TypeScript environments.
  // Fix: Explicitly cast array values to numbers during sort comparison to avoid type errors.
  const sortedActivities = Object.entries(trendingActivities).sort((a, b) => (b[1] as number) - (a[1] as number)) as [Activity, number][];

  // --- Activity Match Logic ---
  const yourCurrentActivity = currentUser?.currentActivity;
  
  const matchedUsers = (currentUser && yourCurrentActivity)
    ? users.filter(u => u.id !== currentUser.id && u.id !== 'anonymous' && u.currentActivity === yourCurrentActivity)
    : [];
  
  const activityMatchConfig = yourCurrentActivity ? ACTIVITY_CONFIG[yourCurrentActivity] : null;

  return (
    <aside className="w-80 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-brand-200/50 dark:border-slate-700/50 hidden lg:block sticky top-28 h-[calc(100vh-8rem)] rounded-2xl overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('sidebar.filter.title')}</h4>
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => onFilterActivity(null)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    activityFilter === null
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
                }`}
            >
                <LayoutGrid size={14} />
                <span>{t('sidebar.filter.all')}</span>
            </button>
            {ACTIVITIES.map(act => {
                const config = ACTIVITY_CONFIG[act];
                const isActive = activityFilter === act;
                return (
                    <button
                        key={act}
                        onClick={() => onFilterActivity(act)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            isActive
                            ? `${config.colorClasses}`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        <config.icon size={14} />
                        <span>{t(`activity.${act}` as any)}</span>
                    </button>
                )
            })}
        </div>
      </div>
      
      <div className="mb-8">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('rightSidebar.trending.title')}</h4>
        {sortedActivities.length > 0 ? (
          <ul className="space-y-3">
            {sortedActivities.map(([activity, count]) => {
              const config = ACTIVITY_CONFIG[activity];
              const label = t(`activity.${activity}`);
              return (
                <li key={activity} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`flex items-center justify-center h-7 w-7 rounded-lg ${config.colorClasses}`}>
                      <config.icon size={16} />
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{count}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('rightSidebar.trending.empty')}</p>
        )}
      </div>

      {/* Activity Match Section */}
      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('rightSidebar.match.title')}</h4>
        {yourCurrentActivity && activityMatchConfig ? (
          <div className="bg-brand-50 dark:bg-slate-700/50 p-4 rounded-lg border border-brand-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center">
              <span>{t('rightSidebar.match.yourVibe')}</span>
              {/* FIX: Cast dynamic template literal to 'any' to satisfy translation function's strict key type. */}
              <span className={`ml-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${activityMatchConfig.colorClasses}`}>
                <activityMatchConfig.icon size={12} />
                <span>{t(`activity.${yourCurrentActivity}` as any)}</span>
              </span>
            </p>
            
            {matchedUsers.length > 0 ? (
              <div>
                {/* FIX: Cast dynamic template literal to 'any' to satisfy translation function's strict key type. */}
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('rightSidebar.match.whoIsAlso')} {t(`activity.${yourCurrentActivity}` as any)}:</p>
                <ul className="space-y-2">
                  {matchedUsers.map(friend => {
                    return (
                        <li key={friend.id} className="flex items-center gap-3">
                          <button onClick={() => onViewProfile(friend.id)} className="h-8 w-8 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
                            {friend.avatar}
                          </button>
                          <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">@{friend.name}</span>
                        </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">{t('rightSidebar.match.empty')}</p>
            )}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 dark:text-gray-500 p-4 bg-brand-50 dark:bg-slate-700/50 rounded-lg border border-brand-200 dark:border-slate-700">
            <p>{t('rightSidebar.match.postFirst')}</p>
          </div>
        )}
      </div>
    </aside>
  );
};