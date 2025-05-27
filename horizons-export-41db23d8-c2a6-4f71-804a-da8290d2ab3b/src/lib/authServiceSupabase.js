import { supabase } from '@/lib/supabaseClient';

    const REQUEST_TIMEOUT_MS = 30000; 

    const withTimeout = (promise, timeoutMs, operationName = 'Unnamed operation') => {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutId);
      });
    };

    export const fetchUserProfile = async (userId) => {
      console.log(`fetchUserProfile for ${userId} START - Attempting REAL Supabase query with MINIMAL column selection.`);
      if (!userId) {
        console.error("fetchUserProfile: userId is null or undefined.");
        return null;
      }
      if (!supabase || typeof supabase.from !== 'function') {
        console.error("fetchUserProfile: Supabase client is not correctly initialized.");
        return null;
      }
      
      const essentialColumns = 'id, first_name, last_name, email, role, user_group, status';
      
      try {
        const { data: profile, error } = await withTimeout(
          supabase.from('profiles').select(essentialColumns).eq('id', userId).single(),
          REQUEST_TIMEOUT_MS,
          `fetchUserProfile for ${userId}`
        );

        if (error) {
          console.error(`fetchUserProfile for ${userId} - Supabase error:`, error);
          if (error.code === 'PGRST116' || (error.message && error.message.includes("JSON object requested, multiple (or no) rows returned"))) { 
            console.warn(`fetchUserProfile for ${userId}: Profile not found or multiple profiles exist for this ID. (PGRST116 or similar)`);
            return null; 
          }
          return null; 
        }
        console.log(`fetchUserProfile for ${userId} - Profile fetched successfully:`, profile);
        return profile;
      } catch (error) {
        console.error(`fetchUserProfile for ${userId} - CRITICAL UNEXPECTED ERROR or TIMEOUT:`, error);
        return null;
      } finally {
        console.log(`fetchUserProfile for ${userId} END`);
      }
    };

    export const updateGlobalGroupsState = async (setGroupsCallback) => {
      console.log("updateGlobalGroupsState START - Attempting REAL Supabase query.");
      if (!supabase || typeof supabase.from !== 'function') {
        console.error("updateGlobalGroupsState: Supabase client is not correctly initialized.");
        setGroupsCallback(['Tous']);
        return;
      }
      try {
        const { data, error } = await withTimeout(
          supabase.from('profiles').select('user_group').not('user_group', 'is', null).neq('user_group', ''),
          REQUEST_TIMEOUT_MS,
          'updateGlobalGroupsState.fetchUserGroups'
        );

        if (error) {
          console.error("updateGlobalGroupsState - Supabase error fetching groups:", error);
          setGroupsCallback(['Tous']); 
          return;
        }

        let uniqueGroups = ['Tous']; 
        if (data) {
          const distinctGroups = [...new Set(data.map(profile => profile.user_group).filter(group => group && group.trim() !== ''))];
          uniqueGroups = ['Tous', ...distinctGroups.sort()];
        }
        
        setGroupsCallback(uniqueGroups);
        console.log("updateGlobalGroupsState - Groups updated from Supabase:", uniqueGroups);

      } catch (error) {
        console.error("updateGlobalGroupsState - CRITICAL UNEXPECTED ERROR or TIMEOUT:", error);
        setGroupsCallback(['Tous']); 
      } finally {
        console.log("updateGlobalGroupsState END");
      }
    };
    
    export const sendPasswordResetEmail = async (email) => {
      console.log("sendPasswordResetEmail START");
      if (!supabase || typeof supabase.auth.resetPasswordForEmail !== 'function') {
        console.error("sendPasswordResetEmail: Supabase client or auth method is not correctly initialized.");
        return { success: false, message: "Service d'authentification non disponible." };
      }
      try {
        const { error } = await withTimeout(
          supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          }),
          REQUEST_TIMEOUT_MS,
          'sendPasswordResetEmail'
        );
        if (error) {
          console.error("sendPasswordResetEmail - Supabase error:", error);
          return { success: false, message: error.message };
        }
        console.log("sendPasswordResetEmail - Password reset email sent successfully.");
        return { success: true, message: "Email de réinitialisation envoyé." };
      } catch (error) {
        console.error("sendPasswordResetEmail - CRITICAL UNEXPECTED ERROR or TIMEOUT:", error);
        return { success: false, message: error.message || "Erreur lors de l'envoi de l'email." };
      } finally {
        console.log("sendPasswordResetEmail END");
      }
    };

    export const updateUserPassword = async (newPassword) => {
      console.log("updateUserPassword START");
      if (!supabase || typeof supabase.auth.updateUser !== 'function') {
        console.error("updateUserPassword: Supabase client or auth method is not correctly initialized.");
        return { success: false, message: "Service d'authentification non disponible." };
      }
      try {
        const { error } = await withTimeout(
          supabase.auth.updateUser({ password: newPassword }),
          REQUEST_TIMEOUT_MS,
          'updateUserPassword'
        );
        if (error) {
          console.error("updateUserPassword - Supabase error:", error);
          return { success: false, message: error.message };
        }
        console.log("updateUserPassword - Password updated successfully.");
        return { success: true, message: "Mot de passe mis à jour." };
      } catch (error) {
        console.error("updateUserPassword - CRITICAL UNEXPECTED ERROR or TIMEOUT:", error);
        return { success: false, message: error.message || "Erreur de mise à jour du mot de passe." };
      } finally {
        console.log("updateUserPassword END");
      }
    };