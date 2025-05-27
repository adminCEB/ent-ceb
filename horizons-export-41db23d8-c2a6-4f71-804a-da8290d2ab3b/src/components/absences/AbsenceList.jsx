import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Download, CheckCircle, XCircle, AlertTriangle, FileText, Clock, Edit2 } from 'lucide-react';
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
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import { getAbsenceStatusIcon, ABSENCE_STATUS } from '@/lib/absenceUtils';

    export const AbsenceList = ({ title, absences, onStatusChange, onDownloadCertificate, icon, userRole, isHistory = false }) => {
      if (!absences || absences.length === 0) {
        return (
          <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">{icon} {title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Aucune absence à afficher.</p>
            </CardContent>
          </Card>
        );
      }

      const availableStatuses = Object.values(ABSENCE_STATUS);

      return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">{icon} {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {absences.map(abs => (
                <li key={abs.id} className="p-3 border rounded-md bg-background/50">
                  <div className="flex justify-between items-start flex-wrap">
                    <div className="mb-2">
                      <p className="font-semibold">{abs.memberName} - {new Date(abs.date).toLocaleDateString()}</p>
                      {abs.eventTitle && <p className="text-sm text-blue-500">Événement: {abs.eventTitle}</p>}
                      <p className="text-sm text-muted-foreground">Motif: {abs.reason}</p>
                      <p className="text-sm text-muted-foreground flex items-center">Statut: {getAbsenceStatusIcon(abs.status)} <span className="ml-1">{abs.status}</span></p>
                      {abs.certificate && (
                        <div className="mt-1">
                          <Button variant="link" size="sm" onClick={() => onDownloadCertificate(abs.certificate)} className="p-0 h-auto text-sm">
                            <Download className="mr-1 h-3 w-3" /> Voir justificatif ({abs.certificate.name})
                          </Button>
                        </div>
                      )}
                      {isHistory && abs.processedBy && <p className="text-xs text-muted-foreground">Traité par: {abs.processedBy}</p>}
                    </div>
                    {(userRole === 'admin' || userRole === 'professor') && (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-start">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit2 className="mr-2 h-4 w-4" /> Changer Statut
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Nouveau statut</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {availableStatuses.map(statusKey => (
                              <DropdownMenuItem key={statusKey} onClick={() => onStatusChange(abs.id, statusKey)} disabled={abs.status === statusKey}>
                                {getAbsenceStatusIcon(statusKey)} <span className="ml-2">{statusKey}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );
    };