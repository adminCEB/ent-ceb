export const EVENT_TYPES = ["Répétition", "Concert", "Réunion", "Stage", "Autre"];

    export const EVENT_TYPE_COLORS = {
      "Répétition": "bg-blue-500",
      "Concert": "bg-red-500",
      "Réunion": "bg-green-500",
      "Stage": "bg-yellow-400", 
      "Autre": "bg-purple-500",
      "default": "bg-gray-500"
    };

    export const getDefaultEvent = (user, availableGroups) => {
      const defaultGroup = user?.role === 'membre' && user.group_name ? [user.group_name] 
                         : (availableGroups && availableGroups.length > 0 ? [availableGroups[0]] : ['Tous']);
      return {
        id: null,
        title: '',
        date: new Date().toISOString().split('T')[0],
        end_time: '',
        location: '',
        description: '',
        groups: defaultGroup,
        event_type: EVENT_TYPES[0],
        created_by_user_id: user?.id || null,
        created_by_user_name: user?.name || 'Utilisateur inconnu',
        link_carpool: false,
        create_gallery_album: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    };

    export const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };
    
    export const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.
    };

    export const getMonthName = (monthIndex, locale = 'fr-FR') => {
        const date = new Date();
        date.setMonth(monthIndex);
        return date.toLocaleString(locale, { month: 'long' });
    };
    
    export const getDayName = (dayIndex, length = 'long', locale = 'fr-FR') => {
        const date = new Date(2000, 0, dayIndex +2); // Adjust to ensure correct day mapping (0=Sunday for JS)
        return date.toLocaleDateString(locale, { weekday: length });
    };

    export const isSameDay = (date1, date2) => {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    };

    export const isToday = (date) => {
        return isSameDay(date, new Date());
    };
    
    // Basic iCalendar (ics) export functionality
    export const exportToICS = (events) => {
        let icsContent = "BEGIN:VCALENDAR\n";
        icsContent += "VERSION:2.0\n";
        icsContent += "PRODID:-//HorizonsAI//ENT CEB//FR\n";

        events.forEach(event => {
            icsContent += "BEGIN:VEVENT\n";
            icsContent += `UID:${event.id}@ent-ceb.fr\n`;
            icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, "")}Z\n`;
            
            const startDate = new Date(event.date);
            // Assuming event.date is just a date string like "YYYY-MM-DD"
            // For all-day events, DTSTART should be just the date
            icsContent += `DTSTART;VALUE=DATE:${startDate.toISOString().split('T')[0].replace(/-/g, "")}\n`;
            
            // If there's an end_time, we might want to calculate DTEND
            // This part is complex if end_time is just HH:mm and not a full datetime
            // For simplicity, we'll treat them as all-day events or skip DTEND

            icsContent += `SUMMARY:${event.title}\n`;
            if (event.description) {
                icsContent += `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}\n`;
            }
            if (event.location) {
                icsContent += `LOCATION:${event.location}\n`;
            }
            icsContent += "END:VEVENT\n";
        });

        icsContent += "END:VCALENDAR";
        return icsContent;
    };