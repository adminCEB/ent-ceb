import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Edit, Trash2, Mail, Phone, Users, Briefcase, ShieldCheck } from 'lucide-react';
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

    export const ActiveUsersList = ({ users, adminUserId, onEdit, onDelete }) => {
      if (!users || users.length === 0) {
        return <p className="text-muted-foreground text-center py-4">Aucun utilisateur actif trouvé.</p>;
      }
      
      const roleDisplayMap = {
        'membre': { label: 'Membre', icon: <Users className="w-3 h-3 mr-1 text-blue-500" /> },
        'professeur': { label: 'Professeur', icon: <Briefcase className="w-3 h-3 mr-1 text-green-500" /> },
        'admin': { label: 'Admin', icon: <ShieldCheck className="w-3 h-3 mr-1 text-purple-500" /> }
      };

      return (
        <ul className="space-y-3">
          {users.map(user => (
            <li key={user.id} className="p-3 bg-background/50 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                  <Avatar className="h-10 w-10">
                     <AvatarImage src={user.profile_picture_url || undefined} alt={`${user.first_name} ${user.last_name}`} />
                     <AvatarFallback>{user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{`${user.first_name} ${user.last_name}`}</p>
                    <p className="text-xs text-muted-foreground flex items-center"><Mail className="w-3 h-3 mr-1" /> {user.email}</p>
                    {user.phone && <p className="text-xs text-muted-foreground flex items-center"><Phone className="w-3 h-3 mr-1" /> {user.phone}</p>}
                  </div>
                </div>
                 <div className="flex flex-col items-start sm:items-end text-xs text-muted-foreground space-y-1 mb-2 sm:mb-0">
                    <p className="flex items-center">
                        {roleDisplayMap[user.role]?.icon || null}
                        {roleDisplayMap[user.role]?.label || user.role}
                    </p>
                    {user.role === 'membre' && user.user_group && <p>Groupe: <span className="font-medium">{user.user_group}</span></p>}
                    {user.role === 'membre' && user.child_first_name && user.child_last_name && <p>Enfant: <span className="font-medium">{`${user.child_first_name} ${user.child_last_name}`}</span></p>}
                </div>
                <div className="flex space-x-2 self-stretch sm:self-center">
                  <Button onClick={() => onEdit(user)} size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700">
                    <Edit className="mr-1 h-4 w-4" /> Modifier
                  </Button>
                  {user.id !== adminUserId && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                                <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Désactiver cet utilisateur ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Êtes-vous sûr de vouloir désactiver {`${user.first_name} ${user.last_name}`}? Ils ne pourront plus se connecter. 
                                Pour une suppression définitive, veuillez le faire via le tableau de bord Supabase.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(user.id)} className="bg-destructive hover:bg-destructive/90">Désactiver</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      );
    };
  