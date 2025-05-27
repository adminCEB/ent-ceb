import { USER_ROLES } from '@/contexts/AuthContext';

    export const defaultNotificationPreferences = { 
      agenda: true, 
      documents: true, 
      messages: true, 
      carpooling: true,
      gallery: true,
      absences: true
    };

    export const cleanUserForStorage = (user) => {
      if (!user) return null;
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    };
    
    export const getAllStoredUsers = () => {
      console.warn("getAllStoredUsers is deprecated and uses localStorage. Data should be fetched from Supabase.");
      return [];
    };

    export const saveAllStoredUsers = (users) => {
      console.warn("saveAllStoredUsers is deprecated and uses localStorage. Data should be saved to Supabase.");
    };

    export const getDerivedGroups = () => {
      console.warn("getDerivedGroups is deprecated and uses localStorage. Groups should be derived from Supabase data.");
      return ['Tous'];
    };