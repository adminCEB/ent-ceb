import { useToast } from '@/components/ui/use-toast';

    export const handleEventSubmission = async (
        eventData, 
        editingEvent, 
        currentEvents, 
        userName, 
        saveEventsCallback, 
        saveCarpoolsCallback,
        saveGalleryAlbumsCallback,
        toast
    ) => {
      const { title, date, endTime, location, description, group, eventType, linkCarpool, createGalleryAlbum } = eventData;

      if (!title || !date || !eventType) {
        toast({ title: "Champs requis", description: "Veuillez remplir le titre, la date et le type d'événement.", variant: "destructive" });
        return;
      }

      let updatedEvents;
      let eventIdForRelatedItems = editingEvent ? editingEvent.id : `event-${Date.now()}`;

      if (editingEvent) {
        updatedEvents = currentEvents.map(event => 
          event.id === editingEvent.id ? { 
            ...event, 
            title, 
            date, 
            endTime,
            location,
            description, 
            group, 
            eventType,
            linkCarpool,
            createGalleryAlbum,
            updatedAt: new Date().toISOString(),
            updatedBy: userName 
          } : event
        );
        toast({ title: "Événement modifié", description: `${title} a été mis à jour.` });
      } else {
        const newEvent = {
          id: eventIdForRelatedItems,
          title,
          date,
          endTime,
          location,
          description,
          group,
          eventType,
          linkCarpool,
          createGalleryAlbum,
          createdBy: userName,
          createdAt: new Date().toISOString()
        };
        updatedEvents = [...currentEvents, newEvent];
        toast({ title: "Événement ajouté", description: `${title} a été ajouté à l'agenda.` });
      }
      saveEventsCallback(updatedEvents);

      const currentCarpools = JSON.parse(localStorage.getItem('carpools')) || [];
      const eventHasCarpoolSuggestion = currentCarpools.some(cp => cp.eventId === eventIdForRelatedItems && cp.isSuggestion);

      if (linkCarpool && !eventHasCarpoolSuggestion) {
        const newCarpoolSuggestion = {
          id: `carpool-suggestion-${Date.now()}`,
          eventId: eventIdForRelatedItems,
          eventTitle: title,
          destination: location || 'Lieu de l\'événement',
          date: date.split('T')[0],
          time: date.split('T')[1].substring(0,5),
          isSuggestion: true,
        };
        saveCarpoolsCallback([...currentCarpools, newCarpoolSuggestion]);
        toast({ title: "Suggestion de covoiturage créée", description: `Une suggestion de covoiturage pour ${title} a été ajoutée.` });
      } else if (!linkCarpool && eventHasCarpoolSuggestion) {
        const updatedCarpools = currentCarpools.filter(cp => !(cp.eventId === eventIdForRelatedItems && cp.isSuggestion));
        saveCarpoolsCallback(updatedCarpools);
        toast({ title: "Suggestion de covoiturage supprimée", description: `La suggestion de covoiturage pour ${title} a été retirée.` });
      }

      const currentGalleryAlbums = JSON.parse(localStorage.getItem('galleryAlbums')) || [];
      const eventHasGalleryAlbum = currentGalleryAlbums.some(album => album.eventId === eventIdForRelatedItems);

      if (createGalleryAlbum && !eventHasGalleryAlbum) {
        const newAlbum = {
          id: `album-${eventIdForRelatedItems}`,
          eventId: eventIdForRelatedItems,
          name: `Souvenirs: ${title}`,
          description: `Photos et vidéos de l'événement du ${new Date(date).toLocaleDateString()}`,
          media: []
        };
        saveGalleryAlbumsCallback([...currentGalleryAlbums, newAlbum]);
        toast({ title: "Album photo créé", description: `Un album pour ${title} a été créé dans la galerie.` });
      } else if (!createGalleryAlbum && eventHasGalleryAlbum) {
        
        const updatedAlbums = currentGalleryAlbums.filter(album => album.eventId !== eventIdForRelatedItems);
        saveGalleryAlbumsCallback(updatedAlbums);
        toast({ title: "Album photo supprimé", description: `L'album pour ${title} a été supprimé de la galerie.`, variant: "info" });
      }
    };

    export const handleEventDeletion = async (
        eventId,
        currentEvents,
        saveEventsCallback,
        saveCarpoolsCallback,
        saveGalleryAlbumsCallback,
        toast
    ) => {
        const eventToDelete = currentEvents.find(e => e.id === eventId);
        if (!eventToDelete) return;

        const updatedEvents = currentEvents.filter(event => event.id !== eventId);
        saveEventsCallback(updatedEvents);
        
        const currentCarpools = JSON.parse(localStorage.getItem('carpools')) || [];
        const updatedCarpools = currentCarpools.filter(cp => cp.eventId !== eventId);
        saveCarpoolsCallback(updatedCarpools);

        const currentGalleryAlbums = JSON.parse(localStorage.getItem('galleryAlbums')) || [];
        const updatedGalleryAlbums = currentGalleryAlbums.filter(album => album.eventId !== eventId);
        saveGalleryAlbumsCallback(updatedGalleryAlbums);

        toast({ title: "Événement supprimé", description: `${eventToDelete.title} et les éléments associés (covoiturages, album photo) ont été supprimés.`, variant: "destructive" });
    };