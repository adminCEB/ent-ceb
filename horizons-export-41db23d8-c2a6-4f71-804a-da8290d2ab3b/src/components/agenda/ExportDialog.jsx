import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

    const PERIOD_TYPES = [
      { value: 'day', label: 'Jour' },
      { value: 'week', label: 'Semaine' },
      { value: 'month', label: 'Mois' },
      { value: 'year', label: 'Année' },
    ];

    const FORMAT_TYPES = [
      { value: 'ics', label: 'ICS (Calendrier)' },
      { value: 'csv', label: 'CSV (Tableur)' },
    ];

    export const ExportDialog = ({ isOpen, onClose, onExport, defaultDate }) => {
      const [periodType, setPeriodType] = useState(PERIOD_TYPES[0].value);
      const [startDate, setStartDate] = useState(defaultDate ? defaultDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      const [format, setFormat] = useState(FORMAT_TYPES[0].value);

      const handleSubmit = () => {
        onExport({ periodType, startDate, format });
      };

      if (!isOpen) return null;

      return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exporter le Planning</AlertDialogTitle>
              <AlertDialogDescription>
                Choisissez la période, la date de début et le format d'exportation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="periodType">Période</Label>
                <Select onValueChange={setPeriodType} value={periodType}>
                  <SelectTrigger id="periodType" className="w-full bg-background/70 mt-1">
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_TYPES.map(pt => (
                      <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Date de début</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="bg-background/70 mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="formatType">Format</Label>
                <Select onValueChange={setFormat} value={format}>
                  <SelectTrigger id="formatType" className="w-full bg-background/70 mt-1">
                    <SelectValue placeholder="Sélectionner un format" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_TYPES.map(ft => (
                      <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit} className="bg-primary hover:bg-primary/90">Exporter</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };