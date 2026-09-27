const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const OpenAI = require('openai');

const SYSTEM_PROMPT = `You are RoutineRise AI, a helpful assistant for the RoutineRise habit tracking app. 

App features you can help with:
- Dashboard: Daily overview with tasks, notes, stats, and goals
- Routine/Habits: Daily task checklist with 4 statuses (not_started → in_progress → completed → incomplete), inline editing, templates
- Focus Mode: Pomodoro timer (25/50 min + custom), session tracking, XP rewards
- Calendar: Monthly event planner with categories (Work, Personal, Study, Birthday)
- Goals: Monthly/yearly goal tracking with progress slider
- Analytics: Charts (line, bar, pie), 90-day activity heatmap, day-by-day breakdown
- Insights: AI-powered suggestions, performance by day/time, predictions
- Gamification: XP system, levels, streaks, badges, early bird bonus
- Themes: Dark (purple), Light (warm orange), Eye Protector (teal green)
- XP: +10 per task, +5 early bird bonus, focus session rewards

Keep responses concise and helpful. If asked about things outside the app, answer generally but briefly.`;

let openai = null;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return null;
  }
  if (!openai) {
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

router.post('/', auth, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const client = getOpenAI();

    if (!client) {
      return res.json({
        reply: "I can help with: habits, XP, goals, focus mode, themes, streaks, badges, calendar, analytics, and more! Try asking about any of these topics."
      });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "I'm not sure how to respond to that. Could you rephrase?";

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

module.exports = router;
