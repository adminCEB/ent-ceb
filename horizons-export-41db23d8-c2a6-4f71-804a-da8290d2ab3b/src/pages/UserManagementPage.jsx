import React, { useState, useEffect, useCallback } from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Users2, ShieldQuestion, UserCheck, UserPlus, Trash2 } from 'lucide-react';
    import { PendingRegistrationsList } from '@/components/user-management/PendingRegistrationsList';
    import { ActiveUsersList } from '@/components/user-management/ActiveUsersList';
    import { EditUserDialog } from '@/components/user-management/EditUserDialog';
    import { motion } from 'framer-motion';
    import { defaultNotificationPreferences } from '@/lib/authUtils';
    import { supabase } from '@/lib/supabaseClient';
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
    import { Button } from '@/components/ui/button';


    const StatCard = ({ title, value, icon, color, description }) => (
      <motion.div
        whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
        className="rounded-xl"
      >
        <Card className="overflow-hidden bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {React.cloneElement(icon, { className: `h-5 w-5 ${color}` })}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </motion.div>
    );

    const UserManagementPage = () => {
      const { user: adminUser, getAllUsers, updateUserProfile, deleteUser, GROUPS: authGroupsFromContext, loadingAuth } = useAuth(); 
      const { toast } = useToast();
      const [allProfiles, setAllProfiles] = useState([]);
      const [editingUser, setEditingUser] = useState(null);
      const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
      
      const availableGroupsForFilter = authGroupsFromContext.filter(g => g && g.toLowerCase() !== 'tous');

      const loadData = useCallback(async () => {
        if (loadingAuth) return;
        const profiles = await getAllUsers();
        setAllProfiles(profiles);
      }, [getAllUsers, loadingAuth]);

      useEffect(() => {
        loadData();
      }, [loadData]);

      const activeUsers = allProfiles.filter(u => u.status === 'active');
      const pendingRegistrations = allProfiles.filter(u => u.status === 'pending');


      const handleApproveRegistration = async (pendingUserId) => {
        const { error } = await supabase
          .from('profiles')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', pendingUserId);

        if (error) {
          toast({ title: "Erreur d'approbation", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Inscription approuvée", description: `L'utilisateur a été activé.` });
          loadData(); 
        }
      };

      const handleRejectRegistration = async (pendingUserId) => {
        
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', pendingUserId);
        
        if (error) {
          toast({ title: "Erreur de rejet", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Inscription rejetée", description: "La demande d'inscription a été supprimée.", variant: "destructive" });
          loadData();
        }
      };
      
      const handleOpenEditModal = (userToEdit) => {
        setEditingUser(userToEdit);
        setIsEditUserDialogOpen(true);
      };

      const handleCloseEditModal = () => {
        setEditingUser(null);
        setIsEditUserDialogOpen(false);
      };

      const handleSaveUserChanges = async (updatedUserData) => {
        const profileUpdates = {
            first_name: updatedUserData.first_name,
            last_name: updatedUserData.last_name,
            phone: updatedUserData.phone,
            role: updatedUserData.role,
            user_group: updatedUserData.role === 'membre' ? (updatedUserData.user_group || null) : null,
            child_first_name: updatedUserData.role === 'membre' ? updatedUserData.child_first_name : null,
            child_last_name: updatedUserData.role === 'membre' ? updatedUserData.child_last_name : null,
            status: updatedUserData.status, 
            updated_at: new Date().toISOString()
        };

        Object.keys(profileUpdates).forEach(key => {
            if (profileUpdates[key] === undefined) { 
                profileUpdates[key] = null;
            }
        });
        
        const result = await updateUserProfile(updatedUserData.id, profileUpdates);

        if (result.success) {
            toast({ title: "Utilisateur mis à jour", description: `Les informations de ${updatedUserData.first_name} ${updatedUserData.last_name} ont été modifiées.` });
        } else {
            toast({ title: "Erreur de mise à jour", description: result.message || "Impossible de mettre à jour l'utilisateur.", variant: "destructive" });
        }
        loadData();
        handleCloseEditModal();
      };

      const handleDeleteUser = async (userIdToDelete) => {
        if (userIdToDelete === adminUser.id) {
          toast({ title: "Action non autorisée", description: "Un administrateur ne peut pas supprimer son propre compte.", variant: "destructive" });
          return;
        }
        
        const result = await deleteUser(userIdToDelete); 
        if (result.success) {
            toast({ title: "Utilisateur désactivé", description: result.message });
        } else {
            toast({ title: "Erreur de désactivation", description: result.message, variant: "destructive" });
        }
        loadData();
      };

      if (loadingAuth && !adminUser) {
        return <div className="p-4">Chargement de la gestion des utilisateurs...</div>;
      }
      if (!adminUser || adminUser.role !== 'admin') {
        return <div className="p-4">Accès non autorisé.</div>;
      }


      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-primary">Gestion des Utilisateurs</h1>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Utilisateurs Actifs" 
              value={activeUsers.length} 
              icon={<UserCheck />} 
              color="text-green-400"
              description="Membres et professeurs validés"
            />
            <StatCard 
              title="Demandes en Attente" 
              value={pendingRegistrations.length} 
              icon={<UserPlus />} 
              color="text-orange-400"
              description="Nouvelles inscriptions à traiter"
            />
             <StatCard 
              title="Rôles Administrateur" 
              value={activeUsers.filter(u => u.role === 'admin').length} 
              icon={<Users2 />} 
              color="text-indigo-400"
              description="Comptes avec droits élevés"
            />
          </div>

          <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldQuestion className="mr-2 h-6 w-6 text-orange-400" />
                Demandes d'inscription en attente ({pendingRegistrations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PendingRegistrationsList 
                pendingRegistrations={pendingRegistrations}
                onApprove={handleApproveRegistration}
                onReject={handleRejectRegistration}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users2 className="mr-2 h-6 w-6 text-indigo-400" />
                Utilisateurs Actifs ({activeUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveUsersList 
                users={activeUsers}
                adminUserId={adminUser.id}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteUser}
              />
            </CardContent>
          </Card>
          
          {editingUser && (
            <EditUserDialog
                isOpen={isEditUserDialogOpen}
                onClose={handleCloseEditModal}
                user={editingUser}
                onSave={handleSaveUserChanges}
                availableGroups={availableGroupsForFilter}
            />
          )}
        </div>
      );
    };

    export default UserManagementPage;
  