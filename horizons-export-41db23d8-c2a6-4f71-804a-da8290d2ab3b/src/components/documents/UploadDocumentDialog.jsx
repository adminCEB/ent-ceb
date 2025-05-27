import React, { useState, useEffect, useCallback } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Checkbox } from '@/components/ui/checkbox';
    import { useToast } from '@/components/ui/use-toast';
    import { UploadCloud, Info, Users, Paperclip } from 'lucide-react';
    import {
      AlertDialog,
      AlertDialogContent,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogAction,
      AlertDialogCancel,
    } from '@/components/ui/alert-dialog';

    const UploadDocumentDialog = ({ isOpen, onClose, onAction, initialData, availableGroups, userRole }) => {
      const [documentName, setDocumentName] = useState('');
      const [description, setDescription] = useState('');
      const [selectedFile, setSelectedFile] = useState(null);
      const [previewUrl, setPreviewUrl] = useState(null);
      const [selectedGroups, setSelectedGroups] = useState(['Tous']);
      const { toast } = useToast();

      const resetForm = useCallback(() => {
        setDocumentName(initialData?.name || '');
        setDescription(initialData?.description || '');
        setSelectedFile(null);
        setPreviewUrl(initialData?.storage_path ? `/api/placeholder/file?path=${initialData.storage_path}` : null); // Replace with actual Supabase URL if displaying existing file
        setSelectedGroups(initialData?.groups || ['Tous']);
      }, [initialData]);

      useEffect(() => {
        resetForm();
      }, [isOpen, initialData, resetForm]);

      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          if (file.size > 20 * 1024 * 1024) { // 20MB limit
            toast({ title: "Fichier trop volumineux", description: "La taille du fichier ne doit pas dépasser 20Mo.", variant: "destructive" });
            return;
          }
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }
      };

      const handleGroupChange = (group) => {
        setSelectedGroups(prev =>
          prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
      };
      
      const handleSelectAllGroups = () => {
        if (selectedGroups.length === availableGroups.length +1 && selectedGroups.includes('Tous')) { // +1 for 'Tous'
          setSelectedGroups([]);
        } else {
          setSelectedGroups(['Tous', ...availableGroups]);
        }
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!documentName.trim()) {
          toast({ title: "Nom du document requis", description: "Veuillez donner un nom à votre document.", variant: "destructive" });
          return;
        }
        if (!initialData && !selectedFile) { // Required for new uploads
          toast({ title: "Fichier requis", description: "Veuillez sélectionner un fichier à téléverser.", variant: "destructive" });
          return;
        }

        const documentData = {
          id: initialData?.id,
          name: documentName.trim(),
          description: description.trim(),
          groups: selectedGroups.length > 0 ? selectedGroups : ['Tous'],
          // file_type, file_size, storage_path will be set in DocumentsPage onAction
          is_message_attachment: false, // Default for shared documents
        };
        
        onAction(initialData ? 'edit' : 'upload', documentData, selectedFile);
        onClose(); 
      };

      return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
          <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <UploadCloud className="mr-2 h-6 w-6 text-blue-500" />
                {initialData ? "Modifier le document" : "Téléverser un nouveau document"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Ajoutez un nom, une description (facultatif), choisissez les groupes et sélectionnez votre fichier.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="documentName" className="flex items-center mb-1"><Info className="w-4 h-4 mr-2 text-blue-500"/>Nom du document</Label>
                <Input id="documentName" value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="Ex: Compte-rendu réunion Janvier" required className="bg-background/70" />
              </div>
              <div>
                <Label htmlFor="description" className="flex items-center mb-1"><Info className="w-4 h-4 mr-2 text-blue-500"/>Description (facultatif)</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brève description du contenu du document..." className="bg-background/70" />
              </div>
              <div>
                <Label htmlFor="fileUpload" className="flex items-center mb-1"><Paperclip className="w-4 h-4 mr-2 text-blue-500"/>Fichier</Label>
                <Input id="fileUpload" type="file" onChange={handleFileChange} className="bg-background/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                {previewUrl && selectedFile && (
                  <p className="text-xs text-muted-foreground mt-1">Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} Mo)</p>
                )}
                {initialData && initialData.storage_path && !selectedFile && (
                    <p className="text-xs text-muted-foreground mt-1">Fichier actuel : {initialData.name} (sera conservé si aucun nouveau fichier n'est sélectionné)</p>
                )}
              </div>
              <div>
                <Label className="flex items-center mb-2"><Users className="w-4 h-4 mr-2 text-blue-500"/>Visible par les groupes</Label>
                 <div className="space-y-2 p-3 border rounded-md bg-background/50 max-h-40 overflow-y-auto">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="group-tous-doc" 
                            checked={selectedGroups.includes('Tous')} 
                            onCheckedChange={() => handleGroupChange('Tous')}
                        />
                        <Label htmlFor="group-tous-doc" className="font-medium">Tous les groupes</Label>
                    </div>
                    {availableGroups.map(group => (
                        <div key={group} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`group-doc-${group}`} 
                            checked={selectedGroups.includes(group)} 
                            onCheckedChange={() => handleGroupChange(group)}
                            disabled={selectedGroups.includes('Tous') && group !== 'Tous'}
                        />
                        <Label htmlFor={`group-doc-${group}`}>{group}</Label>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="link" size="sm" onClick={handleSelectAllGroups} className="mt-1">
                     {selectedGroups.length === availableGroups.length + 1 && selectedGroups.includes('Tous') ? "Désélectionner tout" : "Sélectionner tout"}
                </Button>
              </div>
              <AlertDialogFooter className="mt-6">
                <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
                <AlertDialogAction type="submit">{initialData ? "Enregistrer les modifications" : "Téléverser"}</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      );
    };

    export default UploadDocumentDialog;