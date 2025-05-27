import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Download, Edit3, Trash2, FileText, Users, CalendarDays, UserCircle } from 'lucide-react';
    import { motion } from 'framer-motion';
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
    import { useToast } from '@/components/ui/use-toast';


    const DocumentList = ({ documents, onEdit, onDelete, userRole, supabaseClient }) => {
      const { toast } = useToast();

      const formatDate = (dateString) => {
        if (!dateString) return 'Date inconnue';
        return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      };

      const formatSize = (bytes) => {
        if (bytes === 0 || !bytes) return '0 octets';
        const k = 1024;
        const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      const handleDownload = async (doc) => {
        if (!doc.storage_path) {
            toast({ title: "Erreur", description: "Chemin du fichier non trouvé.", variant: "destructive" });
            return;
        }
        const { data, error } = await supabaseClient.storage
            .from('shared_documents')
            .download(doc.storage_path);

        if (error) {
            toast({ title: "Erreur de téléchargement", description: error.message, variant: "destructive" });
            return;
        }
        if (data) {
            const blob = new Blob([data], { type: doc.file_type || 'application/octet-stream' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = doc.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            toast({ title: "Téléchargement lancé", description: `${doc.name} est en cours de téléchargement.` });
        }
      };
      
      if (!documents || documents.length === 0) {
        // This case is handled in DocumentsPage, but kept here as a fallback
        return <p className="text-muted-foreground text-center py-6">Aucun document à afficher.</p>;
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="flex flex-col h-full bg-card/70 backdrop-blur-sm border-border/30 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-blue-500 flex-shrink-0 mr-3" />
                    <CardTitle className="text-lg leading-tight text-primary flex-grow">{doc.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                  {doc.description && <p className="text-muted-foreground italic line-clamp-2">{doc.description}</p>}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Groupes: {doc.groups?.join(', ') || 'Non spécifié'}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Téléversé le: {formatDate(doc.upload_date)}
                  </div>
                   {doc.uploaded_by_user_name && (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <UserCircle className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        Par: {doc.uploaded_by_user_name}
                    </div>
                   )}
                  <p className="text-xs text-muted-foreground">Taille: {formatSize(doc.file_size)}</p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 pt-3 border-t border-border/20">
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} className="text-green-600 hover:bg-green-50 hover:text-green-700">
                    <Download className="h-4 w-4 mr-1" /> Télécharger
                  </Button>
                  {(userRole === 'admin' || (userRole === 'professeur' && doc.uploaded_by_user_id === supabaseClient.auth.user()?.id)) && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(doc)} className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                        <Edit3 className="h-4 w-4 mr-1" /> Modifier
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                             <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer le document "{doc.name}" ? Cette action est irréversible et supprimera également le fichier associé.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(doc)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      );
    };

    export default DocumentList;