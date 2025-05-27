import React, { useState, useEffect } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

    const LoginPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const { login, loadingAuth: globalLoadingAuth, isAuthenticated } = useAuth(); 
      const [isSubmitting, setIsSubmitting] = useState(false); 
      const [showPassword, setShowPassword] = useState(false);
      const navigate = useNavigate();
      const { toast } = useToast();
      const newLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/41db23d8-c2a6-4f71-804a-da8290d2ab3b/5426486ab89174287c1f9e8ad3162eeb.png";

      useEffect(() => {
        if (isAuthenticated && !globalLoadingAuth) {
          navigate('/', { replace: true });
        }
      }, [isAuthenticated, globalLoadingAuth, navigate]);


      const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
          toast({ title: "Champs requis", description: "Veuillez entrer votre email et mot de passe.", variant: "destructive" });
          return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          toast({ title: "Email invalide", description: "Veuillez entrer une adresse email valide.", variant: "destructive" });
          return;
        }
        
        setIsSubmitting(true);
        const result = await login(email, password);
        setIsSubmitting(false);

        if (result.success && result.user) {
            const roleDisplay = result.user.role ? result.user.role.charAt(0).toUpperCase() + result.user.role.slice(1) : 'Utilisateur';
            toast({ title: "Connexion réussie!", description: `Bienvenue ${result.user.first_name || result.user.email} (${roleDisplay}).` });
        } else if (!result.success) {
            toast({ 
              title: "Échec de la connexion", 
              description: result.message || "Identifiants incorrects ou utilisateur non actif/approuvé.", 
              variant: "destructive",
              duration: result.message && (result.message.includes("confirmer votre adresse e-mail") || result.message.includes("approbation par un administrateur") || result.message.includes("attente d'approbation")) ? 9000 : 5000 
            });
        }
      };
      
      if (globalLoadingAuth && !isAuthenticated) { 
        return (
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-gray-100 to-neutral-200 p-4">
            <p className="text-xl font-semibold text-primary animate-pulse">Vérification de la session...</p>
          </div>
        );
      }


      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-gray-100 to-neutral-200 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl">
              <form onSubmit={handleLogin}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    <img  alt="Logo Choeur d'Enfants de Bretagne" className="h-20 w-auto" src={newLogoUrl} />
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                    ENT Chœur d'Enfants de Bretagne
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Connectez-vous pour accéder à votre espace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" autoComplete="email" placeholder="votre.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/70" disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/70 pr-10" disabled={isSubmitting} />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="link" size="sm" asChild className="text-xs text-muted-foreground hover:text-primary">
                          <Link tabIndex={-1} to="/forgot-password">Mot de passe oublié ?</Link>
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || globalLoadingAuth}>
                    {isSubmitting ? "Connexion en cours..." : <><LogIn className="mr-2 h-4 w-4" /> Se connecter</>}
                  </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Pas encore de compte ?
                  </p>
                  <Button variant="outline" asChild className="w-full" disabled={isSubmitting || globalLoadingAuth}>
                    <Link to="/register">
                      <UserPlus className="mr-2 h-4 w-4" /> Demander une inscription
                    </Link>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default LoginPage;