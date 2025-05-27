import React from 'react';
    import { Button } from '@/components/ui/button';
    import {
      AlertDialog,
      AlertDialogContent,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogTrigger,
    } from '@/components/ui/alert-dialog';
    import { CalendarPlus as CalendarIcon, Clock, MapPin, Info, Users, Tag, Edit3, Trash2, Link2, ImagePlus } from 'lucide-react';
    import { ScrollArea } from '@/components/ui/scroll-area';

    const EventDetailDialog = ({ isOpen, onClose, event, onEdit, onDelete, userRole }) => {
      if (!event) return null;

      const formatDate = (dateString) => {
        if (!dateString) return 'Non spécifié';
        const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
      };
      
      const formatTime = (timeString) => {
          if (!timeString) return '';
          const [hours, minutes] = timeString.split(':');
          return `${hours}h${minutes}`;
      }

      return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl text-primary">{event.title}</AlertDialogTitle>
              <AlertDialogDescription>Détails de l'événement.</AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4 py-4">
                <div className="flex items-start">
                    <CalendarIcon className="w-5 h-5 mr-3 mt-1 text-purple-500 flex-shrink-0" />
                    <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-muted-foreground">{formatDate(event.date)}</p>
                    </div>
                </div>
                {event.end_time && (
                    <div className="flex items-start">
                    <Clock className="w-5 h-5 mr-3 mt-1 text-purple-500 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Heure de fin</p>
                        <p className="text-muted-foreground">{formatTime(event.end_time)}</p>
                    </div>
                    </div>
                )}
                {event.location && (
                    <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 mt-1 text-purple-500 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Lieu</p>
                        <p className="text-muted-foreground">{event.location}</p>
                    </div>
                    </div>
                )}
                 {event.event_type && (
                    <div className="flex items-start">
                    <Tag className="w-5 h-5 mr-3 mt-1 text-purple-500 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Type d'événement</p>
                        <p className="text-muted-foreground">{event.event_type}</p>
                    </div>
                    </div>
                )}
                {event.description && (
                    <div className="flex items-start">
                    <Info className="w-5 h-5 mr-3 mt-1 text-purple-500 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Description</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                    </div>
                    </div>
                )}
                {event.groups && event.groups.length > 0 && (
                    <div className="flex items-start">
                    <Users className="w-5 h-5 mr-3 mt-1 text-purple-500 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Groupes concernés</p>
                        <p className="text-muted-foreground">{event.groups.join(', ')}</p>
                    </div>
                    </div>
                )}
                {event.link_carpool && (
                    <div className="flex items-start text-sm text-green-600">
                        <Link2 className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                        <p>Une proposition de covoiturage est liée à cet événement.</p>
                    </div>
                )}
                {event.create_gallery_album && (
                     <div className="flex items-start text-sm text-blue-600">
                        <ImagePlus className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                        <p>Un album photo sera (ou a été) créé pour cet événement.</p>
                    </div>
                )}
                {event.created_by_user_name && (
                    <p className="text-xs text-muted-foreground mt-4 pt-2 border-t">
                    Créé par: {event.created_by_user_name} le {formatDate(event.created_at)}
                    </p>
                )}
                </div>
            </ScrollArea>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onClose}>Fermer</AlertDialogCancel>
              {(userRole === 'admin' || userRole === 'professeur') && (
                <>
                  <Button variant="outline" onClick={() => { onEdit(event); onClose(); }} className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700">
                    <Edit3 className="mr-2 h-4 w-4" /> Modifier
                  </Button>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive_outline">
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer l'événement "{event.title}" ? Cette action est irréversible.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(event.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };

    export default EventDetailDialog;