import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { CheckCircle, XCircle, Mail, Phone, Users, Info } from 'lucide-react';
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

    export const PendingRegistrationsList = ({ pendingRegistrations, onApprove, onReject }) => {
      if (!pendingRegistrations || pendingRegistrations.length === 0) {
        return <p className="text-muted-foreground text-center py-4">Aucune demande d'inscription en attente.</p>;
      }

      const getRoleLabel = (role) => {
        if (role === 'membre') return 'Membre (Parent)';
        if (role === 'professeur') return 'Professeur';
        return role;
      }

      return (
        <ul className="space-y-3">
          {pendingRegistrations.map(reg => (
            <li key={reg.id} className="p-3 bg-background/50 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={reg.profile_picture_url || undefined} alt={`${reg.first_name} ${reg.last_name}`} />
                    <AvatarFallback>{reg.first_name ? reg.first_name.charAt(0).toUpperCase() : 'P'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{`${reg.first_name} ${reg.last_name}`}</p>
                    <p className="text-xs text-muted-foreground flex items-center"><Mail className="w-3 h-3 mr-1" /> {reg.email}</p>
                     {reg.phone && <p className="text-xs text-muted-foreground flex items-center"><Phone className="w-3 h-3 mr-1" /> {reg.phone}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end text-xs text-muted-foreground space-y-1 mb-2 sm:mb-0">
                    <p className="flex items-center"><Users className="w-3 h-3 mr-1" /> Rôle demandé: <span className="font-medium ml-1">{getRoleLabel(reg.role)}</span></p>
                    {reg.role === 'membre' && (
                        <>
                            {reg.child_first_name && reg.child_last_name && <p>Enfant: <span className="font-medium">{`${reg.child_first_name} ${reg.child_last_name}`}</span></p>}
                            {reg.group_name && <p>Groupe demandé: <span className="font-medium">{reg.group_name}</span></p>}
                        </>
                    )}
                </div>
                <div className="flex space-x-2 self-stretch sm:self-center">
                  <Button onClick={() => onApprove(reg.id)} size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                    <CheckCircle className="mr-1 h-4 w-4" /> Approuver
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                        <XCircle className="mr-1 h-4 w-4" /> Rejeter
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rejeter cette inscription ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir rejeter la demande de {`${reg.first_name} ${reg.last_name}`}? Cette action supprimera la demande.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onReject(reg.id)} className="bg-destructive hover:bg-destructive/90">Rejeter</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </li>
          ))}
        </ul>
      );
    };