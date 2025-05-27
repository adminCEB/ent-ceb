import { useCallback } from 'react';
    import { 
      sendPasswordResetEmail as serviceSendPasswordResetEmail,
      updateUserPassword as serviceUpdateUserPassword
    } from '@/lib/authServiceSupabase';
    import { toast } from '@/components/ui/use-toast';

    export const usePasswordActions = (setLoadingAuth) => {
      const sendPasswordResetLink = useCallback(async (email) => {
        setLoadingAuth(true);
        try {
          const result = await serviceSendPasswordResetEmail(email);
          if (result.success) {
            toast({
                title: "Email envoyé",
                description: result.message || "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.",
            });
          } else {
            toast({
                title: "Échec de l'envoi",
                description: result.message || "Une erreur est survenue.",
                variant: "destructive",
            });
          }
          return result;
        } catch (error) {
          console.error("usePasswordActions: sendPasswordResetLink - CRITICAL ERROR:", error);
          toast({
            title: "Erreur critique",
            description: "Une erreur inattendue est survenue.",
            variant: "destructive",
          });
          return { success: false, message: "Erreur critique." };
        } finally {
          setLoadingAuth(false);
        }
      }, [setLoadingAuth]);

      const resetPassword = useCallback(async (newPassword) => {
        setLoadingAuth(true);
        try {
          const result = await serviceUpdateUserPassword(newPassword);
          if (result.success) {
            toast({
                title: "Mot de passe réinitialisé",
                description: result.message || "Votre mot de passe a été mis à jour avec succès.",
            });
          } else {
            toast({
                title: "Échec de la réinitialisation",
                description: result.message || "Une erreur est survenue.",
                variant: "destructive",
            });
          }
          return result;
        } catch (error) {
          console.error("usePasswordActions: resetPassword - CRITICAL ERROR:", error);
          toast({
            title: "Erreur critique",
            description: "Une erreur inattendue est survenue.",
            variant: "destructive",
          });
          return { success: false, message: "Erreur critique." };
        } finally {
          setLoadingAuth(false);
        }
      }, [setLoadingAuth]);

      return { sendPasswordResetLink, resetPassword };
    };