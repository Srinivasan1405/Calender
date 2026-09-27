import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatAPI } from '../utils/api';

const IMPROVEMENT_TIPS = [
  "💡 Tip: Try completing your tasks before noon for an early bird XP bonus!",
  "🔥 Keep your streak alive — consistency builds powerful habits!",
  "🎯 Set one small goal each day. Tiny wins add up to big results!",
  "🧠 Review your Insights page to find your most productive time slots.",
  "📊 Check your Analytics weekly to track your progress trend.",
  "⏰ Use Focus mode for deep work — 25 min sprints boost concentration.",
  "🌟 You earn +10 XP for every completed task. Keep going!",
  "📅 Planning your week ahead on the Calendar helps you stay organized.",
  "💪 Don't break the chain — mark tasks complete every day!",
  "🎯 Focus on 3 key habits max when starting out for better consistency.",
  "🌅 Morning hours are often the most productive. Try a morning routine!",
  "📝 Writing down your goals makes you 42% more likely to achieve them.",
  "⚡ Take a 5-min break between focus sessions to recharge.",
  "🎉 Celebrate small wins — every completed task moves you forward!",
  "🔄 If you miss a day, just restart. Progress isn't about perfection!",
];

const QUICK_ACTIONS = [
  { label: 'How do habits work?', query: 'How do habits and routines work in this app?' },
  { label: 'How to earn XP?', query: 'How can I earn XP and level up?' },
  { label: 'Change theme?', query: 'How do I change the theme?' },
  { label: 'Focus mode tips', query: 'How does the focus timer work?' },
];

const FAQ_RESPONSES = [
  { keywords: ['habit', 'routine', 'task', 'template'], response: "Habits are your daily tasks! Go to the Habits page to view and manage your daily routine. You can click the status circle to cycle through: Not Started -> Working -> Completed -> Incomplete. You can edit your default template by clicking 'Edit Template' so new days start with your preferred tasks." },
  { keywords: ['xp', 'experience', 'level', 'level up', 'points'], response: "You earn +10 XP for each completed task! Complete tasks before noon to earn an extra +5 XP early bird bonus. Focus sessions also grant XP (15-30 per session). As you earn XP, your level increases and you unlock more badges!" },
  { keywords: ['theme', 'dark', 'light', 'eye protector', 'color'], response: "Click the theme button in the top navigation bar to cycle through 3 themes: Dark (default, purple vibes), Light (warm orange), Eye Protector (teal green, easy on eyes). Your preference is saved automatically." },
  { keywords: ['focus', 'pomodoro', 'timer', 'session'], response: "The Focus Mode page has a Pomodoro timer with 25 min, 50 min, and custom options. Click Start to begin a session — the timer counts down and rewards XP on completion. Track your daily focus minutes in the stats panel!" },
  { keywords: ['goal', 'goals', 'target', 'objective'], response: "Set monthly and yearly goals on the Goals page! Drag the slider to update your progress percentage. Goals help you track long-term achievements beyond daily habits." },
  { keywords: ['analytics', 'chart', 'graph', 'heatmap', 'statistics'], response: "The Analytics page shows your performance with line charts (daily success rate), bar charts (weekly comparison), pie charts (completion breakdown), and a 90-day calendar heatmap. Great for spotting trends!" },
  { keywords: ['insight', 'predict', 'suggestion', 'recommend'], response: "The Insights page analyzes your performance patterns and gives smart suggestions. It shows which days and times you're most productive, and offers predictions to help you improve." },
  { keywords: ['streak', 'consecutive', 'days in a row'], response: "Streaks track consecutive days where you achieve 80%+ task completion. The longer your streak, the more badges you unlock! Week Warrior (7 days), Month Master (30 days), and more!" },
  { keywords: ['badge', 'achievement', 'award'], response: "Badges are earned by reaching milestones: First Step (first task), Early Bird (before 7 AM), Week Streak, Month Master, Perfect Day (all tasks done), Task Master (100 tasks), and more! Check them in the Gamification panel." },
  { keywords: ['calendar', 'event', 'plan', 'schedule'], response: "The Calendar page lets you plan events with categories (Work, Personal, Study, Birthday). Click a date to add events, and use the search to find past events." },
  { keywords: ['login', 'register', 'sign up', 'account', 'password'], response: "Create an account on the Register page, then log in with your email and password. Demo account: demo@example.com / demo123. Your data is saved securely." },
  { keywords: ['profile', 'name', 'email', 'user'], response: "Your Profile page shows your account details, XP, level, and creation date. You can update your name and other settings there." },
  { keywords: ['dashboard', 'home', 'overview'], response: "The Dashboard gives you a daily overview: today's tasks, success rate, streaks, notes, recent goals, and quick-add for new tasks. It's your command center!" },
  { keywords: ['delete', 'remove', 'clear'], response: "To delete a task, click the delete icon next to it. To delete a goal, use the delete option on the Goals page. Deletions are permanent." },
  { keywords: ['export', 'csv', 'download', 'backup'], response: "Export your data as CSV from the settings area. You can export tasks, notes, and a summary of your performance." },
];

