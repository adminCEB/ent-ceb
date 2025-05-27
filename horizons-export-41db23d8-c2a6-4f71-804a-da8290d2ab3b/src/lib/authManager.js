import { supabase } from '@/lib/supabaseClient';
    import { fetchUserProfile as serviceFetchUserProfile } from '@/lib/authServiceSupabase';

    export const processUserSessionInternal = async (session) => {
      console.log("DEPRECATED: authManager: processUserSessionInternal called. Use AuthContext version.");
      if (session?.user) {
        try {
          const userProfile = await serviceFetchUserProfile(session.user.id);
          if (userProfile && userProfile.status === 'active') {
            const combinedUser = { 
              ...session.user, 
              ...userProfile, 
              name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
              group_name: userProfile.user_group, 
            };
            return { user: combinedUser, isAuthenticated: true, userActive: true, profile: userProfile };
          } else {
            if (session?.user) { 
              await supabase.auth.signOut(); 
            }
            return { user: null, isAuthenticated: false, userActive: false, profile: userProfile };
          }
        } catch (error) {
          console.error("DEPRECATED: authManager: Error processing user session:", error);
          if (session?.user) {
              await supabase.auth.signOut();
          }
          return { user: null, isAuthenticated: false, userActive: false, profile: null };
        }
      } else {
        return { user: null, isAuthenticated: false, userActive: false, profile: null };
      }
    };

    export const initializeAuthInternal = async (setUser, setIsAuthenticated) => {
      console.log("DEPRECATED: authManager: initializeAuthInternal called. Use AuthContext version.");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      try {
        const { user, isAuthenticated: authStatus } = await processUserSessionInternal(sessionData?.session);
        setUser(user);
        setIsAuthenticated(authStatus);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };