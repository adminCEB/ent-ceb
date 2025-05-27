import React, { useState, useEffect } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Save } from 'lucide-react';
    import ProfileInformationForm from '@/components/settings/ProfileInformationForm';
    import PasswordChangeForm from '@/components/settings/PasswordChangeForm';
    import NotificationPreferencesForm from '@/components/settings/NotificationPreferencesForm';
    import { defaultNotificationPreferences } from '@/lib/authUtils';
    import { supabase } from '@/lib/supabaseClient';

    const SettingsPage = () => {
      const { user, updateUserProfile, GROUPS: authGroups, loadingAuth, resetPassword } = useAuth();
      const { toast } = useToast();

      const [profileData, setProfileData] = useState({
        first_name: '', // Corresponds to Supabase table
        last_name: '',  // Corresponds to Supabase table
        phone: '',
        email: '', // Email is from auth.user, not directly editable here
        profile_picture_url: null,
        profilePictureFile: null, 
        role: '', // Not editable by user
        group_name: '', // Corresponds to Supabase table
        child_first_name: '',
        child_last_name: '',
      });

      const [notificationPreferences, setNotificationPreferences] = useState(defaultNotificationPreferences);
      const [availableGroups, setAvailableGroups] = useState([]);

      useEffect(() => {
        if (user) {
          setProfileData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            email: user.email || '', // Display only
            profile_picture_url: user.profile_picture_url || null,
            profilePictureFile: null,
            role: user.role || '',
            group_name: user.group_name || '',
            child_first_name: user.child_first_name || '',
            child_last_name: user.child_last_name || '',
          });
          setNotificationPreferences(user.notification_preferences || defaultNotificationPreferences);
        }
        const filteredGroups = authGroups.filter(g => g && g.toLowerCase() !== 'tous');
        setAvailableGroups(filteredGroups);
        if (user && user.role === 'membre' && !user.group_name && filteredGroups.length > 0) {
            setProfileData(prev => ({...prev, group_name: filteredGroups[0]}));
        }

      }, [user, authGroups]);

      const handleProfileDataChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
      };
      
      const handleProfilePictureUpdate = async (newPictureUrl, newFile) => {
        setProfileData(prev => ({ ...prev, profile_picture_url: newPictureUrl, profilePictureFile: newFile }));
        // Upload logic will be part of handleSaveChanges
      };

      const handleNotificationChange = (type) => {
        setNotificationPreferences(prev => ({ ...prev, [type]: !prev[type] }));
      };

      const handleSaveChanges = async () => {
        if (!user) {
          toast({ title: "Erreur", description: "Utilisateur non trouvé.", variant: "destructive" });
          return;
        }

        let finalProfilePictureUrl = profileData.profile_picture_url;

        if (profileData.profilePictureFile) {
          const file = profileData.profilePictureFile;
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          const filePath = `profile_pictures/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('profile_pictures')
            .upload(filePath, file, { upsert: true });

          if (uploadError) {
            toast({ title: "Erreur de téléversement d'image", description: uploadError.message, variant: "destructive" });
            return;
          }
          
          const { data: publicUrlData } = supabase.storage.from('profile_pictures').getPublicUrl(filePath);
          finalProfilePictureUrl = publicUrlData.publicUrl;
        }


        const updatesToProfileTable = { 
            first_name: profileData.first_name.trim(), 
            last_name: profileData.last_name.trim(), 
            phone: profileData.phone.trim(),
            profile_picture_url: finalProfilePictureUrl,
            notification_preferences: notificationPreferences,
            // role: user.role, // Role is not updated here by user
            group_name: user.role === 'membre' ? (profileData.group_name || (availableGroups.length > 0 ? availableGroups[0] : null )) : null,
            child_first_name: user.role === 'membre' ? profileData.child_first_name.trim() : null,
            child_last_name: user.role === 'membre' ? profileData.child_last_name.trim() : null,
            updated_at: new Date().toISOString(),
        };
        
        // Remove null or undefined values to avoid issues with Supabase update
        Object.keys(updatesToProfileTable).forEach(key => {
            if (updatesToProfileTable[key] === undefined) {
                delete updatesToProfileTable[key];
            }
        });
        
        if (user.role === 'membre' && availableGroups.length > 0 && !updatesToProfileTable.group_name) {
            toast({ title: "Groupe requis", description: "Veuillez sélectionner un groupe pour l'enfant.", variant: "destructive" });
            return;
        }

        const result = await updateUserProfile(user.id, updatesToProfileTable);

        if (result.success) {
          setProfileData(prev => ({ ...prev, profilePictureFile: null, profile_picture_url: finalProfilePictureUrl }));
          toast({ title: "Paramètres sauvegardés", description: "Vos informations ont été mises à jour." });
        } else {
          toast({ title: "Erreur", description: result.message || "La mise à jour a échoué.", variant: "destructive" });
        }
      };
      
      if (loadingAuth || !user) {
        return <div className="flex justify-center items-center h-full"><p className="text-lg text-muted-foreground">Chargement des paramètres...</p></div>;
      }

      return (
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-primary">Paramètres du compte</h1>

          <ProfileInformationForm
            user={user} // Pass the original user object
            profileData={profileData} // Pass the editable profileData state
            onProfileDataChange={handleProfileDataChange}
            onProfilePictureUpdate={handleProfilePictureUpdate}
            availableGroups={availableGroups}
            toast={toast}
          />
          
          <PasswordChangeForm 
            resetPasswordMethod={resetPassword} // Pass the method from useAuth
            toast={toast} 
          />

          <NotificationPreferencesForm 
            notificationPreferences={notificationPreferences}
            onNotificationChange={handleNotificationChange}
          />
          
          <div className="flex justify-end mt-8">
            <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white" disabled={loadingAuth}>
              {loadingAuth ? "Sauvegarde..." : <><Save className="mr-2 h-4 w-4" /> Sauvegarder tous les changements</>}
            </Button>
          </div>
        </div>
      );
    };

    export default SettingsPage;