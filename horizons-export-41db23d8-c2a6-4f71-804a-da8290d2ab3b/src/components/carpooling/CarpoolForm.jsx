import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Car } from 'lucide-react';

    const NO_EVENT_VALUE = "_none_";

    export const CarpoolForm = ({ isOpen, onClose, onSubmit, events, initialData, user, suggestedEvent }) => {
      const [formState, setFormState] = useState({
        departure: '',
        destination: '',
        date: '',
        time: '',
        seats: 1,
        eventId: NO_EVENT_VALUE,
        notes: '',
      });

      useEffect(() => {
        const defaultState = {
          departure: '',
          destination: '',
          date: '',
          time: '',
          seats: 1,
          eventId: NO_EVENT_VALUE,
          notes: '',
        };

        if (initialData) {
          setFormState({
            departure: initialData.departure || '',
            destination: initialData.destination || '',
            date: initialData.date || '',
            time: initialData.time || '',
            seats: initialData.seats || 1,
            eventId: initialData.eventId?.toString() || NO_EVENT_VALUE,
            notes: initialData.notes || '',
          });
        } else if (suggestedEvent) {
           setFormState({
            ...defaultState,
            eventId: suggestedEvent.id.toString(),
            destination: suggestedEvent.location || '',
            date: new Date(suggestedEvent.date).toISOString().split('T')[0],
            time: new Date(suggestedEvent.date).toTimeString().substring(0,5),
            notes: `Covoiturage pour l'événement : ${suggestedEvent.title}`,
          });
        }
         else {
           setFormState(defaultState);
        }
      }, [initialData, suggestedEvent]);
      

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
      };
      
      const handleSelectChange = (name, value) => {
         setFormState(prev => ({ ...prev, [name]: value }));
         if (name === 'eventId' && value !== NO_EVENT_VALUE) {
            const selectedEvent = events.find(e => e.id.toString() === value);
            if (selectedEvent) {
                setFormState(prev => ({
                    ...prev,
                    destination: selectedEvent.location || prev.destination,
                    date: new Date(selectedEvent.date).toISOString().split('T')[0],
                    time: new Date(selectedEvent.date).toTimeString().substring(0,5),
                }));
            }
         } else if (name === 'eventId' && value === NO_EVENT_VALUE) {
            setFormState(prev => ({
                ...prev,
                destination: initialData?.destination || suggestedEvent?.location || '', 
                date: initialData?.date || (suggestedEvent ? new Date(suggestedEvent.date).toISOString().split('T')[0] : ''),
                time: initialData?.time || (suggestedEvent ? new Date(suggestedEvent.date).toTimeString().substring(0,5) : ''),
            }));
         }
      };

      const handleSubmit = () => {
        onSubmit({ ...formState, eventId: formState.eventId === NO_EVENT_VALUE ? null : formState.eventId });
      };

      if (!isOpen) return null;
      
      const filteredEvents = events.filter(e => e.id && e.title && e.linkCarpool);

      return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg mt-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-6 w-6 text-green-400" />
              {initialData && !initialData.isSuggestion ? "Modifier l'offre de covoiturage" : "Nouvelle offre de covoiturage"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="departure">Lieu de départ <span className="text-red-500">*</span></Label><Input id="departure" name="departure" value={formState.departure} onChange={handleInputChange} className="bg-background/70 mt-1" /></div>
              <div><Label htmlFor="destination">Lieu d'arrivée <span className="text-red-500">*</span></Label><Input id="destination" name="destination" value={formState.destination} onChange={handleInputChange} className="bg-background/70 mt-1" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label htmlFor="date">Date <span className="text-red-500">*</span></Label><Input id="date" name="date" type="date" value={formState.date} onChange={handleInputChange} className="bg-background/70 mt-1" /></div>
              <div><Label htmlFor="time">Heure de départ <span className="text-red-500">*</span></Label><Input id="time" name="time" type="time" value={formState.time} onChange={handleInputChange} className="bg-background/70 mt-1" /></div>
              <div><Label htmlFor="seats">Places disponibles <span className="text-red-500">*</span></Label><Input id="seats" name="seats" type="number" min="1" value={formState.seats} onChange={handleInputChange} className="bg-background/70 mt-1" /></div>
            </div>
            <div>
                <Label htmlFor="eventId">Événement associé <span className="text-red-500">*</span></Label>
                <Select name="eventId" onValueChange={(value) => handleSelectChange('eventId', value)} value={formState.eventId}>
                    <SelectTrigger className="w-full bg-background/70 mt-1"><SelectValue placeholder="Sélectionner un événement" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={NO_EVENT_VALUE} disabled>Sélectionner un événement</SelectItem>
                        {filteredEvents.length === 0 && <SelectItem value="no-events" disabled>Aucun événement avec covoiturage activé</SelectItem>}
                        {filteredEvents.map(event => <SelectItem key={event.id} value={event.id.toString()}>{event.title} ({new Date(event.date).toLocaleDateString()})</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div><Label htmlFor="notes">Notes (optionnel)</Label><Textarea id="notes" name="notes" placeholder="Détails supplémentaires, ex: point de rdv précis..." value={formState.notes} onChange={handleInputChange} className="bg-background/70 mt-1" /></div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">{initialData && !initialData.isSuggestion ? "Sauvegarder" : "Proposer"}</Button>
          </CardFooter>
        </Card>
      );
    };