import { useState, useEffect, useCallback, useMemo } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';

    export const useCarpoolData = (initialEventId = null, initialEventTitle = '') => {
      const { user, getAllUsers } = useAuth();
      const { toast } = useToast();
      
      const [carpools, setCarpools] = useState([]);
      const [allEvents, setAllEvents] = useState([]);
      const [allUsersData, setAllUsersData] = useState([]);
      
      const [editingCarpool, setEditingCarpool] = useState(null);
      const [suggestedEventForForm, setSuggestedEventForForm] = useState(null);

      useEffect(() => {
        const storedCarpools = JSON.parse(localStorage.getItem('carpools')) || [];
        setCarpools(storedCarpools.sort((a,b) => new Date(b.date) - new Date(a.date)));
        
        const storedEvents = JSON.parse(localStorage.getItem('agendaEvents')) || [];
        setAllEvents(storedEvents.sort((a,b) => new Date(a.date) - new Date(b.date)));
        
        const usersData = getAllUsers ? getAllUsers() : [];
        setAllUsersData(usersData);
      }, [getAllUsers]);

      const eventsWithCarpoolLink = useMemo(() => {
        return allEvents.filter(event => event.linkCarpool);
      }, [allEvents]);

      const saveCarpoolsToStorage = useCallback((updatedCarpools) => {
        localStorage.setItem('carpools', JSON.stringify(updatedCarpools));
        setCarpools(updatedCarpools.sort((a,b) => new Date(b.date) - new Date(a.date)));
      }, []);

      const handleSubmitOffer = (formState) => {
        if (!formState.eventId || formState.eventId === "_none_") {
          toast({ title: "Événement requis", description: "Veuillez sélectionner un événement associé.", variant: "destructive" });
          return false;
        }
        if (!formState.departure || !formState.destination || !formState.date || !formState.time || formState.seats < 1) {
          toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
          return false;
        }

        const selectedEvent = allEvents.find(e => e.id.toString() === formState.eventId);
        const driverFullInfo = allUsersData.find(u => u.id === user.id);

        if (editingCarpool) {
          const updatedCarpools = carpools.map(cp => 
            cp.id === editingCarpool.id ? { 
              ...cp, 
              ...formState, 
              eventTitle: selectedEvent ? selectedEvent.title : null,
              updatedAt: new Date().toISOString(),
              isSuggestion: false, 
              driverId: user.id,
              driverName: user.name,
              driverProfilePicture: user.profilePicture,
              driverPhoneNumber: driverFullInfo?.phoneNumber 
            } : cp
          );
          saveCarpoolsToStorage(updatedCarpools);
          toast({ title: "Offre de covoiturage modifiée" });
        } else {
          const newCarpool = {
            id: `carpool-${Date.now()}`,
            driverId: user.id,
            driverName: user.name,
            driverProfilePicture: user.profilePicture,
            driverPhoneNumber: driverFullInfo?.phoneNumber,
            ...formState,
            eventTitle: selectedEvent ? selectedEvent.title : null,
            createdAt: new Date().toISOString(),
            passengers: [],
            isSuggestion: false,
          };
          
          let tempCarpools = [...carpools];
          if (suggestedEventForForm && suggestedEventForForm.id) {
            tempCarpools = tempCarpools.filter(cp => cp.id !== suggestedEventForForm.id);
          }
          saveCarpoolsToStorage([...tempCarpools, newCarpool]);
          toast({ title: "Offre de covoiturage ajoutée" });
        }
        setEditingCarpool(null);
        setSuggestedEventForForm(null);
        return true;
      };
      
      const handleEditOffer = (carpool) => {
        setEditingCarpool(carpool);
        setSuggestedEventForForm(null);
      };

      const handleDeleteOffer = (carpoolId) => {
        const updatedCarpools = carpools.filter(cp => cp.id !== carpoolId);
        saveCarpoolsToStorage(updatedCarpools);
        toast({ title: "Offre de covoiturage supprimée", variant: "destructive" });
      };
      
      const handleJoinCarpool = (carpoolId) => {
        const carpoolToJoin = carpools.find(cp => cp.id === carpoolId);
        if (!carpoolToJoin) return;

        if (carpoolToJoin.driverId === user.id) {
            toast({ title: "Action impossible", description: "Vous ne pouvez pas rejoindre votre propre covoiturage.", variant: "destructive"});
            return;
        }
        if (carpoolToJoin.passengers.find(p => p.id === user.id)) {
            toast({ title: "Déjà inscrit", description: "Vous êtes déjà inscrit à ce covoiturage.", variant: "info"});
            return;
        }
        if (carpoolToJoin.passengers.length >= carpoolToJoin.seats) {
            toast({ title: "Covoiturage complet", description: "Il n'y a plus de places disponibles.", variant: "destructive"});
            return;
        }
        
        const passengerFullInfo = allUsersData.find(u => u.id === user.id);
        const passengerInfoForCarpool = {
            id: user.id, 
            name: user.name, 
            profilePicture: user.profilePicture,
            phoneNumber: passengerFullInfo?.phoneNumber
        };

        const updatedCarpools = carpools.map(cp => 
            cp.id === carpoolId ? { ...cp, passengers: [...cp.passengers, passengerInfoForCarpool] } : cp
        );
        saveCarpoolsToStorage(updatedCarpools);
        toast({ title: "Covoiturage rejoint!", description: `Vous avez rejoint le covoiturage de ${carpoolToJoin.driverName}.`});
      };

      const handleLeaveCarpool = (carpoolId) => {
        const updatedCarpools = carpools.map(cp => 
            cp.id === carpoolId ? { ...cp, passengers: cp.passengers.filter(p => p.id !== user.id) } : cp
        );
        saveCarpoolsToStorage(updatedCarpools);
        toast({ title: "Covoiturage quitté", description: "Vous n'êtes plus inscrit à ce covoiturage."});
      };

      const handleOfferFromSuggestion = (suggestion) => {
        const eventForSuggestion = allEvents.find(e => e.id.toString() === suggestion.eventId?.toString());
        if (eventForSuggestion) {
            setSuggestedEventForForm({
                id: suggestion.id, 
                eventId: eventForSuggestion.id,
                title: eventForSuggestion.title,
                location: eventForSuggestion.location,
                date: eventForSuggestion.date,
            });
             setEditingCarpool(suggestion); 
        } else {
            setEditingCarpool({
                ...suggestion, 
                isSuggestion: false, 
            });
        }
      };
      
      const clearEditingState = () => {
        setEditingCarpool(null);
        setSuggestedEventForForm(null);
      }

      return {
        user,
        carpools,
        allEvents,
        allUsersData,
        eventsWithCarpoolLink,
        editingCarpool,
        suggestedEventForForm,
        handleSubmitOffer,
        handleEditOffer,
        handleDeleteOffer,
        handleJoinCarpool,
        handleLeaveCarpool,
        handleOfferFromSuggestion,
        clearEditingState
      };
    };