import React from 'react';
    import {
      AlertDialog,
      AlertDialogContent,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
    } from "@/components/ui/alert-dialog";
    import { Button } from '@/components/ui/button';
    import { Download } from 'lucide-react';

    export const MediaViewerDialog = ({ media, isOpen, onClose }) => {
      if (!isOpen || !media) return null;
      return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
          <AlertDialogContent className="max-w-3xl p-0">
            <AlertDialogHeader className="p-4">
              <AlertDialogTitle>{media.name}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="p-4 max-h-[70vh] overflow-y-auto flex justify-center items-center">
              {media.type.startsWith('image/') ? (
                <img src={media.url} alt={media.name} className="max-w-full max-h-full rounded-md object-contain" />
              ) : (
                <p className="text-muted-foreground">Ce type de média n'est pas supporté pour l'aperçu direct.</p>
              )}
            </div>
            <AlertDialogFooter className="p-4 border-t">
              <Button variant="outline" onClick={onClose}>Fermer</Button>
              <Button onClick={() => window.open(media.url, '_blank')}><Download className="mr-2 h-4 w-4" /> Télécharger</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };