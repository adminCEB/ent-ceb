import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Label } from '@/components/ui/label';

    const NotificationPreferencesForm = ({ notificationPreferences, onNotificationChange }) => {
      const preferenceLabels = {
        agenda: 'Mises à jour de l\'agenda',
        documents: 'Nouveaux documents partagés',
        messages: 'Nouveaux messages',
        carpooling: 'Offres et demandes de covoiturage',
        gallery: 'Nouvelles photos dans la galerie',
        absences: 'Informations sur les absences',
      };

      return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
          <CardHeader>
            <CardTitle>Préférences de notification</CardTitle>
            <CardDescription>Gérez les notifications que vous souhaitez recevoir.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(notificationPreferences).map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`notif-${key}`}
                  checked={!!notificationPreferences[key]}
                  onCheckedChange={() => onNotificationChange(key)}
                />
                <Label htmlFor={`notif-${key}`} className="capitalize font-normal">
                  {preferenceLabels[key] || `Notifications pour ${key}`}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    };

    export default NotificationPreferencesForm;