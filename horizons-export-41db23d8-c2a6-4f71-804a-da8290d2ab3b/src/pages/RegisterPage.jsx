import React, { useState, useEffect } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext'; 
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';

    const USER_ROLES_OPTIONS_FOR_REGISTRATION = ['membre', 'professeur']; 

    const RegisterPage = () => {
      const [firstName, setFirstName] = useState('');
      const [lastName, setLastName] = useState('');
      const [phone, setPhone] = useState('');
      const [childFirstName, setChildFirstName] = useState('');
      const [childLastName, setChildLastName] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [requestedRole, setRequestedRole] = useState(USER_ROLES_OPTIONS_FOR_REGISTRATION[0]);
      const [requestedGroup, setRequestedGroup] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [showConfirmPassword, setShowConfirmPassword] = useState(false);
      
      const navigate = useNavigate();
      const { toast } = useToast();
      const { GROUPS: authGroups, register, loadingAuth } = useAuth(); 
      const [displayableGroups, setDisplayableGroups] = useState([]);

      const newLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/41db23d8-c2a6-4f71-804a-da8290d2ab3b/5426486ab89174287c1f9e8ad3162eeb.png";

      useEffect(() => {
        const filteredGroups = authGroups.filter(g => g && g.toLowerCase() !== 'tous');
        setDisplayableGroups(filteredGroups);
        if (filteredGroups.length > 0 && requestedRole === 'membre') {
          setRequestedGroup(filteredGroups[0]);
        } else {
          setRequestedGroup('');
        }
      }, [authGroups, requestedRole]);


      const handleRegister = async (e) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword || !requestedRole || !phone.trim()) {
          toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
          return;
        }
        if (requestedRole === 'membre' && (!childFirstName.trim() || !childLastName.trim())) {
          toast({ title: "Champs requis pour membre", description: "Veuillez renseigner le nom et prénom de l'enfant.", variant: "destructive" });
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          toast({ title: "Email invalide", description: "Veuillez entrer une adresse email valide.", variant: "destructive" });
          return;
        }
        if (requestedRole === 'membre' && displayableGroups.length > 0 && (!requestedGroup || requestedGroup.toLowerCase() === 'tous')) {
          toast({ title: "Groupe requis", description: "Veuillez sélectionner un groupe valide pour l'enfant.", variant: "destructive" });
          return;
        }

        const registrationData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password, 
          requestedRole,
          requestedGroup: requestedRole === 'membre' ? (displayableGroups.length > 0 ? requestedGroup : 'Non spécifié') : null,
          childFirstName: requestedRole === 'membre' ? childFirstName.trim() : '',
          childLastName: requestedRole === 'membre' ? childLastName.trim() : '',
        };
        
        const result = await register(registrationData);

        if (result.success) {
          toast({ title: "Demande d'inscription envoyée", description: result.message });
          navigate('/login');
        } else {
          toast({ title: "Échec de l'inscription", description: result.message, variant: "destructive" });
        }
      };


      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-gray-100 to-neutral-200 p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Card className="w-full max-w-xl bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl">
              <form onSubmit={handleRegister}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    <img  alt="Logo Choeur d'Enfants de Bretagne" className="h-20 w-auto" src={newLogoUrl} />
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                    Demande d'Inscription
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Remplissez le formulaire pour demander un accès à la plateforme. Un administrateur validera votre compte.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="AdminPrénom" className="bg-background/70" />
                      </div>
                      <div className="space-y-1">
                          <Label htmlFor="lastName">Nom de famille</Label>
                          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="AdminNom" className="bg-background/70" />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="choeurdenfantsdebretagne@gmail.com" className="bg-background/70" />
                      </div>
                      <div className="space-y-1">
                          <Label htmlFor="phone">Numéro de téléphone</Label>
                          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0612345678" className="bg-background/70" />
                      </div>
                  </div>

                  {requestedRole === 'membre' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/30 mt-4">
                          <div className="space-y-1">
                              <Label htmlFor="childFirstName">Prénom de l'enfant</Label>
                              <Input id="childFirstName" value={childFirstName} onChange={(e) => setChildFirstName(e.target.value)} placeholder="Alice" className="bg-background/70" />
                          </div>
                          <div className="space-y-1">
                              <Label htmlFor="childLastName">Nom de l'enfant</Label>
                              <Input id="childLastName" value={childLastName} onChange={(e) => setChildLastName(e.target.value)} placeholder="Dupont" className="bg-background/70" />
                          </div>
                      </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/30 mt-4">
                      <div className="space-y-1">
                          <Label htmlFor="password">Mot de passe (6+ caractères)</Label>
                          <div className="relative">
                              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="adminCEB2019**" className="bg-background/70 pr-10" />
                              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                          </div>
                      </div>
                      <div className="space-y-1">
                          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                          <div className="relative">
                              <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="adminCEB2019**" className="bg-background/70 pr-10" />
                              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                          </div>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <Label htmlFor="requestedRole">Je suis un(e)</Label>
                          <Select onValueChange={setRequestedRole} value={requestedRole}>
                              <SelectTrigger className="w-full bg-background/70"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  {USER_ROLES_OPTIONS_FOR_REGISTRATION.map(role => <SelectItem key={role} value={role}>{role === 'membre' ? 'Membre (Parent)' : 'Professeur'}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      {requestedRole === 'membre' && displayableGroups.length > 0 && (
                          <div className="space-y-1">
                              <Label htmlFor="requestedGroup">Groupe de l'enfant</Label>
                              <Select onValueChange={setRequestedGroup} value={requestedGroup}>
                                  <SelectTrigger className="w-full bg-background/70"><SelectValue placeholder="Sélectionner un groupe" /></SelectTrigger>
                                  <SelectContent>
                                      {displayableGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                      )}
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loadingAuth}>
                    {loadingAuth ? "Envoi en cours..." : <><UserPlus className="mr-2 h-5 w-5" /> Envoyer ma demande</>}
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="link" asChild>
                    <Link to="/login" className="text-muted-foreground hover:text-primary">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
                    </Link>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default RegisterPage;