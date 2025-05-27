import React, { useState, useEffect, useMemo } from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Image as ImageIcon, UploadCloud, Eye, Trash2, UserCircle } from 'lucide-react';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogTrigger,
    } from "@/components/ui/alert-dialog";
    import { motion } from 'framer-motion';
    import { MediaViewerDialog } from '@/components/gallery/MediaViewerDialog';
    import { UploadMediaDialog } from '@/components/gallery/UploadMediaDialog';

    const GalleryPage = () => {
      const { user, getAllUsers } = useAuth();
      const { toast } = useToast();
      const [albums, setAlbums] = useState([]);
      const [selectedMedia, setSelectedMedia] = useState(null);
      const [showUploadDialog, setShowUploadDialog] = useState(false);
      const [currentAlbumIdForUpload, setCurrentAlbumIdForUpload] = useState(null);

      const allUsers = useMemo(() => getAllUsers ? getAllUsers() : [], [getAllUsers]);

      const getUserNameById = (userId) => {
        const foundUser = allUsers.find(u => u.id === userId);
        return foundUser ? foundUser.name : 'Utilisateur inconnu';
      };

      useEffect(() => {
        const storedAlbums = JSON.parse(localStorage.getItem('galleryAlbums')) || [];
        setAlbums(storedAlbums.sort((a, b) => {
            const eventA = (JSON.parse(localStorage.getItem('agendaEvents')) || []).find(e => e.id === a.eventId);
            const eventB = (JSON.parse(localStorage.getItem('agendaEvents')) || []).find(e => e.id === b.eventId);
            if (eventA && eventB) return new Date(eventB.date) - new Date(eventA.date);
            if (eventA) return -1;
            if (eventB) return 1;
            return 0;
        }));
      }, []);

      const saveAlbums = (updatedAlbums) => {
        localStorage.setItem('galleryAlbums', JSON.stringify(updatedAlbums));
        setAlbums(updatedAlbums);
      };

      const handleUploadMedia = (albumId, mediaItem) => {
        const updatedAlbums = albums.map(album => {
          if (album.id === albumId) {
            return { ...album, media: [...(album.media || []), mediaItem] };
          }
          return album;
        });
        saveAlbums(updatedAlbums);
        toast({ title: "Média ajouté", description: `${mediaItem.name} a été ajouté à l'album.` });
      };

      const handleDeleteMedia = (albumId, mediaId) => {
        const updatedAlbums = albums.map(album => {
          if (album.id === albumId) {
            return { ...album, media: album.media.filter(m => m.id !== mediaId) };
          }
          return album;
        });
        saveAlbums(updatedAlbums);
        toast({ title: "Média supprimé", variant: "destructive" });
      };
      
      const openUploadDialogForAlbum = (albumId) => {
        setCurrentAlbumIdForUpload(albumId);
        setShowUploadDialog(true);
      };

      return (
        <div className="space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Galerie d'Événements</h1>
          
          {albums.length === 0 && (
            <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">Aucun album photo disponible pour le moment. Les albums sont créés lorsqu'un événement est ajouté à l'agenda avec l'option "Créer un album galerie".</p>
                </CardContent>
            </Card>
          )}

          {albums.map(album => (
            <motion.div key={album.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-transparent p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <CardTitle className="text-xl md:text-2xl text-primary">{album.name}</CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">{album.description}</p>
                    </div>
                    {(user.role === 'admin' || user.role === 'professor') && (
                        <Button size="sm" onClick={() => openUploadDialogForAlbum(album.id)} className="mt-3 sm:mt-0 bg-green-600 hover:bg-green-700 text-white">
                        <UploadCloud className="mr-2 h-4 w-4" /> Ajouter une image
                        </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  {(album.media || []).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Cet album est vide pour le moment.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                      {(album.media || []).filter(m => m.type.startsWith('image/')).map(media => (
                        <motion.div 
                          key={media.id}
                          className="relative group aspect-square bg-muted rounded-lg overflow-hidden shadow-md"
                          whileHover={{ scale: 1.05 }}
                          layout
                        >
                          <img src={media.url} alt={media.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 space-y-1">
                            <p className="text-white text-xs text-center truncate w-full">{media.name}</p>
                            <div className="flex items-center text-white text-xs">
                                <UserCircle className="h-3 w-3 mr-1 opacity-80" />
                                <span className="truncate max-w-[80px]">{getUserNameById(media.uploadedBy)}</span>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setSelectedMedia(media)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(user.role === 'admin' || user.role === 'professor' || media.uploadedBy === user.id) && (
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-white/20">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Supprimer cette image ?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            Êtes-vous sûr de vouloir supprimer "{media.name}"? Cette action est irréversible.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteMedia(album.id, media.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <MediaViewerDialog media={selectedMedia} isOpen={!!selectedMedia} onClose={() => setSelectedMedia(null)} />
          <UploadMediaDialog 
            isOpen={showUploadDialog} 
            onClose={() => setShowUploadDialog(false)}
            onUpload={handleUploadMedia}
            albumId={currentAlbumIdForUpload}
            toast={toast}
            currentUser={user}
          />

          <footer className="pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} ENT du Chœur d'Enfants de Bretagne. Tous droits réservés.</p>
          </footer>
        </div>
      );
    };

    export default GalleryPage;