import { supabase } from '@/lib/supabaseClient';
    import { fetchUserProfile } from '@/lib/authServiceSupabase';

    const REQUEST_TIMEOUT_MS = 20000;

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

    export const loginUser = async (email, password) => {
      console.log("loginUser START");
      if (!supabase || typeof supabase.auth.signInWithPassword !== 'function') {
        console.error("loginUser: Supabase client or auth method is not correctly initialized.");
        return { success: false, message: "Service d'authentification non disponible.", signOutRequired: false };
      }
      try {
        const { data: signInData, error: signInError } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password }),
          REQUEST_TIMEOUT_MS,
          'loginUser.signInWithPassword'
        );

        if (signInError) {
          console.error("loginUser - Supabase signInError:", signInError);
          if (signInError.message.includes('Failed to fetch') || signInError.message.includes('network error')) {
             return { success: false, message: "Impossible de contacter le serveur d'authentification. Veuillez vérifier votre connexion ou réessayer plus tard.", signOutRequired: false };
          }
          return { success: false, message: signInError.message, signOutRequired: false };
        }

        if (signInData.user) {
          const userProfile = await fetchUserProfile(signInData.user.id);
          if (!userProfile) {
            console.warn("loginUser - Profile not found after sign in. Potential issue with 'profiles' table or RLS. Signing out.");
            return { success: false, message: "Profil utilisateur non trouvé ou inaccessible après la connexion. Veuillez contacter un administrateur.", signOutRequired: true };
          }
          if (userProfile.status === 'pending') {
            console.warn("loginUser - User account is pending approval. Signing out.");
            return { success: false, message: "Votre compte est en attente d'approbation.", signOutRequired: true };
          }
          if (userProfile.status === 'inactive') {
            console.warn("loginUser - User account is inactive. Signing out.");
            return { success: false, message: "Votre compte est inactif. Veuillez contacter un administrateur.", signOutRequired: true };
          }
          console.log("loginUser - Login successful, profile active.");
          return { success: true, user: signInData.user, profile: userProfile };
        }
        console.warn("loginUser - No user data after successful sign in call (should not happen).");
        return { success: false, message: "Aucune donnée utilisateur retournée après la connexion.", signOutRequired: false };
      } catch (error) {
        console.error("loginUser - CRITICAL UNEXPECTED ERROR or TIMEOUT:", error);
        if (error.message.includes('timed out') || error.message.includes('Failed to fetch')) {
            return { success: false, message: "La connexion au serveur a échoué ou a pris trop de temps. Veuillez réessayer.", signOutRequired: false };
        }
        return { success: false, message: error.message || "Erreur de connexion.", signOutRequired: false };
      } finally {
        console.log("loginUser END");
      }
    };

    export const registerUser = async (userData) => {
      console.log("registerUser START");
      if (!supabase || typeof supabase.auth.signUp !== 'function') {
        console.error("registerUser: Supabase client or auth method is not correctly initialized.");
        return { success: false, message: "Service d'inscription non disponible." };
      }
      const { email, password, first_name, last_name, phone, role, user_group, child_first_name, child_last_name } = userData;
      try {
        const { data: signUpData, error: signUpError } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name,
                last_name,
                phone,
                role: role || 'membre', 
                user_group: user_group || '',
                child_first_name: child_first_name || '',
                child_last_name: child_last_name || '',
                status: 'pending', 
              }
            }
          }),
          REQUEST_TIMEOUT_MS,
          'registerUser.signUp'
        );

        if (signUpError) {
          console.error("registerUser - Supabase signUpError:", signUpError);
          if (signUpError.message.includes('Failed to fetch') || signUpError.message.includes('network error')) {
             return { success: false, message: "Impossible de contacter le serveur d'inscription. Veuillez vérifier votre connexion ou réessayer plus tard." };
          }
          return { success: false, message: signUpError.message };
        }

        if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
            console.warn("registerUser - User already registered but confirmation pending or email change requested.");
            return { success: true, message: "Si vous avez déjà un compte, veuillez vérifier vos emails pour le confirmer. Sinon, un administrateur doit approuver votre inscription." };
        }
        
        if (signUpData.user) {
          console.log("registerUser - Sign up successful, user created:", signUpData.user);
          return { success: true, user: signUpData.user, message: "Inscription réussie. Un administrateur doit approuver votre compte." };
        }
        
        console.warn("registerUser - No user data after successful sign up call.");
        return { success: false, message: "Aucune donnée utilisateur retournée après l'inscription." };

      } catch (error) {
        console.error("registerUser - CRITICAL UNEXPECTED ERROR or TIMEOUT:", error);
        if (error.message.includes('timed out') || error.message.includes('Failed to fetch')) {
            return { success: false, message: "L'inscription au serveur a échoué ou a pris trop de temps. Veuillez réessayer."};
        }
        return { success: false, message: error.message || "Erreur d'inscription." };
      } finally {
        console.log("registerUser END");
      }
    };

    export const updateUserProfileData = async (userId, profileUpdates) => {
      console.log(`updateUserProfileData for ${userId} START`);
      if (!userId) {
        console.error("updateUserProfileData: userId is null or undefined.");
        return { success: false, message: "ID utilisateur manquant." };
      }
      if (!supabase || typeof supabase.from !== 'function') {
        console.error("updateUserProfileData: Supabase client is not correctly initialized.");
        return { success: false, message: "Service de base de données non disponible." };
      }
      const updatesWithTimestamp = { ...profileUpdates, updated_at: new Date().toISOString() };
      try {
        const { data, error } = await withTimeout(
          supabase.from('profiles').update(updatesWithTimestamp).eq('id', userId).select().single(),
          REQUEST_TIMEOUT_MS,
          `updateUserProfileData for ${userId}`
        );

        if (error) {
          console.error(`updateUserProfileData for ${userId} - Supabase error:`, error);
          return { success: false, message: error.message };
        }
        console.log(`updateUserProfileData for ${userId} - Profile updated successfully:`, data);
        return { success: true, updatedUserForContext: data };
      } catch (error) {
        console.error(`updateUserProfileData for ${userId} - CRITICAL UNEXPECTED ERROR or TIMEOUT:`, error);
        if (error.message.includes('timed out') || error.message.includes('Failed to fetch')) {
             return { success: false, message: "La mise à jour du profil a échoué ou a pris trop de temps. Veuillez réessayer."};
        }
        return { success: false, message: error.message || "Erreur de mise à jour du profil." };
      } finally {
        console.log(`updateUserProfileData for ${userId} END`);
      }
    };

    export const getAllUsersProfiles = async () => {
      console.log("getAllUsersProfiles START");
      if (!supabase || typeof supabase.from !== 'function') {
        console.error("getAllUsersProfiles: Supabase client is not correctly initialized.");
        return [];
      }
      try {
        const { data, error } = await withTimeout(
          supabase.from('profiles').select('*'),
          REQUEST_TIMEOUT_MS,
          'getAllUsersProfiles'
        );
        if (error) {
          console.error("getAllUsersProfiles - Supabase error:", error);
          throw error;
        }
        console.log("getAllUsersProfiles - Profiles fetched:", data ? data.length : 0);
        return data;
      } catch (error) {
        console.error("getAllUsersProfiles - CRITICAL UNEXPECTED ERROR or TIMEOUT:", error);
        return [];
      } finally {
        console.log("getAllUsersProfiles END");
      }
    };
    
    export const deleteUserProfile = async (userIdToDelete, currentUserId) => {
      console.log(`deleteUserProfile for ${userIdToDelete} START`);
      if (userIdToDelete === currentUserId) {
        return { success: false, message: "Vous ne pouvez pas désactiver votre propre compte via cette fonction." };
      }
      if (!supabase || typeof supabase.from !== 'function') {
        console.error("deleteUserProfile: Supabase client is not correctly initialized.");
        return { success: false, message: "Service de base de données non disponible." };
      }
      try {
        const { error } = await withTimeout(
          supabase.from('profiles').update({ status: 'inactive', updated_at: new Date().toISOString() }).eq('id', userIdToDelete),
          REQUEST_TIMEOUT_MS,
          `deleteUserProfile for ${userIdToDelete}`
        );
        if (error) {
          console.error(`deleteUserProfile for ${userIdToDelete} - Supabase error:`, error);
          return { success: false, message: error.message };
        }
        console.log(`deleteUserProfile for ${userIdToDelete} - User status set to inactive.`);
        return { success: true, message: "Utilisateur désactivé avec succès." };
      } catch (error) {
        console.error(`deleteUserProfile for ${userIdToDelete} - CRITICAL UNEXPECTED ERROR or TIMEOUT:`, error);
         if (error.message.includes('timed out') || error.message.includes('Failed to fetch')) {
             return { success: false, message: "La désactivation de l'utilisateur a échoué ou a pris trop de temps. Veuillez réessayer."};
        }
        return { success: false, message: error.message || "Erreur lors de la désactivation de l'utilisateur." };
      } finally {
        console.log(`deleteUserProfile for ${userIdToDelete} END`);
      }
    };
