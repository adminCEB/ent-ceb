import { 
      getAllStoredUsers, 
      saveAllStoredUsers, 
      cleanUserForStorage, 
      defaultNotificationPreferences,
      ADMIN_EMAIL
    } from './authUtils';

    export const loginUser = (email, passwordToVerify) => {
      const allUsers = getAllStoredUsers();
      const foundUser = allUsers.find(u => u.email === email && u.password === passwordToVerify && u.status === 'active');
      if (foundUser) {
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return cleanUserForStorage(foundUser);
      }
      return null;
    };

    export const registerUser = (userData) => {
      let allUsers = getAllStoredUsers();
      const existingUserByEmail = allUsers.find(u => u.email === userData.email);
      if (existingUserByEmail) {
        return { success: false, message: "Un utilisateur avec cet email existe déjà (actif ou en attente)." };
      }
      
      let pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations')) || [];
      const existingPendingByEmail = pendingRegistrations.find(p => p.email === userData.email);
      if (existingPendingByEmail) {
        return { success: false, message: "Une demande d'inscription avec cet email est déjà en cours." };
      }

      const newUser = { 
        id: `pending-${Date.now()}`, 
        ...userData, 
        name: `${userData.firstName} ${userData.lastName}`,
        profilePicture: userData.profilePicture || null, 
        status: 'pending',
        notificationPreferences: defaultNotificationPreferences
      };

      pendingRegistrations.push(newUser);
      localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRegistrations));

      const admins = allUsers.filter(u => u.role === 'admin' && u.status === 'active');
      if (admins.length > 0) {
        admins.forEach(admin => {
          console.log(`SIMULATION: Email envoyé à l'administrateur ${admin.email} pour la nouvelle demande d'inscription de ${newUser.email}.`);
        });
      } else {
        console.log(`SIMULATION: Email envoyé à l'administrateur par défaut ${ADMIN_EMAIL} pour la nouvelle demande d'inscription de ${newUser.email}. (Aucun admin actif trouvé)`);
      }
      
      return { success: true, message: "Votre demande d'inscription a été envoyée. Elle sera examinée par un administrateur." };
    };

    export const updateUserProfile = (userId, updatedData, currentUserFromContext) => {
      let allUsers = getAllStoredUsers();
      let userUpdated = false;
      let updatedUserForContext = null;

      const updatedUsersList = allUsers.map(u => {
        if (u.id === userId) {
          userUpdated = true;
          const newUserData = { 
            ...u, 
            ...updatedData, 
            name: `${updatedData.firstName || u.firstName} ${updatedData.lastName || u.lastName}` 
          };
          
          if (updatedData.profilePictureFile) {
            delete newUserData.profilePictureFile; 
          }

          if (currentUserFromContext && currentUserFromContext.id === userId) {
            updatedUserForContext = cleanUserForStorage(newUserData);
            localStorage.setItem('currentUser', JSON.stringify(newUserData));
          }
          return newUserData;
        }
        return u;
      });

      if (userUpdated) {
        saveAllStoredUsers(updatedUsersList);
        return { success: true, message: "Profil mis à jour avec succès.", updatedUserForContext };
      }
      return { success: false, message: "Utilisateur non trouvé." };
    };

    export const getAllActiveUsersList = () => {
      return getAllStoredUsers().filter(u => u.status === 'active');
    };

    export const requestPasswordReset = (email) => {
      const allUsers = getAllStoredUsers();
      const userExists = allUsers.find(u => u.email === email && u.status === 'active');
      if (userExists) {
        const resetToken = `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(`resetToken_${userExists.id}`, resetToken); 
        console.log(`Lien de réinitialisation pour ${email}: /reset-password/${resetToken} (jeton stocké pour la démo pour l'utilisateur ID: ${userExists.id})`);
        return { success: true, message: "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé (vérifiez la console pour la démo)." };
      }
      return { success: false, message: "Aucun utilisateur actif trouvé avec cet email." };
    };

    export const confirmPasswordReset = (token, newPassword) => {
      let userIdForToken = null;
      
      for (const key in localStorage) {
        if (key.startsWith('resetToken_') && localStorage.getItem(key) === token) {
          userIdForToken = key.substring('resetToken_'.length);
          break;
        }
      }

      if (!userIdForToken) {
        return { success: false, message: "Jeton de réinitialisation invalide ou expiré." };
      }

      let allUsers = getAllStoredUsers();
      const userIndex = allUsers.findIndex(u => u.id === userIdForToken && u.status === 'active');
      
      if (userIndex === -1) {
        localStorage.removeItem(`resetToken_${userIdForToken}`);
        return { success: false, message: "Utilisateur non trouvé ou inactif pour ce jeton." };
      }

      allUsers[userIndex].password = newPassword;
      saveAllStoredUsers(allUsers);
      localStorage.removeItem(`resetToken_${userIdForToken}`);
      return { success: true, message: "Mot de passe réinitialisé avec succès." };
    };

    export const removeUser = (userId, currentAdminId) => {
      if (userId === currentAdminId) {
        return { success: false, message: "Un administrateur ne peut pas supprimer son propre compte.", performLogout: false };
      }
      let allUsers = getAllStoredUsers();
      const userToRemove = allUsers.find(u => u.id === userId);
      if (!userToRemove) {
        return { success: false, message: "Utilisateur non trouvé.", performLogout: false };
      }

      allUsers = allUsers.filter(u => u.id !== userId);
      saveAllStoredUsers(allUsers);
      
      const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
      let performLogout = false;
      if (currentUserData && currentUserData.id === userId) { 
        performLogout = true;
      }
      return { success: true, message: `Utilisateur ${userToRemove.name} supprimé.`, performLogout };
    };