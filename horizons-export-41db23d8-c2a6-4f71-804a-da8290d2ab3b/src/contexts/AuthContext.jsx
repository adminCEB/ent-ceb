import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
    import { useNavigate, useLocation } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { updateGlobalGroupsState as serviceUpdateGlobalGroupsState } from '@/lib/authServiceSupabase'; 
    import { 
      processUserSession as coreProcessUserSession 
    } from '@/lib/authCore';
    import { useAuthActions } from '@/hooks/useAuthActions';
    import { useUserActions } from '@/hooks/useUserActions';
    import { usePasswordActions } from '@/hooks/usePasswordActions';
    import { toast } from '@/components/ui/use-toast';

    export const USER_ROLES = ["membre", "professeur", "admin"];
    export let GROUPS = []; 

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [isAuthenticated, setIsAuthenticated] = useState(false);
      const [loadingAuth, setLoadingAuth] = useState(true); 
      const [groupsLoaded, setGroupsLoaded] = useState(false);
      const navigate = useNavigate();
      const location = useLocation();

      const updateGroups = useCallback((newGroups) => {
        GROUPS = newGroups;
        setGroupsLoaded(true);
        console.log("AuthContext: GROUPS updated to", GROUPS);
      }, []);

      const { login, register, logout: authLogout } = useAuthActions(setLoadingAuth, setUser, setIsAuthenticated, updateGroups);
      const { updateUserProfile, deleteUser, getAllUsers } = useUserActions(user, setLoadingAuth, setUser, updateGroups, authLogout);
      const { sendPasswordResetLink, resetPassword } = usePasswordActions(setLoadingAuth);


      useEffect(() => {
        let isMounted = true;
        console.log("AuthProvider useEffect mounted. Initial loadingAuth state: true");
        setLoadingAuth(true);

        const initialCheckDone = { current: false };

        let authListenerSubscription = null;
        if (supabase && supabase.auth && typeof supabase.auth.onAuthStateChange === 'function') {
            const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
              if (!isMounted) {
                  console.log("onAuthStateChange - component unmounted, skipping update.");
                  return;
              }
              console.log("onAuthStateChange event:", event, "session:", session);
              
              if (!initialCheckDone.current && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
                initialCheckDone.current = true;
              }
              
              setLoadingAuth(true);
              console.log("onAuthStateChange - setLoadingAuth(true)");
              try {
                  const { user: processedUser, isAuthenticated: authStatus, userActive, profile } = await coreProcessUserSession(session);
                  
                  if (isMounted) {
                      setUser(processedUser);
                      setIsAuthenticated(authStatus);
                      if (authStatus && processedUser && !groupsLoaded) {
                          console.log("onAuthStateChange - User authenticated, attempting to load groups.");
                          await serviceUpdateGlobalGroupsState(updateGroups);
                      } else if (!authStatus) {
                          setGroupsLoaded(false); 
                      }
                  }
                  console.log("onAuthStateChange - user set:", processedUser, "isAuthenticated:", authStatus, "userActive:", userActive);

                  if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    if (userActive) {
                        if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/reset-password') {
                        navigate('/', { replace: true });
                        }
                    } else if (profile && (profile.status === 'pending' || profile.status === 'inactive')) {
                        if (isMounted) {
                        toast({
                            title: "Compte non actif",
                            description: profile.status === 'pending' ? "Votre compte est en attente d'approbation." : "Votre compte est inactif. Veuillez contacter un administrateur.",
                            variant: "destructive",
                        });
                        }
                        if (supabase && supabase.auth) await supabase.auth.signOut(); 
                        if (isMounted) {
                            setUser(null);
                            setIsAuthenticated(false);
                        }
                        navigate('/login', { replace: true });
                    } else if (!profile && session?.user) { 
                        if (isMounted) {
                            toast({
                                title: "Erreur de profil",
                                description: "Profil utilisateur non trouvé. Veuillez contacter un administrateur si le problème persiste.",
                                variant: "destructive",
                            });
                        }
                        if (supabase && supabase.auth) await supabase.auth.signOut();
                        if (isMounted) {
                            setUser(null);
                            setIsAuthenticated(false);
                        }
                        navigate('/login', { replace: true });
                    }
                  } else if (event === 'SIGNED_OUT') {
                    if (isMounted) {
                        setUser(null);
                        setIsAuthenticated(false);
                        setGroupsLoaded(false);
                    }
                    navigate('/login', { replace: true });
                  } else if (event === 'USER_UPDATED') {
                    if (processedUser && isMounted) {
                        setUser(processedUser);
                    }
                  } else if (event === 'PASSWORD_RECOVERY') {
                    navigate('/reset-password', { replace: true });
                  }
              } catch (error) {
                  console.error("onAuthStateChange - CRITICAL ERROR:", error);
                  if (isMounted) {
                      toast({
                          title: "Erreur d'authentification",
                          description: "Une erreur est survenue lors de la gestion de votre session.",
                          variant: "destructive",
                      });
                      setUser(null);
                      setIsAuthenticated(false);
                      setGroupsLoaded(false);
                  }
                  navigate('/login', { replace: true });
              } finally {
                  if (isMounted) {
                    setLoadingAuth(false);
                    console.log("onAuthStateChange - setLoadingAuth(false)");
                  }
              }
            });
            authListenerSubscription = authListener;

            if (!supabase) {
                console.warn("Supabase client is not initialized. Skipping authentication.");
                if (isMounted) {
                  setUser(null);
                  setIsAuthenticated(false);
                  setLoadingAuth(false);
                  toast({
                    title: "Mode hors ligne",
                    description: "L'application fonctionne en mode déconnecté. Certaines fonctionnalités peuvent être limitées.",
                    variant: "default",
                    duration: 9000,
                  });
                }
            } else {
                supabase.auth.getSession().then(({ data: { session } }) => {
                    if (!session && isMounted && !initialCheckDone.current) {
                        console.log("AuthProvider useEffect - No initial session found by getSession, setting loadingAuth to false.");
                        setLoadingAuth(false);
                        initialCheckDone.current = true;
                    } else if (session && !initialCheckDone.current) {
                        console.log("AuthProvider useEffect - Initial session found by getSession, onAuthStateChange will handle it.");
                    }
                }).catch(error => {
                    console.error("AuthProvider useEffect - Error calling getSession():", error);
                    if (isMounted && !initialCheckDone.current) {
                        setLoadingAuth(false);
                        initialCheckDone.current = true;
                    }
                });
            }

        } else {
            console.warn("Supabase client or auth is not available, cannot subscribe to onAuthStateChange. Setting loadingAuth to false.");
            if(isMounted){
                setLoadingAuth(false);
            }
        }
        
        return () => {
          isMounted = false;
          console.log("AuthProvider useEffect cleanup.");
          if (authListenerSubscription && typeof authListenerSubscription.unsubscribe === 'function') {
            authListenerSubscription.unsubscribe();
            console.log("AuthProvider useEffect - Unsubscribed from auth listener.");
          } else if (authListenerSubscription && authListenerSubscription.data && typeof authListenerSubscription.data.subscription?.unsubscribe === 'function') {
            authListenerSubscription.data.subscription.unsubscribe();
            console.log("AuthProvider useEffect - Unsubscribed from auth listener (via .data.subscription).");
          } else {
            console.warn("AuthProvider useEffect - Could not unsubscribe from auth listener, or listener was not set up.");
          }
        };
      }, [navigate, location.pathname, updateGroups, groupsLoaded]); 
      
      const value = {
        user,
        isAuthenticated,
        loadingAuth, 
        login,
        register,
        logout: authLogout,
        updateUserProfile,
        getAllUsers, 
        sendPasswordResetLink,
        resetPassword, 
        deleteUser,
        get GROUPS() { return GROUPS }, 
        USER_ROLES,
        supabase
      };

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };