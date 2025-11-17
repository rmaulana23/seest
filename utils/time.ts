import { TTL_MS } from '../constants';

type TranslationFunction = (key: string, options?: Record<string, string | number>) => string;

export function formatTimeAgo(isoString: string, t: TranslationFunction): string {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return t('time.now');
  }

  let interval = seconds / 31536000;
  if (interval > 1) {
    const years = Math.floor(interval);
    return `${years} ${t(years === 1 ? 'time.year' : 'time.years')}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const months = Math.floor(interval);
    return `${months} ${t(months === 1 ? 'time.month' : 'time.months')}`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return `${days} ${t(days === 1 ? 'time.day' : 'time.days')}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    return `${hours} ${t(hours === 1 ? 'time.hour' : 'time.hours')}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return `${minutes} ${t(minutes === 1 ? 'time.min' : 'time.mins')}`;
  }
  return t('time.now');
}

export function formatLastSeen(isoString: string, t: TranslationFunction): string {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5 * 60) { // Less than 5 minutes is considered 'active now'
    return t('time.activeNow');
  }

  return `${t('profile.lastSeen')} ${formatTimeAgo(isoString, t)}`;
}

export function getExpiryHours(isoString: string): number {
  const timePassed = Date.now() - new Date(isoString).getTime();
  const timeLeft = TTL_MS - timePassed;
  return Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60)));
}