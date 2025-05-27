import React, { useMemo } from 'react';
    import { EVENT_TYPE_COLORS } from '@/lib/agendaUtils';

    export const YearView = ({ currentDate, events, user, onEventClick }) => {
      const year = currentDate.getFullYear();

      const months = useMemo(() => Array.from({ length: 12 }).map((_, i) => {
        const monthDate = new Date(Date.UTC(year, i, 1)); // Use UTC
        const monthName = monthDate.toLocaleDateString('fr-FR', { month: 'long', timeZone: 'UTC' });
        const daysInMonth = new Date(Date.UTC(year, i + 1, 0)).getUTCDate();
        const firstDayOfMonth = new Date(Date.UTC(year, i, 1)).getUTCDay();
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const monthEvents = events.filter(e => {
          const eventDate = new Date(e.date);
          const eventGroups = Array.isArray(e.groups) ? e.groups : [e.groups];
          const userGroup = user?.group_name;
          return eventDate.getUTCFullYear() === year &&
                 eventDate.getUTCMonth() === i &&
                 (user?.role === 'membre' ? (eventGroups.includes(userGroup) || eventGroups.includes('Tous')) : true);
        });

        return { monthName, daysInMonth, adjustedFirstDay, monthEvents, monthIndex: i };
      }), [year, events, user]);

      const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map(({ monthName, daysInMonth, adjustedFirstDay, monthEvents, monthIndex }) => (
            <div key={monthName} className="p-3 border rounded-md bg-background/50">
              <h3 className="text-lg font-semibold text-center text-primary mb-2">{monthName} {year}</h3>
              <div className="grid grid-cols-7 gap-px text-center text-xs text-muted-foreground mb-1">
                {dayNames.map(name => <div key={name}>{name}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {Array.from({ length: adjustedFirstDay }).map((_, i) => <div key={`empty-${i}`} className="h-5"></div>)}
                {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                  const day = dayIndex + 1;
                  const dayEvents = monthEvents.filter(e => new Date(e.date).getUTCDate() === day);
                  let cellColor = 'bg-background/30';
                  if (dayEvents.length > 0) {
                    const firstEventType = dayEvents[0].event_type;
                    cellColor = EVENT_TYPE_COLORS[firstEventType] ? `${EVENT_TYPE_COLORS[firstEventType]} opacity-50` : `${EVENT_TYPE_COLORS['default']} opacity-50`;
                  }
                  
                  return (
                    <div 
                      key={day} 
                      className={`h-5 flex items-center justify-center text-xs rounded-sm cursor-pointer hover:ring-1 hover:ring-primary ${cellColor}`}
                      title={dayEvents.length > 0 ? `${dayEvents.length} événement(s)` : ''}
                      onClick={() => {
                        if (dayEvents.length > 0) {
                          onEventClick(dayEvents[0]); 
                        }
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    };

    export default YearView;