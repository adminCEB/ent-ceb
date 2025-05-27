import React, { useState, useEffect, useCallback } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { UploadCloud, ListFilter, RotateCcw, FolderOpen } from 'lucide-react';
    import { motion } from 'framer-motion';
    import UploadDocumentDialog from '@/components/documents/UploadDocumentDialog';
    import DocumentList from '@/components/documents/DocumentList';
    import { supabase } from '@/lib/supabaseClient';

    const DocumentsPage = () => {
      const { user, GROUPS: authGroups, supabase: supabaseClientFromAuth } = useAuth();
      const { toast } = useToast();
      const [documents, setDocuments] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
      const [editingDocument, setEditingDocument] = useState(null);
      const [filters, setFilters] = useState({ searchTerm: '', groups: ['Tous'] });

      const availableGroupsForFilter = authGroups || ['Tous'];

      const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        let query = supabaseClientFromAuth.from('documents')
                        .select(`
                          *,
                          profiles:uploaded_by_user_id (first_name, last_name)
                        `)
                        .eq('is_message_attachment', false) // Exclude message attachments
                        .order('upload_date', { ascending: false });

        // Apply group filtering based on user's role and selected filters
        if (user && user.role === 'membre' && user.group_name) {
          query = query.or(`groups.cs.{"Tous"},groups.cs.{"${user.group_name}"}`);
        } else if (user && (user.role === 'professeur' || user.role === 'admin')) {
           if (filters.groups && !filters.groups.includes('Tous') && filters.groups.length > 0) {
             const groupFilters = filters.groups.map(g => `groups.cs.{"${g}"}`).join(',');
             query = query.or(groupFilters);
          } else if (filters.groups && filters.groups.includes('Tous')) {
            // No specific group filter, admin/prof can see all non-attachment documents
          } else if (filters.groups && filters.groups.length === 0 && user.role !== 'membre'){ 
            // If no group is selected by admin/prof, show nothing (or handle as 'Tous')
             query = query.or(`groups.cs.{"__impossible_group__"}`); // Effectively shows nothing
          }
        }

        if (filters.searchTerm) {
          query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
        }
        
        const { data, error } = await query;

        if (error) {
          toast({ title: "Erreur de chargement des documents", description: error.message, variant: "destructive" });
          setDocuments([]);
        } else {
          const formattedData = data.map(doc => ({
            ...doc,
            uploaded_by_user_name: doc.profiles ? `${doc.profiles.first_name || ''} ${doc.profiles.last_name || ''}`.trim() : 'Utilisateur inconnu'
          }));
          setDocuments(formattedData || []);
        }
        setIsLoading(false);
      }, [supabaseClientFromAuth, toast, user, filters.groups, filters.searchTerm]);

      useEffect(() => {
        fetchDocuments();
      }, [fetchDocuments]);

      const handleOpenUploadDialog = (doc = null) => {
        setEditingDocument(doc);
        setIsUploadDialogOpen(true);
      };

      const handleDocumentAction = async (actionType, documentData, file) => {
        setIsLoading(true);
        let resultMessage = "";

        try {
          if (actionType === 'upload' || (actionType === 'edit' && file)) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `shared_documents/${fileName}`;
            
            const { error: uploadError } = await supabaseClientFromAuth.storage
              .from('shared_documents')
              .upload(filePath, file, { upsert: actionType === 'edit' });

            if (uploadError) throw uploadError;
            documentData.storage_path = filePath;
            documentData.file_type = file.type;
            documentData.file_size = file.size;
          }

          documentData.uploaded_by_user_id = user.id;
          documentData.upload_date = new Date().toISOString();
          documentData.updated_at = new Date().toISOString();

          // Remove temporary profile data before saving
          const { profiles, ...dataToSave } = documentData;


          if (actionType === 'upload') {
            const { error } = await supabaseClientFromAuth.from('documents').insert(dataToSave);
            if (error) throw error;
            resultMessage = "Document téléversé avec succès.";
          } else if (actionType === 'edit') {
            const { error } = await supabaseClientFromAuth.from('documents').update(dataToSave).eq('id', documentData.id);
            if (error) throw error;
            resultMessage = "Document modifié avec succès.";
          } else if (actionType === 'delete') {
            if (documentData.storage_path) {
              await supabaseClientFromAuth.storage.from('shared_documents').remove([documentData.storage_path]);
            }
            const { error } = await supabaseClientFromAuth.from('documents').delete().eq('id', documentData.id);
            if (error) throw error;
            resultMessage = "Document supprimé avec succès.";
          }
          
          toast({ title: "Succès", description: resultMessage });

        } catch (error) {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } finally {
          setIsUploadDialogOpen(false);
          setEditingDocument(null);
          fetchDocuments(); // Refresh list
          setIsLoading(false);
        }
      };

      const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col h-full p-4 md:p-6 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100"
        >
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              Gestion des Documents
            </h1>
            <div className="flex items-center space-x-2">
              {(user?.role === 'admin' || user?.role === 'professeur') && (
                <Button onClick={() => handleOpenUploadDialog(null)} className="bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white shadow-md">
                  <UploadCloud className="mr-2 h-5 w-5" /> Téléverser un document
                </Button>
              )}
              <Button onClick={fetchDocuments} variant="outline" className="shadow-sm">
                <RotateCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Rafraîchir
              </Button>
            </div>
          </div>

          
          <div className="mb-4 p-4 bg-card/50 backdrop-blur-sm rounded-lg shadow border border-border/30">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Input 
                placeholder="Rechercher par nom ou description..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                className="max-w-sm bg-background/70"
              />
              {(user?.role === 'admin' || user?.role === 'professeur') && availableGroupsForFilter.length > 1 && (
                <Select
                    value={filters.groups.includes('Tous') ? 'Tous' : (filters.groups[0] || '')}
                    onValueChange={(value) => handleFilterChange({ groups: value === 'Tous' ? ['Tous'] : [value] })}
                >
                    <SelectTrigger className="w-full md:w-[180px] bg-background/70">
                        <SelectValue placeholder="Filtrer par groupe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Tous">Tous les groupes</SelectItem>
                        {availableGroupsForFilter.filter(g => g !== 'Tous').map(group => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {isLoading && <p className="text-center text-lg text-muted-foreground py-8">Chargement des documents...</p>}
          {!isLoading && documents.length === 0 && (
            <div className="text-center py-10">
              <FolderOpen className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg text-muted-foreground">Aucun document trouvé pour les filtres actuels.</p>
              {(user?.role === 'admin' || user?.role === 'professeur') && (
                 <p className="text-sm text-muted-foreground">Utilisez le bouton "Téléverser un document" pour commencer.</p>
              )}
            </div>
          )}
          
          {!isLoading && documents.length > 0 && (
            <DocumentList 
              documents={documents}
              onEdit={handleOpenUploadDialog}
              onDelete={(doc) => handleDocumentAction('delete', doc, null)}
              userRole={user?.role}
              supabaseClient={supabaseClientFromAuth}
            />
          )}

          {isUploadDialogOpen && (
            <UploadDocumentDialog
              isOpen={isUploadDialogOpen}
              onClose={() => { setIsUploadDialogOpen(false); setEditingDocument(null); }}
              onAction={handleDocumentAction}
              initialData={editingDocument}
              availableGroups={availableGroupsForFilter.filter(g => g !== 'Tous')}
              userRole={user?.role}
            />
          )}
        </motion.div>
      );
    };

    export default DocumentsPage;