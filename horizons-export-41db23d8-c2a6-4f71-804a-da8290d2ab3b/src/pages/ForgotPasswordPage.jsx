import React, { useState } from 'react';
    import { Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Mail, ArrowLeft } from 'lucide-react';

    const ForgotPasswordPage = () => {
      const [email, setEmail] = useState('');
      const { sendPasswordResetLink, loadingAuth } = useAuth();
      const { toast } = useToast();
      const newLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/41db23d8-c2a6-4f71-804a-da8290d2ab3b/5426486ab89174287c1f9e8ad3162eeb.png";


      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
          toast({ title: "Email requis", description: "Veuillez entrer votre adresse email.", variant: "destructive" });
          return;
        }
        
        const result = await sendPasswordResetLink(email);

        if (result.success) {
          toast({ title: "Email envoyé", description: result.message });
        } else {
          toast({ title: "Erreur", description: result.message, variant: "destructive" });
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
                <CardTitle className="text-3xl font-bold tracking-tight text-primary">Mot de passe oublié ?</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Entrez votre email pour recevoir un lien de réinitialisation.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/70"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loadingAuth}>
                    {loadingAuth ? "Envoi en cours..." : <><Mail className="mr-2 h-4 w-4" /> Envoyer le lien</>}
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

    export default ForgotPasswordPage;