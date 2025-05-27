import React, { useState, useEffect } from 'react';
    import { useNavigate, useParams, Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react';

    const ResetPasswordPage = () => {
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [showConfirmPassword, setShowConfirmPassword] = useState(false);
      const { resetToken } = useParams(); 
      const { resetPassword: resetPasswordWithToken, loadingAuth, supabase } = useAuth();
      const navigate = useNavigate();
      const { toast } = useToast();
      const newLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/41db23d8-c2a6-4f71-804a-da8290d2ab3b/5426486ab89174287c1f9e8ad3162eeb.png";

      useEffect(() => {
        // Supabase gère le token via l'URL de redirection et `onAuthStateChange` avec l'événement `PASSWORD_RECOVERY`
        // Le `resetToken` de l'URL n'est pas directement utilisé pour appeler une fonction `confirmPasswordReset`
        // Si `supabase.auth.onAuthStateChange` capture `PASSWORD_RECOVERY`, l'utilisateur est authentifié
        // et peut mettre à jour son mot de passe via `updateUser`.
        
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "PASSWORD_RECOVERY") {
            // L'utilisateur est maintenant dans une session où il peut mettre à jour son mot de passe
            // Ce token (s'il est dans l'URL) a été traité par Supabase pour permettre cette session.
            toast({ title: "Authentification réussie", description: "Vous pouvez maintenant définir un nouveau mot de passe." });
          }
        });
    
        return () => {
          authListener.subscription.unsubscribe();
        };
      }, [supabase, toast]);


      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
          toast({ title: "Champs requis", description: "Veuillez entrer et confirmer votre nouveau mot de passe.", variant: "destructive" });
          return;
        }
        if (password !== confirmPassword) {
          toast({ title: "Mots de passe différents", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
          return;
        }
        if (password.length < 6) {
          toast({ title: "Mot de passe trop court", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
          return;
        }
        
        const result = await resetPasswordWithToken(password);

        if (result.success) {
          toast({ title: "Mot de passe réinitialisé", description: "Votre mot de passe a été changé avec succès. Vous pouvez maintenant vous connecter." });
          await supabase.auth.signOut(); // Déconnecter après la mise à jour pour forcer une nouvelle connexion
          navigate('/login');
        } else {
          toast({ title: "Erreur", description: result.message || "Impossible de réinitialiser le mot de passe. Le lien est peut-être expiré ou invalide.", variant: "destructive" });
        }
      };

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-gray-100 to-neutral-200 p-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl">
              <CardHeader className="text-center">
                 <div className="mx-auto mb-4">
                    <img alt="Logo Choeur d'Enfants de Bretagne" className="h-20 w-auto" src={newLogoUrl} />
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-primary">Réinitialiser le mot de passe</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choisissez un nouveau mot de passe sécurisé.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="password">Nouveau mot de passe (6+ caractères)</Label>
                     <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className="bg-background/70 pr-10" />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <div className="relative">
                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="********" className="bg-background/70 pr-10" />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loadingAuth}>
                    {loadingAuth ? "Enregistrement..." : <><KeyRound className="mr-2 h-4 w-4" /> Changer le mot de passe</>}
                  </Button>
                </CardContent>
              </form>
               <CardFooter className="flex justify-center">
                <Button variant="link" asChild>
                  <Link to="/login" className="text-muted-foreground hover:text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default ResetPasswordPage;