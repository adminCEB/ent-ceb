import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { CalendarDays, Clock, MapPin, ChevronRight } from 'lucide-react';

    const EventList = ({ events, onEventClick, viewMode, currentDate }) => {

      const formatDate = (dateString, includeDayName = false) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
        if (includeDayName) {
          options.weekday = 'long';
        }
        return new Date(dateString).toLocaleDateString('fr-FR', options);
      };
      
      const formatTime = (timeString) => {
          if (!timeString) return '';
          const [hours, minutes] = timeString.split(':');
          return `${hours}h${minutes}`;
      }

      const filterEventsForView = () => {
        if (viewMode === 'list') return events;
        if (viewMode === 'day') {
          return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getUTCFullYear() === currentDate.getFullYear() &&
                   eventDate.getUTCMonth() === currentDate.getMonth() &&
                   eventDate.getUTCDate() === currentDate.getDate();
          });
        }
        // Add week view filtering if needed
        return events; 
      };

      const eventsToDisplay = filterEventsForView();

      if (eventsToDisplay.length === 0) {
        return <p className="text-muted-foreground text-center py-6">Aucun événement prévu pour cette période.</p>;
      }

      return (
        <div className="space-y-4 mt-4">
          {eventsToDisplay.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => onEventClick(event)}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out bg-card/80 backdrop-blur-sm border-border/40">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-lg text-primary flex justify-between items-center">
                    {event.title}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1 px-4 pb-3">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
                    <span>{formatDate(event.date, true)}</span>
                  </div>
                  {event.end_time && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Heure de fin: {formatTime(event.end_time)}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      );
    };

    export default EventList;