import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from '../utils/helpers';

const TodayNotes = ({ note, onUpdate }) => {
  const [content, setContent] = useState(note?.content || '');
  const [mood, setMood] = useState(note?.mood || '');
  const latestRef = useRef({ content: '', mood: '' });

  useEffect(() => {
    setContent(note?.content || '');
    setMood(note?.mood || '');
  }, [note]);

  const debouncedSave = useRef(
    debounce((text, selectedMood) => onUpdate(text, selectedMood), 600)
  ).current;

  const saveNote = useCallback((text, selectedMood) => {
    latestRef.current = { content: text, mood: selectedMood };
    debouncedSave(text, selectedMood);
  }, [debouncedSave]);

  const handleBlur = () => {
    saveNote(content, mood);
  };

  return (
    <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <h2 className="text-lg font-bold text-themed-primary mb-4">Daily Reflection</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
        className="input-modern h-28 resize-none mb-4"
        placeholder="How was your day? Write your thoughts..."
      />
      <div className="flex justify-between items-center">
        <p className="text-sm text-themed-muted">How are you feeling?</p>
        <div className="flex gap-3">
          {[
            { value: 'happy', emoji: '😊' },
            { value: 'neutral', emoji: '😐' },
            { value: 'sad', emoji: '😞' },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => {
                const nextMood = mood === m.value ? '' : m.value;
                setMood(nextMood);
                saveNote(content, nextMood);
              }}
              className={`mood-btn ${mood === m.value ? 'active' : ''}`}
              title={m.value}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodayNotes;