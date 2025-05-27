import { useCallback } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { 
      updateGlobalGroupsState as serviceUpdateGlobalGroupsState 
    } from '@/lib/authServiceSupabase';
    import {
      loginUser as serviceLoginUser,
      registerUser as serviceRegisterUser
    } from '@/lib/authUserService';
    import { toast } from '@/components/ui/use-toast';

    export const useAuthActions = (setLoadingAuth, setUser, setIsAuthenticated, updateGroups) => {
      const navigate = useNavigate();

      const login = useCallback(async (email, password) => {
        console.log("useAuthActions: login function called.");
        setLoadingAuth(true);
        try {
          const result = await serviceLoginUser(email, password);
          console.log("useAuthActions: login - serviceLoginUser result:", result);
          
          if (!result.success) {
            toast({
                title: "Échec de la connexion",
                description: result.message || "Une erreur est survenue.",
                variant: "destructive",
            });
            if (result.signOutRequired) {
                await supabase.auth.signOut();
            }
            setUser(null);
            setIsAuthenticated(false);
          }
          
          return result;
        } catch (error) {
          console.error("useAuthActions: login - CRITICAL ERROR:", error);
          toast({
            title: "Erreur critique",
            description: "Une erreur inattendue est survenue lors de la connexion.",
            variant: "destructive",
          });
          setUser(null);
          setIsAuthenticated(false);
          return { success: false, message: "Erreur critique lors de la connexion." };
        } finally {
            setLoadingAuth(false);
        }
      }, [setLoadingAuth, setUser, setIsAuthenticated]);

      const register = useCallback(async (userData) => {
        setLoadingAuth(true);
        try {
          const result = await serviceRegisterUser(userData);
          if (result.success) { 
            await serviceUpdateGlobalGroupsState(updateGroups);
            toast({
                title: "Inscription réussie",
                description: result.message || "Veuillez vérifier vos emails.",
            });
          } else {
            toast({
                title: "Échec de l'inscription",
                description: result.message || "Une erreur est survenue.",
                variant: "destructive",
            });
          }
          return result;
        } catch (error) {
          console.error("useAuthActions: register - CRITICAL ERROR:", error);
          toast({
            title: "Erreur critique",
            description: "Une erreur inattendue est survenue lors de l'inscription.",
            variant: "destructive",
          });
          return { success: false, message: "Erreur critique lors de l'inscription." };
        } finally {
            setLoadingAuth(false);
        }
      }, [setLoadingAuth, updateGroups]);

      const logout = useCallback(async () => {
        setLoadingAuth(true);
        try {
          const { error } = await supabase.auth.signOut();
          if (error) { 
            console.error('useAuthActions: Error logging out:', error.message);
            toast({
                title: "Erreur de déconnexion",
                description: error.message,
                variant: "destructive",
            });
          }
        } catch (error) {
          console.error("useAuthActions: logout - CRITICAL ERROR:", error);
           toast({
            title: "Erreur critique",
            description: "Une erreur inattendue est survenue lors de la déconnexion.",
            variant: "destructive",
          });
        } finally {
          setUser(null);
          setIsAuthenticated(false);
          setLoadingAuth(false);
          navigate('/login', { replace: true });
        }
      }, [setLoadingAuth, setUser, setIsAuthenticated, navigate]);

      return { login, register, logout };
    };