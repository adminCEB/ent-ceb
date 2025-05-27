import React, { useMemo } from 'react';
    import { EVENT_TYPE_COLORS } from '@/lib/agendaUtils';
    import { Clock } from 'lucide-react';

    export const WeekView = ({ currentDate, events, user, onEventClick }) => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const day = currentDate.getDate();

      const startOfWeek = useMemo(() => {
        const d = new Date(Date.UTC(year, month, day)); // Use UTC
        d.setUTCDate(d.getUTCDate() - d.getUTCDay() + (d.getUTCDay() === 0 ? -6 : 1)); 
        return d;
      }, [year, month, day]);

      const daysOfWeek = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startOfWeek);
        d.setUTCDate(startOfWeek.getUTCDate() + i);
        return d;
      }), [startOfWeek]);

      const getEventsForDay = (date) => {
        return events.filter(e => {
          const eventDate = new Date(e.date);
          const eventGroups = Array.isArray(e.groups) ? e.groups : [e.groups];
          const userGroup = user?.group_name;
          return eventDate.getUTCFullYear() === date.getUTCFullYear() &&
                 eventDate.getUTCMonth() === date.getUTCMonth() &&
                 eventDate.getUTCDate() === date.getUTCDate() &&
                 (user?.role === 'membre' ? (eventGroups.includes(userGroup) || eventGroups.includes('Tous')) : true);
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
      };

      return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {daysOfWeek.map((d, index) => (
            <div key={index} className="p-3 border rounded-md bg-background/50 min-h-[200px] flex flex-col">
              <h3 className="font-semibold text-center text-primary mb-3 pb-2 border-b border-border/70">
                {d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', timeZone: 'UTC' })}
              </h3>
              <div className="space-y-1.5 flex-grow">
                {getEventsForDay(d).map(event => {
                  const eventColor = EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS['default'];
                  const textColor = event.event_type === 'Stage' ? 'text-gray-800' : 'text-white';
                  const groupsDisplay = (Array.isArray(event.groups) ? event.groups : [event.groups]).join(', ');
                  
                  return (
                  <div 
                    key={event.id} 
                    className={`text-xs rounded p-1.5 cursor-pointer hover:opacity-90 transition-opacity ${eventColor} ${textColor}`}
                    title={`${event.title} (${groupsDisplay}) - ${new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}${event.end_time ? ' à ' + event.end_time : ''}`}
                    onClick={() => onEventClick(event)}
                  >
                    <p className="font-semibold truncate text-sm">{event.title}</p>
                    <div className={`flex items-center text-xs ${textColor} opacity-90`}>
                      <Clock className="inline h-3 w-3 mr-1 flex-shrink-0" />
                      <span>
                        {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                        {event.end_time && ` - ${event.end_time}`}
                      </span>
                    </div>
                    <p className={`truncate text-xs ${textColor} opacity-80`}>{groupsDisplay}</p>
                  </div>
                  );
                })}
                {getEventsForDay(d).length === 0 && <p className="text-xs text-muted-foreground text-center pt-4">Aucun événement</p>}
              </div>
            </div>
          ))}
        </div>
      );
    };

    export default WeekView;