import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Edit3, Users, Briefcase, ShieldCheck, Mail } from 'lucide-react';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

    const ProfileInformationForm = ({ user, profileData, onProfileDataChange, onProfilePictureUpdate, availableGroups, toast }) => {

      const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast({ title: "Image trop lourde", description: "L'image ne doit pas dépasser 2Mo.", variant: "destructive" });
            return;
          }
          if (!file.type.startsWith('image/')) {
            toast({ title: "Type de fichier invalide", description: "Veuillez sélectionner un fichier image (JPG, PNG, GIF).", variant: "destructive" });
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            onProfilePictureUpdate(reader.result, file); // Pass base64 for preview, and file for upload
          };
          reader.readAsDataURL(file);
        }
      };

      const getRoleIconAndLabel = (role) => {
        if (role === 'membre') return { icon: <Users className="mr-2 h-4 w-4 text-blue-500" />, label: 'Membre' };
        if (role === 'professeur') return { icon: <Briefcase className="mr-2 h-4 w-4 text-green-500" />, label: 'Professeur' };
        if (role === 'admin') return { icon: <ShieldCheck className="mr-2 h-4 w-4 text-purple-500" />, label: 'Admin' };
        return { icon: null, label: role };
      };
      
      const roleInfo = getRoleIconAndLabel(user.role); // Use user.role for display, it's not editable here

      return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Modifiez vos informations personnelles et votre photo de profil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.profile_picture_url || undefined} alt={`${profileData.first_name} ${profileData.last_name}`} />
                <AvatarFallback>{profileData.first_name ? profileData.first_name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profilePictureInput" className="cursor-pointer text-primary hover:underline flex items-center">
                  <Edit3 className="mr-2 h-4 w-4" /> Changer de photo
                </Label>
                <Input id="profilePictureInput" type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF. Max 2Mo.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="first_name">Prénom</Label>
                <Input id="first_name" value={profileData.first_name} onChange={(e) => onProfileDataChange('first_name', e.target.value)} className="bg-background/70" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="last_name">Nom de famille</Label>
                <Input id="last_name" value={profileData.last_name} onChange={(e) => onProfileDataChange('last_name', e.target.value)} className="bg-background/70" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email (non modifiable ici)</Label>
                <div className="flex items-center p-2 rounded-md bg-muted text-muted-foreground border border-input">
                    <Mail className="mr-2 h-4 w-4"/> {profileData.email}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input id="phone" type="tel" value={profileData.phone} onChange={(e) => onProfileDataChange('phone', e.target.value)} className="bg-background/70" />
              </div>
            </div>

            <div className="pt-4 border-t border-border/30 mt-4">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Rôle (non modifiable ici)</h3>
                 <p className="text-sm text-muted-foreground flex items-center">
                    {roleInfo.icon} {roleInfo.label}
                 </p>
            </div>

            {user.role === 'membre' && (
                <div className="pt-4 border-t border-border/30 mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Informations de l'enfant</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="child_first_name">Prénom de l'enfant</Label>
                            <Input id="child_first_name" value={profileData.child_first_name} onChange={(e) => onProfileDataChange('child_first_name', e.target.value)} className="bg-background/70" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="child_last_name">Nom de l'enfant</Label>
                            <Input id="child_last_name" value={profileData.child_last_name} onChange={(e) => onProfileDataChange('child_last_name', e.target.value)} className="bg-background/70" />
                        </div>
                    </div>
                    {availableGroups.length > 0 && (
                        <div className="space-y-1 mt-4">
                            <Label htmlFor="group_name">Groupe de l'enfant</Label>
                            <Select value={profileData.group_name || ''} onValueChange={(value) => onProfileDataChange('group_name', value)}>
                                <SelectTrigger className="w-full bg-background/70">
                                <SelectValue placeholder="Sélectionner un groupe" />
                                </SelectTrigger>
                                <SelectContent>
                                {availableGroups.map(g => (
                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            )}
          </CardContent>
        </Card>
      );
    };

    export default ProfileInformationForm;