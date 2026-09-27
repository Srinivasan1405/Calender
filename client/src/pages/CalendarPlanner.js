import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../utils/api';

const CATEGORIES = [
  { id: 'work', label: 'Work', color: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/20' },
  { id: 'personal', label: 'Personal', color: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 'study', label: 'Study', color: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/20' },
  { id: 'birthday', label: 'Birthday', color: 'bg-pink-500', text: 'text-pink-400', bg: 'bg-pink-500/20' },
];

const CalendarPlanner = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    category: 'personal',
    description: '',
    reminder: false
  });
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchMonthEvents();
  }, [year, month]);

  useEffect(() => {
    if (selectedDate) {
      fetchDayEvents(selectedDate);
    }
  }, [selectedDate]);

  const fetchMonthEvents = async () => {
    try {
      setLoading(true);
      const monthStr = (month + 1).toString().padStart(2, '0');
      const res = await eventsAPI.getByMonth(year, monthStr);
      
      const eventsMap = {};
      res.data.forEach(event => {
        if (!eventsMap[event.date]) eventsMap[event.date] = [];
        eventsMap[event.date].push(event);
      });
      setEvents(eventsMap);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDayEvents = async (date) => {
    try {
      const res = await eventsAPI.getByDate(date);
      setSelectedDateEvents(res.data);
    } catch (err) {
      console.error('Error fetching day events:', err);
    }
  };

  const getDaysInMonth = () => {
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatDate = (day) => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const openAddModal = (date) => {
    setEditingEvent(null);
    const todayStr = new Date().toISOString().split('T')[0];
    setFormData({
      title: '',
      date: date || todayStr,
      time: '',
      category: 'personal',
      description: '',
      reminder: false
    });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time || '',
      category: event.category,
      description: event.description || '',
      reminder: event.reminder || false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventsAPI.update(editingEvent._id, formData);
      } else {
        await eventsAPI.create(formData);
      }
      setShowModal(false);
      fetchMonthEvents();
      if (selectedDate) fetchDayEvents(selectedDate);
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event?')) {
      try {
        await eventsAPI.delete(id);
        fetchMonthEvents();
        if (selectedDate) fetchDayEvents(selectedDate);
      } catch (err) {
        console.error('Error deleting event:', err);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery && !filterCategory) return;
    try {
      const res = await eventsAPI.search(searchQuery, filterCategory);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Error searching:', err);
    }
  };

  const getCategoryStyle = (cat) => CATEGORIES.find(c => c.id === cat) || CATEGORIES[1];

  const days = getDaysInMonth();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="text-center animate-slide-up">
        <h1 className="text-3xl font-bold text-themed-primary mb-2">📅 Calendar Planner</h1>
        <p className="text-themed-secondary">Plan your events and schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card-modern p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-themed-elevated rounded-xl transition-all text-themed-secondary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-themed-primary">{monthNames[month]} {year}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-themed-elevated rounded-xl transition-all text-themed-secondary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

              <div className="grid grid-cols-7 gap-px mb-1 bg-themed-subtle rounded-xl overflow-hidden">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-themed-muted py-3 bg-themed-card">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-themed-subtle rounded-xl overflow-hidden">
              {days.map((day, index) => {
                const dateStr = day ? formatDate(day) : null;
                const dayEvents = dateStr ? events[dateStr] || [] : [];
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                
                return (
                  <div
                    key={index}
                    onClick={() => day && setSelectedDate(dateStr)}
                    className={`min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 transition-all cursor-pointer ${
                      day ? 'bg-themed-card hover:bg-themed-card-hover' : 'bg-transparent'
                    } ${isSelected ? 'bg-overlay-active' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="flex justify-center mb-1">
                          <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full ${
                            isToday ? 'text-white' : isSelected ? 'text-accent' : 'text-themed-primary'
                          }`} style={isToday ? { background: 'var(--primary)' } : {}}>
                            {day}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, isSelected ? 4 : 2).map((event, i) => {
                            const style = getCategoryStyle(event.category);
                            return (
                              <div key={i} className={`text-[10px] leading-tight px-1 py-0.5 rounded ${style.bg} ${style.text} truncate font-medium`}>
                                {event.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > (isSelected ? 4 : 2) && (
                            <div className="text-[10px] text-themed-muted text-center font-medium">+{dayEvents.length - (isSelected ? 4 : 2)}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-themed-primary">
                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Select a date'}
              </h3>
              {selectedDate && (
                <button onClick={() => openAddModal(selectedDate)} className="btn-primary text-sm py-2 px-3">
                  + Add Event
                </button>
              )}
            </div>

            <div className="space-y-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map(event => {
                  const style = getCategoryStyle(event.category);
                  return (
                    <div key={event._id} className={`p-4 rounded-2xl ${style.bg} border border-themed`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${style.color}`}></div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditModal(event)} className="text-themed-muted hover:text-themed-primary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(event._id)} className="text-themed-muted hover:text-red-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="font-bold text-themed-primary">{event.title}</p>
                      {event.time && <p className="text-sm text-themed-secondary">{event.time}</p>}
                      {event.description && <p className="text-sm text-themed-secondary mt-1">{event.description}</p>}
                      <div className="mt-2">
                        <span className={`badge ${style.text} ${style.bg}`}>{style.label}</span>
                      </div>
                    </div>
                  );
                })
              ) : selectedDate ? (
                <p className="text-themed-muted text-center py-4">No events planned</p>
              ) : (
                <p className="text-themed-muted text-center py-4">Click a date to see events</p>
              )}
            </div>
          </div>

          <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-bold text-themed-primary mb-4">Search Events</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input-modern"
                spellcheck="true"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-modern"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              <button onClick={handleSearch} className="btn-primary w-full">
                Search
              </button>

              {searchResults.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium text-themed-secondary">{searchResults.length} results</p>
                  {searchResults.slice(0, 5).map(event => {
                    const style = getCategoryStyle(event.category);
                    return (
                      <div key={event._id} className={`p-3 rounded-xl ${style.bg}`}>
                        <p className="font-medium text-themed-primary">{event.title}</p>
                        <p className="text-xs text-themed-secondary">{event.date} {event.time}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-modern p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-themed-primary">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-themed-muted hover:text-themed-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-themed-primary mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-modern"
                  placeholder="Event title"
                  spellcheck="true"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-themed-primary mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-themed-primary mb-1">Time (optional)</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-themed-primary mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-modern"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-themed-primary mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-modern"
                  rows={3}
                  placeholder="Event description..."
                  spellcheck="true"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                  className="w-5 h-5 rounded" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="reminder" className="text-sm text-themed-primary">Set reminder</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingEvent ? 'Update' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPlanner;
