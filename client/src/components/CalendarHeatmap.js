import React from 'react';
import { getHeatmapColor } from '../utils/helpers';

const CalendarHeatmap = ({ data }) => {
  const groupedByWeek = [];
  let currentWeek = [];

  if (data && data.length > 0) {
    const firstDate = new Date(data[0].date);
    const startPadding = firstDate.getDay();
    
    for (let i = 0; i < startPadding; i++) {
      currentWeek.push(null);
    }

    data.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        groupedByWeek.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      groupedByWeek.push(currentWeek);
    }
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="card-modern p-6">
      <h2 className="text-lg font-bold text-themed-primary mb-4">90-Day Activity</h2>
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
        <div className="flex flex-col gap-1 mr-2 flex-shrink-0">
          {dayLabels.map((day, i) => (
            <div key={i} className="w-5 h-5 flex items-center justify-center text-xs text-themed-muted font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {groupedByWeek.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="w-5 h-5 rounded-md transition-all hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: day ? getHeatmapColor(day.successRate) : 'var(--bg-elevated)',
                  }}
                  title={day ? `${day.date}: ${day.successRate.toFixed(0)}%` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-themed-muted">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded" style={{ background: 'var(--bg-elevated)' }}></div>
          <div className="w-4 h-4 rounded bg-red-400"></div>
          <div className="w-4 h-4 rounded bg-yellow-400"></div>
          <div className="w-4 h-4 rounded bg-green-500"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap;