import React, { useState, useMemo } from 'react';
    import EventDetailDialog from './EventDetailDialog';
    import { EVENT_TYPE_COLORS } from '@/lib/agendaUtils'; 
    import { Clock } from 'lucide-react';

    export const CalendarGrid = ({ currentDate, events, user, onEventClick }) => {
      const [selectedEventForDetail, setSelectedEventForDetail] = useState(null);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

      const getEventsForDay = (day) => {
        return events.filter(e => {
          const eventDate = new Date(e.date);
          const eventGroups = Array.isArray(e.groups) ? e.groups : [e.groups]; 
          const userGroup = user?.group_name; 
          
          return eventDate.getUTCFullYear() === year && 
                 eventDate.getUTCMonth() === month &&
                 eventDate.getUTCDate() === day &&
                 (user?.role === 'membre' ? (eventGroups.includes(userGroup) || eventGroups.includes('Tous')) : true);
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
      };
      
      const daysArray = useMemo(() => Array.from({ length: adjustedFirstDay + daysInMonth }, (_, i) => {
        if (i < adjustedFirstDay) return null;
        return i - adjustedFirstDay + 1;
      }), [adjustedFirstDay, daysInMonth]);


      const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

      const handleCellClick = (day) => {
        const dayEvents = getEventsForDay(day);
        if (dayEvents.length === 1) {
          onEventClick(dayEvents[0]);
        } else if (dayEvents.length > 1) {
          setSelectedEventForDetail(dayEvents[0]);
        }
      };
      
      const handleEventItemClick = (event, e) => {
        e.stopPropagation(); 
        onEventClick(event);
      };

      return (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground mb-2">
            {dayNames.map(name => <div key={name}>{name}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysArray.map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              return (
                <div
                  key={index}
                  className={`h-28 sm:h-32 md:h-36 p-1.5 border rounded-md overflow-hidden transition-colors duration-200 ${day ? 'bg-background/50 hover:bg-accent/50 cursor-pointer' : 'bg-muted/30'}`}
                  onClick={() => day && handleCellClick(day)}
                >
                  {day && (
                    <>
                      <span className="font-medium text-xs sm:text-sm">{day}</span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(event => {
                          const eventColor = EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS['default'];
                          const textColor = event.event_type === 'Stage' ? 'text-gray-800' : 'text-white';
                          return (
                            <div 
                              key={event.id} 
                              className={`text-xs ${textColor} rounded px-1.5 py-1 truncate cursor-pointer hover:opacity-80 ${eventColor}`}
                              title={`${new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} - ${event.title}`}
                              onClick={(e) => handleEventItemClick(event, e)}
                            >
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</span>
                              </div>
                              <div className="truncate font-medium">{event.title}</div>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div 
                            className="text-xs text-center text-blue-600 dark:text-blue-400 cursor-pointer hover:underline pt-1"
                            onClick={(e) => { e.stopPropagation(); setSelectedEventForDetail(dayEvents[0]); }}
                          >
                            + {dayEvents.length - 2} autre(s)
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {selectedEventForDetail && (
            <EventDetailDialog
              event={selectedEventForDetail}
              isOpen={!!selectedEventForDetail}
              onClose={() => setSelectedEventForDetail(null)}
              userRole={user?.role}
            />
          )}
        </>
      );
    };

    export default CalendarGrid;