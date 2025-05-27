import { useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { 
      updateGlobalGroupsState as serviceUpdateGlobalGroupsState,
      fetchUserProfile as serviceFetchUserProfile
    } from '@/lib/authServiceSupabase';
    import {
      updateUserProfileData as serviceUpdateUserProfileData,
      getAllUsersProfiles as serviceGetAllUsersProfiles,
      deleteUserProfile as serviceDeleteUserProfile
    } from '@/lib/authUserService';
    import { toast } from '@/components/ui/use-toast';

    export const useUserActions = (currentUser, setLoadingAuth, setUser, updateGroups, logoutCallback) => {
      const updateUserProfile = useCallback(async (userId, profileUpdates) => {
        setLoadingAuth(true);
        try {
          const result = await serviceUpdateUserProfileData(userId, profileUpdates);
          if (result.success && result.updatedUserForContext && currentUser && currentUser.id === userId) {
              let updatedUser = { 
                ...currentUser, 
                ...result.updatedUserForContext, 
                name: `${result.updatedUserForContext.first_name || ''} ${result.updatedUserForContext.last_name || ''}`.trim(), 
                group_name: result.updatedUserForContext.user_group 
              };
              
              const fetchUserProfileFuncToString = serviceFetchUserProfile.toString();
              if (fetchUserProfileFuncToString.includes("TEMPORARY DEBUG MODE")) {
                console.warn("useUserActions: updateUserProfile - fetchUserProfile is in TEMPORARY DEBUG MODE. Profile updates may not reflect real data if Supabase issue persists.");
                const mockProfile = await serviceFetchUserProfile(userId); 
                updatedUser = { ...mockProfile, ...result.updatedUserForContext, name: `${result.updatedUserForContext.first_name || mockProfile.first_name} ${result.updatedUserForContext.last_name || mockProfile.last_name}`.trim() };
              }

              setUser(updatedUser); 
              toast({ title: "Profil mis à jour", description: "Vos informations ont été sauvegardées." });
          } else if (!result.success) {
            toast({
                title: "Échec de la mise à jour",
                description: result.message || "Impossible de sauvegarder les modifications.",
                variant: "destructive",
            });
          }
          if (result.success) { 
              await serviceUpdateGlobalGroupsState(updateGroups);
          }
          return result;
        } catch (error) {
          console.error("useUserActions: updateUserProfile - CRITICAL ERROR:", error);
          toast({
            title: "Erreur critique",
            description: "Une erreur inattendue est survenue lors de la mise à jour du profil.",
            variant: "destructive",
          });
          return { success: false, message: "Erreur critique lors de la mise à jour du profil." };
        } finally {
            setLoadingAuth(false);
        }
      }, [setLoadingAuth, currentUser, setUser, updateGroups]);

      const deleteUser = useCallback(async (userIdToDelete) => {
        setLoadingAuth(true);
        try {
          const result = await serviceDeleteUserProfile(userIdToDelete, currentUser ? currentUser.id : null);
          if (result.success) { 
            toast({ title: "Utilisateur désactivé", description: result.message });
            if (currentUser && currentUser.id === userIdToDelete) {
                await logoutCallback(); 
            } else {
              await serviceUpdateGlobalGroupsState(updateGroups);
            }
          } else {
            toast({
                title: "Échec de la désactivation",
                description: result.message || "Impossible de désactiver l'utilisateur.",
                variant: "destructive",
            });
          }
          return result;
        } catch (error) {
          console.error("useUserActions: deleteUser - CRITICAL ERROR:", error);
          toast({
            title: "Erreur critique",
            description: "Une erreur inattendue est survenue lors de la désactivation de l'utilisateur.",
            variant: "destructive",
          });
          return { success: false, message: "Erreur critique lors de la désactivation de l'utilisateur." };
        } finally {
            setLoadingAuth(false);
        }
      }, [setLoadingAuth, currentUser, updateGroups, logoutCallback]);
      
      const getAllUsers = useCallback(async () => {
        setLoadingAuth(true);
        try {
          return await serviceGetAllUsersProfiles();
        } catch (error) {
          console.error("useUserActions: getAllUsers - CRITICAL ERROR:", error);
          toast({
            title: "Erreur critique",
            description: "Impossible de récupérer la liste des utilisateurs.",
            variant: "destructive",
          });
          return [];
        } finally {
          setLoadingAuth(false);
        }
      }, [setLoadingAuth]);


      return { updateUserProfile, deleteUser, getAllUsers };
    };