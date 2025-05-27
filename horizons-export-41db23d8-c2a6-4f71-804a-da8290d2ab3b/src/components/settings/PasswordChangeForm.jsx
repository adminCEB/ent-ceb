import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Button } from '@/components/ui/button';
    import { KeyRound, Eye, EyeOff } from 'lucide-react';

    const PasswordChangeForm = ({ resetPasswordMethod, toast }) => {
      const [currentPassword, setCurrentPassword] = useState(''); // Supabase updateUser doesn't need current for password change if user is logged in
      const [newPassword, setNewPassword] = useState('');
      const [confirmNewPassword, setConfirmNewPassword] = useState('');
      const [showNewPassword, setShowNewPassword] = useState(false);
      const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
      const [loading, setLoading] = useState(false);


      const handleChangePassword = async () => {
        if (!newPassword || !confirmNewPassword) {
          toast({ title: "Champs requis", description: "Veuillez remplir tous les champs pour le nouveau mot de passe.", variant: "destructive" });
          return;
        }
        if (newPassword !== confirmNewPassword) {
          toast({ title: "Mots de passe différents", description: "Les nouveaux mots de passe ne correspondent pas.", variant: "destructive" });
          return;
        }
        if (newPassword.length < 6) {
          toast({ title: "Nouveau mot de passe trop court", description: "Le nouveau mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
          return;
        }

        setLoading(true);
        const result = await resetPasswordMethod(newPassword); // resetPasswordMethod is now updateUserPassword from AuthContext
        setLoading(false);

        if (result.success) {
          toast({ title: "Mot de passe changé", description: "Votre mot de passe a été mis à jour avec succès." });
          setNewPassword('');
          setConfirmNewPassword('');
        } else {
          toast({ title: "Erreur de changement de mot de passe", description: result.message || "Impossible de changer le mot de passe.", variant: "destructive" });
        }
      };

      return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
            <CardDescription>Mettez à jour votre mot de passe. Assurez-vous qu'il est sécurisé.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-1">
                <Label htmlFor="newPassword">Nouveau mot de passe (6+ caractères)</Label>
                <div className="relative">
                    <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-background/70 pr-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                    <Input id="confirmNewPassword" type={showConfirmNewPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="bg-background/70 pr-10" />
                     <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                        {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            <Button onClick={handleChangePassword} className="bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
             {loading ? "Modification..." : <><KeyRound className="mr-2 h-4 w-4" /> Mettre à jour le mot de passe</>}
            </Button>
          </CardContent>
        </Card>
      );
    };
    export default PasswordChangeForm;