const getLocalResponse = (query) => {
  const lower = query.toLowerCase();
  for (const faq of FAQ_RESPONSES) {
    for (const keyword of faq.keywords) {
      if (lower.includes(keyword)) {
        return faq.response;
      }
    }
  }
  return null;
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your RoutineRise AI assistant. Ask me anything about the app — habits, XP, goals, focus mode, themes, and more!" }
  ]);
  const [input, setInput] = useState('');
  const [showActions, setShowActions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState(null);
  const prevOpen = useRef(false);
  const tipTimer = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  const resetChat = useCallback(() => {
    setMessages([
      { role: 'ai', text: "Hi! I'm your RoutineRise AI assistant. Ask me anything about the app or any general questions!" }
    ]);
    setInput('');
    setShowActions(true);
  }, []);

  const showImprovementTip = useCallback(() => {
    const randomTip = IMPROVEMENT_TIPS[Math.floor(Math.random() * IMPROVEMENT_TIPS.length)];
    setTip(randomTip);
    if (tipTimer.current) clearTimeout(tipTimer.current);
    tipTimer.current = setTimeout(() => setTip(null), 6000);
  }, []);

  useEffect(() => {
    if (prevOpen.current && !isOpen) {
      resetChat();
      showImprovementTip();
    }
    prevOpen.current = isOpen;
  }, [isOpen, resetChat, showImprovementTip]);

  useEffect(() => {
    if (isOpen) setTip(null);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (tipTimer.current) clearTimeout(tipTimer.current);
    };
  }, []);

  const handleSend = async (text) => {
    const query = text || input;
    if (!query.trim() || loading) return;
    setShowActions(false);
    setLoading(true);
    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const localReply = getLocalResponse(query);
    if (localReply) {
      await new Promise(r => setTimeout(r, 400));
      setMessages(prev => [...prev, { role: 'ai', text: localReply }]);
      setLoading(false);
      setShowActions(true);
      return;
    }

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));
      const res = await chatAPI.send(query, history);
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev,     { role: 'ai', text: "I'm not sure about that yet, but I can help with: habits, XP, goals, focus mode, themes, streaks, badges, calendar, analytics, and more! Try one of the quick actions above." }]);
    } finally {
      setLoading(false);
      setShowActions(true);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-14 h-14 rounded-full text-white hover:scale-105 transition-all z-50 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 10px 40px var(--primary-glow)' }}
        title="AI Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
            <circle cx="20" cy="24" r="7" fill="white" />
            <path d="M20 11v3M20 31v3M11 20h3M30 20h3M14 14l2 2M26 14l-2 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {tip && !isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xs animate-slide-up z-50" style={{ animation: 'slideUp 0.4s ease forwards' }}>
          <div className="rounded-2xl px-4 py-3 text-sm shadow-xl flex items-center gap-2" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white' }}>
            <span className="flex-1 leading-snug">{tip}</span>
            <button onClick={() => setTip(null)} className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer text-xs">✕</button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 max-h-[calc(100vh-112px)] sm:max-h-[70vh] min-h-[320px] rounded-2xl shadow-2xl z-50 flex flex-col animate-slide-up overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--border-color)', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
                <circle cx="20" cy="24" r="7" fill="white" />
                <path d="M20 11v3M20 31v3M11 20h3M30 20h3M14 14l2 2M26 14l-2 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">RoutineRise AI</p>
              <p className="text-white/70 text-xs">Ask me anything!</p>
            </div>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line" style={{
                  background: msg.role === 'user' ? 'var(--overlay-active)' : 'var(--bg-elevated)',
                  color: msg.role === 'user' ? 'var(--primary-light)' : 'var(--text-primary)',
                  borderColor: msg.role === 'user' ? 'var(--primary-focus-ring)' : 'var(--border-color)',
                  borderWidth: '1px'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: 'var(--bg-elevated)' }}>
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            )}
            {showActions && messages.length <= 2 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.query)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Ask anything..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
