import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogTrigger,
    } from "@/components/ui/alert-dialog";
    import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
      DialogFooter,
      DialogClose
    } from "@/components/ui/dialog";
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { Car, MapPin, CalendarDays, Users, Trash2, Edit3, MessageCircle, Phone, Download, Copy } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    export const CarpoolItem = ({ carpool, user, onEdit, onDelete, onJoin, onLeave, onOfferFromSuggestion, allUsersData }) => {
      const { toast } = useToast();
      const [showContacts, setShowContacts] = useState(false);

      const driverData = allUsersData.find(u => u.id === carpool.driverId);
      const passengersData = carpool.passengers.map(p => {
        const passengerFullData = allUsersData.find(u => u.id === p.id);
        return { ...p, phoneNumber: passengerFullData?.phoneNumber || 'Non fourni' };
      });

      const isUserParticipant = carpool.driverId === user.id || carpool.passengers.some(p => p.id === user.id);

      const generateExportText = () => {
        let text = `Covoiturage pour : ${carpool.eventTitle || 'Destination non spécifiée'}\n`;
        text += `Date : ${new Date(carpool.date + 'T' + carpool.time).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}\n`;
        text += `Départ : ${carpool.departure}\n`;
        text += `Arrivée : ${carpool.destination}\n\n`;
        text += `Conducteur :\n`;
        text += `  - Nom : ${driverData?.name || carpool.driverName}\n`;
        text += `  - Téléphone : ${driverData?.phoneNumber || 'Non fourni'}\n\n`;
        text += `Passagers (${passengersData.length}) :\n`;
        passengersData.forEach(p => {
          text += `  - Nom : ${p.name}\n`;
          text += `  - Téléphone : ${p.phoneNumber}\n`;
        });
        return text;
      };

      const handleCopyToClipboard = () => {
        const textToCopy = generateExportText();
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            toast({ title: "Informations copiées", description: "Les détails du covoiturage et les contacts ont été copiés." });
          })
          .catch(err => {
            toast({ title: "Erreur de copie", description: "Impossible de copier les informations.", variant: "destructive" });
            console.error('Could not copy text: ', err);
          });
      };
      
      return (
      <li className={`p-4 border rounded-lg bg-background/50 shadow-md ${carpool.isSuggestion ? 'border-dashed border-blue-400' : ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
             <Avatar className="h-10 w-10">
                  <AvatarImage src={!carpool.isSuggestion ? (driverData?.profilePicture || carpool.driverProfilePicture || undefined) : undefined} alt={!carpool.isSuggestion ? (driverData?.name || carpool.driverName) : 'Suggestion'} />
                  <AvatarFallback>{carpool.isSuggestion ? 'S' : ((driverData?.name || carpool.driverName) ? (driverData?.name || carpool.driverName).charAt(0).toUpperCase() : 'U')}</AvatarFallback>
              </Avatar>
            <div>
              <p className={`font-semibold ${carpool.isSuggestion ? 'text-blue-500' : 'text-primary'}`}>{carpool.isSuggestion ? "Suggestion de covoiturage" : (driverData?.name || carpool.driverName)}</p>
              {!carpool.isSuggestion && <p className="text-xs text-muted-foreground">Conducteur</p>}
            </div>
          </div>
          {user.id === carpool.driverId && !carpool.isSuggestion && (
              <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(carpool)}><Edit3 className="mr-1 h-3 w-3"/> Modifier</Button>
                  <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-1 h-3 w-3"/> Supprimer</Button></AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Supprimer l'offre?</AlertDialogTitle></AlertDialogHeader>
                          <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer cette offre de covoiturage?</AlertDialogDescription>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(carpool.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </div>
          )}
        </div>
        <div className="mt-3 space-y-1 text-sm">
          {!carpool.isSuggestion && <p><MapPin className="inline mr-2 h-4 w-4 text-red-400" /><strong>Départ:</strong> {carpool.departure}</p>}
          <p><MapPin className="inline mr-2 h-4 w-4 text-green-400" /><strong>Arrivée:</strong> {carpool.destination}</p>
          <p><CalendarDays className="inline mr-2 h-4 w-4 text-blue-400" /><strong>Date:</strong> {new Date(carpool.date + 'T' + carpool.time).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
          {!carpool.isSuggestion && <p><Users className="inline mr-2 h-4 w-4 text-purple-400" /><strong>Places:</strong> {carpool.passengers.length} / {carpool.seats} occupées</p>}
          {carpool.eventId && carpool.eventTitle && <p className="text-indigo-500"><CalendarDays className="inline mr-1 h-4 w-4"/>Événement: {carpool.eventTitle}</p>}
          {carpool.notes && <p className="text-muted-foreground italic">Notes: {carpool.notes}</p>}
        </div>
        
        {!carpool.isSuggestion && passengersData.length > 0 && (
            <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Passagers ({passengersData.length}):</p>
                <div className="flex flex-wrap gap-2">
                    {passengersData.map(p => (
                        <div key={p.id} className="flex items-center space-x-1 bg-accent p-1 rounded-md text-xs">
                            <Avatar className="h-5 w-5"><AvatarImage src={p.profilePicture || undefined} /><AvatarFallback>{p.name.charAt(0)}</AvatarFallback></Avatar>
                            <span>{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          {carpool.isSuggestion && (
            <Button size="sm" onClick={() => onOfferFromSuggestion(carpool)} className="bg-green-600 hover:bg-green-700">
              <Car className="mr-2 h-4 w-4" /> Proposer un trajet
            </Button>
          )}
          {!carpool.isSuggestion && isUserParticipant && (
             <Dialog open={showContacts} onOpenChange={setShowContacts}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-teal-600 border-teal-500 hover:bg-teal-50">
                      <Download className="mr-2 h-4 w-4" /> Contacts / Infos
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Informations du Covoiturage</DialogTitle>
                        <DialogDescription>
                            Voici les détails du conducteur et des passagers.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2 text-sm max-h-[60vh] overflow-y-auto">
                        <p><strong>Événement :</strong> {carpool.eventTitle || 'Non spécifié'}</p>
                        <p><strong>Date :</strong> {new Date(carpool.date + 'T' + carpool.time).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        <p><strong>Départ :</strong> {carpool.departure}</p>
                        <p><strong>Arrivée :</strong> {carpool.destination}</p>
                        
                        <div className="pt-2">
                            <h4 className="font-semibold text-base">Conducteur :</h4>
                            <p>{driverData?.name || carpool.driverName}</p>
                            <p className="flex items-center"><Phone className="inline mr-1.5 h-3 w-3 text-muted-foreground"/> {driverData?.phoneNumber || 'Non fourni'}</p>
                        </div>
                        
                        {passengersData.length > 0 && (
                            <div className="pt-2">
                                <h4 className="font-semibold text-base">Passagers ({passengersData.length}) :</h4>
                                {passengersData.map(p => (
                                    <div key={p.id} className="mt-1.5">
                                        <p>{p.name}</p>
                                        <p className="flex items-center"><Phone className="inline mr-1.5 h-3 w-3 text-muted-foreground"/> {p.phoneNumber}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                         {passengersData.length === 0 && (
                            <p className="text-muted-foreground">Aucun passager inscrit.</p>
                        )}
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" onClick={handleCopyToClipboard} className="bg-blue-500 hover:bg-blue-600">
                            <Copy className="mr-2 h-4 w-4" /> Copier Infos
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Fermer
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          )}
          {!carpool.isSuggestion && user.id !== carpool.driverId && !carpool.passengers.find(p => p.id === user.id) && carpool.passengers.length < carpool.seats && (
              <Button size="sm" onClick={() => onJoin(carpool.id)} className="bg-blue-600 hover:bg-blue-700">Rejoindre ({carpool.seats - carpool.passengers.length} places restantes)</Button>
          )}
          {!carpool.isSuggestion && user.id !== carpool.driverId && carpool.passengers.find(p => p.id === user.id) && (
              <Button size="sm" variant="outline" onClick={() => onLeave(carpool.id)} className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white">Quitter le covoiturage</Button>
          )}
          {!carpool.isSuggestion && user.id !== carpool.driverId && carpool.passengers.length >= carpool.seats && !carpool.passengers.find(p => p.id === user.id) && (
              <Button size="sm" disabled>Complet</Button>
          )}
          {!carpool.isSuggestion && user.id !== carpool.driverId && driverData?.phoneNumber && (
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <a href={`tel:${driverData.phoneNumber}`}>
                    <Phone className="mr-1 h-4 w-4"/> Contacter {driverData.name}
                </a>
            </Button>
          )}
           {!carpool.isSuggestion && user.id !== carpool.driverId && !driverData?.phoneNumber && (
             <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" disabled>
                 <MessageCircle className="mr-1 h-4 w-4"/> Contacter (Tel. non dispo.)
             </Button>
          )}
        </div>
      </li>
    )};