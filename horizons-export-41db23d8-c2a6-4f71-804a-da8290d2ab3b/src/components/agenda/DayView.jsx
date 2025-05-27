import React, { useMemo } from 'react';
    import { Clock, MapPin, Users, Tag } from 'lucide-react';
    import { EVENT_TYPE_COLORS } from '@/lib/agendaUtils';

    export const DayView = ({ currentDate, events, user, onEventClick }) => {
      const getEventsForDay = useMemo(() => {
        return events.filter(e => {
          const eventDate = new Date(e.date);
          const eventGroups = Array.isArray(e.groups) ? e.groups : [e.groups];
          const userGroup = user?.group_name;
          return eventDate.getUTCFullYear() === currentDate.getFullYear() &&
                 eventDate.getUTCMonth() === currentDate.getMonth() &&
                 eventDate.getUTCDate() === currentDate.getDate() &&
                 (user?.role === 'membre' ? (eventGroups.includes(userGroup) || eventGroups.includes('Tous')) : true);
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
      }, [currentDate, events, user]);

      return (
        <div className="p-4 border rounded-md bg-background/50 shadow-inner">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">
            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          {getEventsForDay.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun événement prévu pour aujourd'hui.</p>
          ) : (
            <ul className="space-y-4">
              {getEventsForDay.map(event => {
                const eventColor = EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS['default'];
                const textColor = event.event_type === 'Stage' ? 'text-gray-900' : 'text-white';
                const cardBg = eventColor.startsWith('bg-') ? eventColor : `bg-${eventColor}-500`;
                const groupsDisplay = (Array.isArray(event.groups) ? event.groups : [event.groups]).join(', ');
                
                return (
                  <li 
                    key={event.id} 
                    className={`p-4 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 ${cardBg}`}
                    onClick={() => onEventClick(event)}
                  >
                    <h3 className={`font-semibold text-xl mb-1 ${textColor}`}>{event.title}</h3>
                    <div className="space-y-1.5">
                      <p className={`text-sm ${textColor} opacity-95 flex items-center`}>
                        <Clock className="inline h-4 w-4 mr-2 flex-shrink-0" />
                        De {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                        {event.end_time && ` à ${event.end_time}`}
                      </p>
                      {event.location && (
                        <p className={`text-sm ${textColor} opacity-95 flex items-center`}>
                          <MapPin className="inline h-4 w-4 mr-2 flex-shrink-0" />
                          {event.location}
                        </p>
                      )}
                      <p className={`text-sm ${textColor} opacity-95 flex items-center`}>
                        <Tag className="inline h-4 w-4 mr-2 flex-shrink-0" />
                        Type : {event.event_type}
                      </p>
                       <p className={`text-sm ${textColor} opacity-95 flex items-center`}>
                        <Users className="inline h-4 w-4 mr-2 flex-shrink-0" />
                        Groupes : {groupsDisplay}
                      </p>
                      {event.description && <p className={`text-sm mt-2 italic ${textColor} opacity-85`}>{event.description}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    };

    export default DayView;