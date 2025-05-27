import React, { useState, useRef } from 'react';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
    } from "@/components/ui/alert-dialog";
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';

    export const UploadMediaDialog = ({ isOpen, onClose, onUpload, albumId, toast, currentUser }) => {
        const [file, setFile] = useState(null);
        const [fileName, setFileName] = useState('');
        const fileInputRef = useRef(null);

        const handleFileChange = (e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
              if (selectedFile.size > 25 * 1024 * 1024) { 
                toast({ title: "Fichier trop volumineux", description: "L'image ne doit pas dépasser 25Mo.", variant: "destructive" });
                return;
              }
              if (!selectedFile.type.startsWith('image/')) {
                toast({ title: "Type de fichier non supporté", description: "Seules les images (JPEG, PNG, GIF, etc.) sont acceptées.", variant: "destructive" });
                return;
              }
              setFile(selectedFile);
              setFileName(selectedFile.name);
            }
        };

        const handleUpload = () => {
            if (file && currentUser) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    onUpload(albumId, {
                        id: `media-${Date.now()}`,
                        name: fileName || file.name,
                        type: file.type,
                        size: file.size,
                        url: reader.result, 
                        uploadedBy: currentUser.id, 
                        uploadDate: new Date().toISOString(),
                    });
                    resetForm();
                };
                reader.readAsDataURL(file);
            } else if (!currentUser) {
                 toast({ title: "Erreur d'utilisateur", description: "Impossible de déterminer l'utilisateur pour l'ajout.", variant: "destructive" });
            }
        };

        const resetForm = () => {
            setFile(null);
            setFileName('');
            if (fileInputRef.current) fileInputRef.current.value = "";
            onClose();
        }

        if (!isOpen) return null;

        return (
            <AlertDialog open={isOpen} onOpenChange={resetForm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ajouter une Image à l'Album</AlertDialogTitle>
                        <AlertDialogDescription>Sélectionnez une image (max 25Mo). Formats supportés : JPEG, PNG, GIF, etc.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="mediaName">Nom du fichier (optionnel)</Label>
                            <Input id="mediaName" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="Ex: Souvenir concert" className="bg-background/70 mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="mediaFile">Fichier image</Label>
                            <Input id="mediaFile" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="bg-background/70 mt-1" />
                            {file && <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} Mo)</p>}
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={resetForm}>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUpload} disabled={!file} className="bg-green-600 hover:bg-green-700">Ajouter</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    };