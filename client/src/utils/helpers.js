export const formatDate = (date) => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString().split('T')[0];
};

export const formatDisplayDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatFullDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

export const getDateRange = (days) => {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
};

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    slots.push(time);
  }
  return slots;
};

export const STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  INCOMPLETE: 'incomplete'
};

export const STATUS_ORDER = [
  STATUS.NOT_STARTED,
  STATUS.IN_PROGRESS,
  STATUS.COMPLETED,
  STATUS.INCOMPLETE
];

export const STATUS_NEXT = {
  [STATUS.NOT_STARTED]: STATUS.IN_PROGRESS,
  [STATUS.IN_PROGRESS]: STATUS.COMPLETED,
  [STATUS.COMPLETED]: STATUS.INCOMPLETE,
  [STATUS.INCOMPLETE]: STATUS.NOT_STARTED
};

export const getStatusIcon = (status) => {
  switch (status) {
    case STATUS.COMPLETED: return '✓';
    case STATUS.IN_PROGRESS: return '⟳';
    case STATUS.INCOMPLETE: return '✕';
    default: return '○';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case STATUS.COMPLETED: return 'Completed';
    case STATUS.IN_PROGRESS: return 'Working';
    case STATUS.INCOMPLETE: return 'Incomplete';
    default: return 'Not Started';
  }
};

export const getSuccessColor = (rate) => {
  if (rate >= 80) return 'text-emerald-400';
  if (rate >= 50) return 'text-amber-400';
  return 'text-red-400';
};

export const getSuccessBgColor = (rate) => {
  if (rate >= 80) return 'bg-emerald-500/20';
  if (rate >= 50) return 'bg-amber-500/20';
  return 'bg-red-500/20';
};

export const getHeatmapColor = (rate) => {
  if (rate >= 80) return 'var(--success)';
  if (rate >= 50) return 'var(--warning)';
  if (rate > 0) return 'var(--danger)';
  return 'var(--bg-elevated)';
};

export const calculateSuccessRate = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === STATUS.COMPLETED).length;
  return Math.round((completed / tasks.length) * 100);
};

export const calculateStatusBreakdown = (tasks) => {
  const breakdown = {
    completed: 0,
    in_progress: 0,
    incomplete: 0,
    not_started: 0
  };
  if (!tasks) return breakdown;
  tasks.forEach(t => {
    if (breakdown[t.status] !== undefined) breakdown[t.status]++;
  });
  return breakdown;
};

export const getMoodEmoji = (mood) => {
  switch (mood) {
    case 'happy': return '😊';
    case 'neutral': return '😐';
    case 'sad': return '😞';
    default: return '';
  }
};

export const getSpecialDay = (dateStr) => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const specialDays = {
    '1-1': { name: "New Year's Day", emoji: '🎉', color: 'from-red-500 to-pink-500' },
    '1-26': { name: "Republic Day", emoji: '🇮🇳', color: 'from-orange-500 to-yellow-500' },
    '2-14': { name: "Valentine's Day", emoji: '❤️', color: 'from-pink-500 to-red-500' },
    '3-8': { name: "Women's Day", emoji: '🌸', color: 'from-pink-400 to-purple-400' },
    '4-1': { name: "April Fools'", emoji: '😜', color: 'from-purple-500 to-pink-500' },
    '5-1': { name: "Labour Day", emoji: '🔧', color: 'from-red-500 to-orange-500' },
    '6-5': { name: "Environment Day", emoji: '🌍', color: 'from-green-500 to-teal-500' },
    '8-15': { name: "Independence Day", emoji: '🇮🇳', color: 'from-orange-500 to-green-500' },
    '10-2': { name: "Gandhi Jayanti", emoji: '🕊️', color: 'from-green-500 to-teal-500' },
    '10-31': { name: "Halloween", emoji: '🎃', color: 'from-orange-600 to-purple-600' },
    '12-25': { name: "Christmas", emoji: '🎄', color: 'from-green-500 to-red-500' },
    '12-31': { name: "New Year's Eve", emoji: '🎆', color: 'from-purple-500 to-pink-500' },
  };

  const key = `${month}-${day}`;
  return specialDays[key] || null;
};

export const getDayInfo = (dateStr) => {
  const date = new Date(dateStr);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const specialDay = getSpecialDay(dateStr);
  
  return {
    weekday,
    specialDay,
    isWeekend: date.getDay() === 0 || date.getDay() === 6,
    isToday: dateStr === getToday()
  };
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getNextSuggestedTask = (tasks) => {
  if (!tasks || tasks.length === 0) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (timeSlot) => {
    const [h, m] = timeSlot.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const pending = tasks
    .filter(t => t.status === STATUS.NOT_STARTED || t.status === STATUS.IN_PROGRESS)
    .sort((a, b) => toMinutes(a.timeSlot) - toMinutes(b.timeSlot));

  if (pending.length === 0) return null;

  const upcoming = pending.find(t => toMinutes(t.timeSlot) >= currentMinutes);
  return upcoming || pending[0];
};
