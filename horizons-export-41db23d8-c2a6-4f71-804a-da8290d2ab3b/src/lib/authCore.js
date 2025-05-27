import { supabase } from '@/lib/supabaseClient';
    import { fetchUserProfile as serviceFetchUserProfile } from '@/lib/authServiceSupabase';

    export const processUserSession = async (session) => {
      console.log("authCore: processUserSession called with session:", session);
      if (session?.user) {
        console.log(`authCore: processUserSession - User ID from session: ${session.user.id}. Attempting to fetch profile.`);
        try {
          const userProfile = await serviceFetchUserProfile(session.user.id);
          console.log("authCore: processUserSession - userProfile fetched:", userProfile);
          if (userProfile && userProfile.status === 'active') {
            const combinedUser = { 
              ...session.user, 
              ...userProfile, 
              name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
              group_name: userProfile.user_group, 
            };
            console.log("authCore: processUserSession - user set and authenticated:", combinedUser);
            return { user: combinedUser, isAuthenticated: true, userActive: true, profile: userProfile };
          } else {
            console.warn(`authCore: processUserSession - User profile for ${session.user.id} not active or not found. Profile status: ${userProfile?.status}. Signing out.`);
            if (session?.user && supabase?.auth) { 
              await supabase.auth.signOut(); 
            }
            return { user: null, isAuthenticated: false, userActive: false, profile: userProfile };
          }
        } catch (error) {
          console.error(`authCore: Error processing user session for ${session.user.id}:`, error);
          if (session?.user && supabase?.auth) {
              console.log(`authCore: processUserSession - error caught for ${session.user.id}, signing out.`);
              await supabase.auth.signOut();
          }
          return { user: null, isAuthenticated: false, userActive: false, profile: null };
        }
      } else {
        console.log("authCore: processUserSession - no session or no user in session.");
        return { user: null, isAuthenticated: false, userActive: false, profile: null };
      }
    };

    export const initializeAuth = async (setUser, setIsAuthenticated, setLoadingAuthCallback) => {
      console.log("authCore: initializeAuth START (Simplified - primarily relies on onAuthStateChange)");
      
      if (!supabase || !supabase.auth) {
        console.warn("authCore: initializeAuth - Supabase client or auth not available.");
        if (typeof setLoadingAuthCallback === 'function') setLoadingAuthCallback(false);
        return;
      }

      try {
        console.log("authCore: initializeAuth - Checking initial session with getSession().");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("authCore: initializeAuth - Error fetching initial session:", error);
        } else if (!session) {
          console.log("authCore: initializeAuth - No active session found by getSession(). onAuthStateChange will handle if one appears.");
        } else {
          console.log("authCore: initializeAuth - Active session found by getSession(). onAuthStateChange should have already or will process it.");
        }
      } catch (e) {
        console.error("authCore: initializeAuth - CRITICAL ERROR during supabase.auth.getSession():", e);
      } finally {
        if (typeof setLoadingAuthCallback === 'function') {
          console.log("authCore: initializeAuth - Calling setLoadingAuthCallback(false) in finally block.");
          setLoadingAuthCallback(false);
        }
        console.log("authCore: initializeAuth END (Simplified)");
      }
    };