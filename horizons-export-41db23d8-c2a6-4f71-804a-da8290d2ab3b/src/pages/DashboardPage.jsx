import React, { useState, useEffect, useCallback } from 'react';
    import { Link } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { CalendarDays, FileText, MessageSquare, Users, Settings, LogOut, ArrowRight, Car, Image as ImageIcon, ShieldAlert } from 'lucide-react';
    import { motion } from 'framer-motion';

    const QuickLinkCard = ({ title, description, icon: Icon, link, color }) => (
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.1)" }}
        className="h-full"
      >
        <Link to={link}>
          <Card className={`h-full flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${color} bg-card/70 backdrop-blur-sm`}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">{description}</CardDescription>
            </CardContent>
            <CardContent className="mt-auto">
               <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary/80">
                Accéder <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );

    const StatCard = ({ title, value, icon: Icon, description }) => (
      <Card className="shadow-md bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
      </Card>
    );

    const DashboardPage = () => {
      const { user, logout, supabase: supabaseClientFromAuth } = useAuth();
      const [stats, setStats] = useState({
        upcomingEvents: 0,
        recentDocuments: 0,
        pendingAbsences: 0,
      });
      const [isLoadingStats, setIsLoadingStats] = useState(true);
      const newLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/41db23d8-c2a6-4f71-804a-da8290d2ab3b/5426486ab89174287c1f9e8ad3162eeb.png";


      const fetchDashboardStats = useCallback(async () => {
        if (!user || !supabaseClientFromAuth) return;
        setIsLoadingStats(true);
        
        try {
          const today = new Date().toISOString().split('T')[0];
          let upcomingEventsCount = 0;
          let recentDocumentsCount = 0;
          let pendingAbsencesCount = 0;

          let eventsQuery = supabaseClientFromAuth.from('events').select('id', { count: 'exact' }).gte('date', today);
          if (user.role === 'membre' && user.group_name) {
            eventsQuery = eventsQuery.or(`groups.cs.{"Tous"},groups.cs.{"${user.group_name}"}`);
          }
          const { count: eventsCount, error: eventsError } = await eventsQuery;
          if (!eventsError) upcomingEventsCount = eventsCount || 0;
          else console.error("Error fetching events stats:", eventsError);


          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          let docsQuery = supabaseClientFromAuth.from('documents').select('id', { count: 'exact' }).gte('upload_date', sevenDaysAgo).eq('is_message_attachment', false);
           if (user.role === 'membre' && user.group_name) {
            docsQuery = docsQuery.or(`groups.cs.{"Tous"},groups.cs.{"${user.group_name}"}`);
          }
          const { count: docsCount, error: docsError } = await docsQuery;
          if (!docsError) recentDocumentsCount = docsCount || 0;
          else console.error("Error fetching documents stats:", docsError);


          if (user.role === 'admin' || user.role === 'professeur') {
            const { count: absencesCount, error: absencesError } = await supabaseClientFromAuth
              .from('absences')
              .select('id', { count: 'exact' })
              .eq('status', 'DEMANDEE');
            if (!absencesError) pendingAbsencesCount = absencesCount || 0;
            else console.error("Error fetching absences stats:", absencesError);
          }

          setStats({
            upcomingEvents: upcomingEventsCount,
            recentDocuments: recentDocumentsCount,
            pendingAbsences: pendingAbsencesCount,
          });

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setIsLoadingStats(false);
        }

      }, [user, supabaseClientFromAuth]);

      useEffect(() => {
        fetchDashboardStats();
      }, [fetchDashboardStats]);


      const quickLinks = [
        { title: "Agenda", description: "Consultez les événements et répétitions.", icon: CalendarDays, link: "/agenda", color: "border-purple-500" },
        { title: "Documents", description: "Accédez aux partitions et documents partagés.", icon: FileText, link: "/documents", color: "border-blue-500" },
        { title: "Messagerie", description: "Communiquez avec les autres membres.", icon: MessageSquare, link: "/messages", color: "border-green-500" },
        { title: "Galerie Photos", description: "Revivez les moments forts en images.", icon: ImageIcon, link: "/galerie", color: "border-teal-500" },
        { title: "Covoiturages", description: "Organisez vos trajets pour les événements.", icon: Car, link: "/covoiturages", color: "border-orange-500" },
      ];
      
      if (user?.role === 'membre') {
        quickLinks.push({ title: "Mes Absences", description: "Gérez vos déclarations d'absence.", icon: ShieldAlert, link: "/mes-absences", color: "border-red-500" });
      }
      if (user?.role === 'professeur' || user?.role === 'admin') {
         quickLinks.push({ title: "Gestion Absences", description: "Traitez les demandes d'absence.", icon: ShieldAlert, link: "/absences", color: "border-red-500" });
      }
      if (user?.role === 'admin') {
        quickLinks.push({ title: "Gestion Utilisateurs", description: "Administrez les comptes et inscriptions.", icon: Users, link: "/user-management", color: "border-indigo-500" });
      }

      if (!user) {
        return <div className="p-4 text-center">Chargement des informations utilisateur...</div>;
      }
      
      const greetingName = user.first_name || user.name || user.email;

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-neutral-200"
        >
          <header className="mb-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
                <img src={user.profile_picture_url || newLogoUrl} alt="Profil" className="h-16 w-16 rounded-full object-cover border-2 border-primary shadow-sm" />
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">
                        Bonjour, {greetingName} !
                    </h1>
                    <p className="text-muted-foreground">Bienvenue sur votre tableau de bord.</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button variant="outline" asChild>
                    <Link to="/settings"><Settings className="mr-2 h-4 w-4" /> Paramètres</Link>
                </Button>
                <Button variant="destructive_outline" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </Button>
            </div>
          </header>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Aperçu rapide</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard title="Événements à venir" value={isLoadingStats ? '...' : stats.upcomingEvents} icon={CalendarDays} description="Planifiés prochainement" />
              <StatCard title="Documents Récents" value={isLoadingStats ? '...' : stats.recentDocuments} icon={FileText} description="Ajoutés cette semaine" />
              {(user.role === 'admin' || user.role === 'professeur') && (
                <StatCard title="Absences en attente" value={isLoadingStats ? '...' : stats.pendingAbsences} icon={ShieldAlert} description="À traiter" />
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Accès rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((item) => (
                <QuickLinkCard key={item.title} {...item} />
              ))}
            </div>
          </section>
          
        </motion.div>
      );
    };

    export default DashboardPage;