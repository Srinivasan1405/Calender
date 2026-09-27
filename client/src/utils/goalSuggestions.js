const MONTHLY_SUGGESTIONS = [
  'Read 4 books this month',
  'Exercise 3 times per week',
  'Save 10% of monthly income',
  'Meditate 10 minutes daily',
  'Drink 8 glasses of water daily',
  'Sleep 7-8 hours per night',
  'Write in a journal every day',
  'Learn 10 new words per week',
  'Reduce screen time by 1 hour',
  'Cook meals at home 5 days a week',
  'Practice a musical instrument 30min daily',
  'Walk 10,000 steps daily',
  'Spend 30 minutes on a hobby daily',
  'Call a family member weekly',
  'Complete one online course',
];

const YEARLY_SUGGESTIONS = [
  'Get a promotion or new job',
  'Travel to 3 new places',
  'Run a marathon or half-marathon',
  'Learn a new language basics',
  'Save $5,000 for emergency fund',
  'Start a side business',
  'Volunteer for 50 hours',
  'Complete a professional certification',
  'Read 24 books this year',
  'Improve credit score by 100 points',
  'Build a daily meditation habit',
  'Renovate or organize home space',
  'Grow social media following to 10K',
  'Complete a 30-day fitness challenge',
  'Write and publish 12 blog posts',
];

export function getSuggestions(type) {
  return type === 'yearly' ? [...YEARLY_SUGGESTIONS] : [...MONTHLY_SUGGESTIONS];
}

export function getRandomSuggestions(type, count = 5) {
  const pool = type === 'yearly' ? YEARLY_SUGGESTIONS : MONTHLY_SUGGESTIONS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
