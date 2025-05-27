import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { UserCheck, UserX, CheckCircle, XCircle, AlertTriangle, FileText, Clock, CalendarSearch, Download } from 'lucide-react';
    import { useAuth, GROUPS } from '@/contexts/AuthContext';
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
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { AbsenceList } from '@/components/absences/AbsenceList';
    import { AttendanceForm } from '@/components/absences/AttendanceForm';
    import { getAbsenceStatusIcon, ABSENCE_STATUS } from '@/lib/absenceUtils';


    const mockAllUsers = (JSON.parse(localStorage.getItem('allUsersPlatform')) || [])
        .filter(u => u.status === 'active')
        .map(u => ({ id: u.id, name: u.name, role: u.role, group: u.group }));


    const AbsenceManagementPage = () => {
      const { user } = useAuth();
      const { toast } = useToast();
      const [absences, setAbsences] = useState([]);
      const [courseDate, setCourseDate] = useState(new Date().toISOString().split('T')[0]);
      const [eventsForDate, setEventsForDate] = useState([]);
      const [selectedEventId, setSelectedEventId] = useState('');
      const [membersForEvent, setMembersForEvent] = useState([]);
      const [attendance, setAttendance] = useState({});

      useEffect(() => {
        const storedAbsences = JSON.parse(localStorage.getItem('absences')) || [];
        setAbsences(storedAbsences);
      }, []);
      
      useEffect(() => {
        const allEvents = JSON.parse(localStorage.getItem('agendaEvents')) || [];
        const filtered = allEvents.filter(event => 
            new Date(event.date).toISOString().split('T')[0] === courseDate &&
            (user.role === 'admin' || event.groups.includes(user.group) || event.groups.includes('Tous')) 
        );
        setEventsForDate(filtered);
        setSelectedEventId(''); 
        setMembersForEvent([]);
        setAttendance({});
      }, [courseDate, user.role, user.group]);

      useEffect(() => {
        if (selectedEventId) {
          const selectedEvent = eventsForDate.find(e => e.id.toString() === selectedEventId);
          if (selectedEvent) {
            const eventGroups = selectedEvent.groups;
            const activeUsers = (JSON.parse(localStorage.getItem('allUsersPlatform')) || []).filter(u => u.status === 'active');

            if (eventGroups.includes('Tous')) {
              setMembersForEvent(activeUsers.filter(m => m.role === 'member'));
            } else {
              setMembersForEvent(activeUsers.filter(m => m.role === 'member' && eventGroups.includes(m.group)));
            }
            
            const initialAttendance = {};
            const eventAbsences = absences.filter(a => a.eventId === selectedEvent.id && (a.status === ABSENCE_STATUS.ACCEPTEE || a.status === ABSENCE_STATUS.ACCEPTEE_ATTENTE_JUSTIFICATIF));
            
            const currentMembersForEvent = eventGroups.includes('Tous') 
              ? activeUsers.filter(m => m.role === 'member')
              : activeUsers.filter(m => m.role === 'member' && eventGroups.includes(m.group));

            currentMembersForEvent.forEach(member => {
              if (eventAbsences.some(ea => ea.memberId === member.id)) {
                initialAttendance[member.id] = false; 
              }
            });
            setAttendance(initialAttendance);
          }
        } else {
          setMembersForEvent([]);
          setAttendance({});
        }
      }, [selectedEventId, eventsForDate, absences]);


      const saveAbsences = (updatedAbsences) => {
        localStorage.setItem('absences', JSON.stringify(updatedAbsences));
        setAbsences(updatedAbsences);
      };

      const handleStatusChange = (absenceId, newStatus) => {
        const updatedAbsences = absences.map(abs => 
          abs.id === absenceId ? { ...abs, status: newStatus, processedBy: user.name } : abs
        );
        saveAbsences(updatedAbsences);
        toast({ title: "Statut de l'absence mis à jour.", description: `Le statut est maintenant : ${newStatus}` });
      };
      
      const handleDownloadCertificate = (certificate) => {
        if (certificate && certificate.dataUrl) {
          const link = document.createElement('a');
          link.href = certificate.dataUrl;
          link.download = certificate.name || 'justificatif.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast({ title: "Téléchargement", description: `Téléchargement de ${certificate.name} en cours...`});
        } else {
          toast({ title: "Erreur", description: "Impossible de télécharger le justificatif.", variant: "destructive"});
        }
      };

      const absenceRequests = absences.filter(abs => abs.status === ABSENCE_STATUS.DEMANDEE || abs.status === ABSENCE_STATUS.EN_ATTENTE_ACCEPTATION || abs.status === ABSENCE_STATUS.ACCEPTEE_ATTENTE_JUSTIFICATIF)
                                    .sort((a,b) => new Date(a.date) - new Date(b.date));
      const processedAbsences = absences.filter(abs => abs.status === ABSENCE_STATUS.ACCEPTEE || abs.status === ABSENCE_STATUS.INJUSTIFIEE)
                                    .sort((a,b) => new Date(b.date) - new Date(a.date));

      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-primary">Gestion des Absences</h1>

          <AttendanceForm
            courseDate={courseDate}
            setCourseDate={setCourseDate}
            eventsForDate={eventsForDate}
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            membersForEvent={membersForEvent}
            attendance={attendance}
            setAttendance={setAttendance}
            absences={absences}
            saveAbsences={saveAbsences}
            toast={toast}
            user={user}
          />

          <AbsenceList
            title="Demandes d'absence en attente"
            absences={absenceRequests}
            onStatusChange={handleStatusChange}
            onDownloadCertificate={handleDownloadCertificate}
            icon={<AlertTriangle className="mr-2 h-6 w-6 text-orange-400" />}
            userRole={user.role}
          />
          
          <AbsenceList
            title="Historique des absences traitées"
            absences={processedAbsences}
            onStatusChange={handleStatusChange}
            onDownloadCertificate={handleDownloadCertificate}
            icon={<CalendarSearch className="mr-2 h-6 w-6 text-purple-400" />}
            userRole={user.role}
            isHistory={true}
          />
        </div>
      );
    };

    export default AbsenceManagementPage;