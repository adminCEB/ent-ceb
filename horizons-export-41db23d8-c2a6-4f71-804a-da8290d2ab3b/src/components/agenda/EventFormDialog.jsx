import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { CalendarPlus as CalendarIcon, Clock, MapPin, Link2, ImagePlus, Info, Users, Tag } from 'lucide-react';
    import {
      AlertDialog,
      AlertDialogContent,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogAction,
      AlertDialogCancel,
    } from '@/components/ui/alert-dialog';
    import { getDefaultEvent } from '@/lib/agendaUtils';

    const EVENT_TYPES = ["Répétition", "Concert", "Réunion", "Stage", "Autre"];

    const EventFormDialog = ({ isOpen, onClose, onSave, eventData, allGroups, user }) => {
      const [formData, setFormData] = useState(getDefaultEvent(user, allGroups));
      const [selectedGroups, setSelectedGroups] = useState([]);

      useEffect(() => {
        if (eventData) {
          setFormData({
            ...getDefaultEvent(user, allGroups),
            ...eventData,
            date: eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            end_time: eventData.end_time || '',
          });
          setSelectedGroups(eventData.groups || ['Tous']);
        } else {
          setFormData(getDefaultEvent(user, allGroups));
          setSelectedGroups(['Tous']);
        }
      }, [eventData, user, allGroups]);

      const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
        }));
      };

      const handleGroupChange = (group) => {
        setSelectedGroups(prev =>
          prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
      };
      
      const handleSelectAllGroups = () => {
        if (selectedGroups.length === allGroups.length + 1 && selectedGroups.includes('Tous')) { // +1 for 'Tous'
          setSelectedGroups([]);
        } else {
          setSelectedGroups(['Tous', ...allGroups]);
        }
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
          ...formData,
          groups: selectedGroups.length > 0 ? selectedGroups : ['Tous'],
        };
        onSave(finalData);
      };

      return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
          <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>{formData.id ? "Modifier l'événement" : "Nouvel événement"}</AlertDialogTitle>
              <AlertDialogDescription>
                Remplissez les détails de l'événement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="title" className="flex items-center mb-1"><Info className="w-4 h-4 mr-2 text-purple-500"/>Titre de l'événement</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required className="bg-background/70" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center mb-1"><CalendarIcon className="w-4 h-4 mr-2 text-purple-500"/>Date</Label>
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required className="bg-background/70" />
                </div>
                <div>
                  <Label htmlFor="end_time" className="flex items-center mb-1"><Clock className="w-4 h-4 mr-2 text-purple-500"/>Heure de fin (facultatif)</Label>
                  <Input id="end_time" name="end_time" type="time" value={formData.end_time} onChange={handleChange} className="bg-background/70" />
                </div>
              </div>
              <div>
                <Label htmlFor="location" className="flex items-center mb-1"><MapPin className="w-4 h-4 mr-2 text-purple-500"/>Lieu (facultatif)</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} className="bg-background/70" />
              </div>
              <div>
                <Label htmlFor="description" className="flex items-center mb-1"><Info className="w-4 h-4 mr-2 text-purple-500"/>Description (facultatif)</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="bg-background/70" />
              </div>
              <div>
                <Label htmlFor="event_type" className="flex items-center mb-1"><Tag className="w-4 h-4 mr-2 text-purple-500"/>Type d'événement</Label>
                <Select name="event_type" value={formData.event_type} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
                  <SelectTrigger className="bg-background/70"><SelectValue placeholder="Sélectionner un type" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center mb-2"><Users className="w-4 h-4 mr-2 text-purple-500"/>Visible par les groupes</Label>
                <div className="space-y-2 p-3 border rounded-md bg-background/50 max-h-40 overflow-y-auto">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="group-tous" 
                            checked={selectedGroups.includes('Tous')} 
                            onCheckedChange={() => handleGroupChange('Tous')}
                        />
                        <Label htmlFor="group-tous" className="font-medium">Tous les groupes</Label>
                    </div>
                    {allGroups.map(group => (
                        <div key={group} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`group-${group}`} 
                            checked={selectedGroups.includes(group)} 
                            onCheckedChange={() => handleGroupChange(group)}
                            disabled={selectedGroups.includes('Tous') && group !== 'Tous'}
                        />
                        <Label htmlFor={`group-${group}`}>{group}</Label>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="link" size="sm" onClick={handleSelectAllGroups} className="mt-1">
                    {selectedGroups.length === allGroups.length + 1 && selectedGroups.includes('Tous') ? "Désélectionner tout" : "Sélectionner tout"}
                </Button>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="link_carpool" name="link_carpool" checked={formData.link_carpool} onCheckedChange={(checked) => handleChange({ target: { name: 'link_carpool', checked, type: 'checkbox' }})} />
                <Label htmlFor="link_carpool" className="flex items-center"><Link2 className="w-4 h-4 mr-2 text-purple-500"/>Créer une proposition de covoiturage liée</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="create_gallery_album" name="create_gallery_album" checked={formData.create_gallery_album} onCheckedChange={(checked) => handleChange({ target: { name: 'create_gallery_album', checked, type: 'checkbox' }})} />
                <Label htmlFor="create_gallery_album" className="flex items-center"><ImagePlus className="w-4 h-4 mr-2 text-purple-500"/>Créer un album photo lié dans la galerie</Label>
              </div>
            
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
              <AlertDialogAction type="submit">Enregistrer</AlertDialogAction>
            </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      );
    };

    export default EventFormDialog;