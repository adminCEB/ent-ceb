import React, { useState, useEffect } from 'react';
    import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import {
      LayoutDashboard, CalendarDays, FolderKanban, MessageSquare, Settings, Users,
      LogOut, Menu, X, ShieldCheck, Car, Image as ImageIcon, UserCheck, Info
    } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';

    const allNavLinks = [
      { to: "/", icon: LayoutDashboard, label: "Tableau de bord", roles: ["admin", "professeur", "membre"] },
      { to: "/agenda", icon: CalendarDays, label: "Agenda", roles: ["admin", "professeur", "membre"] },
      { to: "/documents", icon: FolderKanban, label: "Documents", roles: ["admin", "professeur", "membre"] },
      { to: "/messages", icon: MessageSquare, label: "Messages", roles: ["admin", "professeur", "membre"] },
      { to: "/covoiturages", icon: Car, label: "Covoiturages", roles: ["admin", "professeur", "membre"] },
      { to: "/galerie", icon: ImageIcon, label: "Galerie", roles: ["admin", "professeur", "membre"] },
      { to: "/mes-absences", icon: UserCheck, label: "Mes Absences", roles: ["membre"] },
      { to: "/absences", icon: ShieldCheck, label: "Gestion Absences", roles: ["admin", "professeur"] },
      { to: "/user-management", icon: Users, label: "Gestion Utilisateurs", roles: ["admin"] },
      { to: "/settings", icon: Settings, label: "Paramètres", roles: ["admin", "professeur", "membre"] },
    ];

    const NavItem = ({ to, icon: Icon, label, onClick }) => (
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out
           ${isActive
            ? 'bg-primary/20 text-primary border-r-4 border-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`
        }
      >
        <Icon className="h-5 w-5 mr-3" />
        {label}
      </NavLink>
    );

    const MainLayout = ({ children }) => {
      const { user, logout, loadingAuth } = useAuth();
      const navigate = useNavigate();
      const location = useLocation();
      const { toast } = useToast();
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [availableNavLinks, setAvailableNavLinks] = useState([]);
      const newLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/41db23d8-c2a6-4f71-804a-da8290d2ab3b/5426486ab89174287c1f9e8ad3162eeb.png";


      useEffect(() => {
        if (user && user.role && !loadingAuth) {
          const filteredLinks = allNavLinks.filter(link => link.roles.includes(user.role));
          setAvailableNavLinks(filteredLinks);
        } else if (!loadingAuth && !user) {
          setAvailableNavLinks([]);
        }
      }, [user, loadingAuth]);

      const handleLogout = async () => {
        try {
          await logout();
          toast({ title: "Déconnexion réussie", description: "Vous avez été déconnecté." });
          navigate('/login');
        } catch (error) {
          toast({ title: "Erreur de déconnexion", description: error.message, variant: "destructive" });
        }
        setSidebarOpen(false);
      };

      const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
      };
      
      if (loadingAuth) {
        return (
          <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
            <p className="text-xl font-semibold text-primary animate-pulse">Chargement du profil...</p>
          </div>
        );
      }

      return (
        <div className="flex h-screen bg-background text-foreground">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col lg:hidden"
              >
                <SidebarContent 
                  user={user} 
                  logoUrl={newLogoUrl} 
                  availableNavLinks={availableNavLinks} 
                  onLinkClick={() => setSidebarOpen(false)} 
                  onLogout={handleLogout} 
                  getInitials={getInitials}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-card">
             <SidebarContent 
                user={user} 
                logoUrl={newLogoUrl}
                availableNavLinks={availableNavLinks} 
                onLinkClick={() => {}} 
                onLogout={handleLogout}
                getInitials={getInitials}
              />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-card border-b border-border lg:justify-end">
              <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                   {user ? `Bienvenue, ${user.first_name || user.email}` : 'Invité'}
                </span>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profile_picture_url || undefined} alt={user?.name || 'Avatar'} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user ? getInitials(user.name) : <Info className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/40">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      );
    };
    
    const SidebarContent = ({ user, logoUrl, availableNavLinks, onLinkClick, onLogout, getInitials }) => {
      const userRoleDisplay = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Non défini";
      return (
        <>
          <div className="flex items-center h-16 px-4 border-b border-border">
            <Link to="/" className="flex items-center space-x-2" onClick={onLinkClick}>
              <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
              <span className="font-semibold text-lg text-primary truncate">CEB ENT</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 p-3">
            <nav className="space-y-1">
              {availableNavLinks.map((link) => (
                <NavItem key={link.to} {...link} onClick={onLinkClick} />
              ))}
            </nav>
          </ScrollArea>
          <div className="p-4 border-t border-border mt-auto">
            <div className="flex items-center mb-3">
                <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={user?.profile_picture_url || undefined} alt={user?.name || "Avatar"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {user ? getInitials(user.name) : <Info className="h-5 w-5"/>}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold truncate" title={user?.name || "Utilisateur"}>{user?.name || "Utilisateur"}</p>
                    <p className="text-xs text-muted-foreground truncate" title={userRoleDisplay}>{userRoleDisplay}</p>
                </div>
            </div>
            <Button variant="outline" className="w-full" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </>
      );
    };
    export default MainLayout;