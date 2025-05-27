import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { UserCheck } from 'lucide-react';
    import { ABSENCE_STATUS } from '@/lib/absenceUtils';

    export const AttendanceForm = ({
      courseDate,
      setCourseDate,
      eventsForDate,
      selectedEventId,
      setSelectedEventId,
      membersForEvent,
      attendance,
      setAttendance,
      absences,
      saveAbsences,
      toast,
      user
    }) => {

      const handleAttendanceMark = (memberId, isPresent) => {
        setAttendance(prev => ({ ...prev, [memberId]: isPresent }));
      };

      const submitAttendance = () => {
        if (!selectedEventId || selectedEventId === 'default-event-id') {
          toast({ title: "Veuillez sélectionner un événement.", variant: "destructive" });
          return;
        }
        const selectedEvent = eventsForDate.find(e => e.id.toString() === selectedEventId);
        if (!selectedEvent) {
            toast({ title: "Événement non trouvé.", variant: "destructive" });
            return;
        }
        const newAbsencesFromAttendance = membersForEvent
          .filter(member => attendance[member.id] === false && !absences.find(a => a.memberId === member.id && a.eventId === selectedEvent.id && (a.status === ABSENCE_STATUS.ACCEPTEE || a.status === ABSENCE_STATUS.ACCEPTEE_ATTENTE_JUSTIFICATIF)))
          .map(member => ({
            id: `att-${Date.now()}-${member.id}`,
            memberId: member.id,
            memberName: member.name,
            date: courseDate,
            reason: `Absence constatée à l'événement: ${selectedEvent.title}`,
            status: ABSENCE_STATUS.INJUSTIFIEE,
            requestedBy: 'Système (Appel)',
            processedBy: user.name,
            eventId: selectedEvent.id,
            eventTitle: selectedEvent.title,
            group: member.group,
            certificate: null,
          }));

        const updatedAbsences = [...absences.filter(a => !(a.eventId === selectedEvent.id && newAbsencesFromAttendance.find(na => na.memberId === a.memberId))), ...newAbsencesFromAttendance];
        saveAbsences(updatedAbsences);
        setAttendance({});
        toast({ title: "Appel enregistré.", description: `${newAbsencesFromAttendance.length} nouvelle(s) absence(s) signalée(s) pour ${selectedEvent.title}.` });
      };

      const validEventsForDate = eventsForDate.filter(event => event && event.id && event.title);

      return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-6 w-6 text-green-400" />
              Faire l'appel pour un événement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="courseDate">Date de l'événement</Label>
              <Input id="courseDate" type="date" value={courseDate} onChange={(e) => { setCourseDate(e.target.value); setSelectedEventId('default-event-id'); }} className="mt-1 bg-background/70" />
            </div>
            {validEventsForDate.length > 0 && (
              <div>
                <Label htmlFor="eventSelect">Événement</Label>
                <Select onValueChange={setSelectedEventId} value={selectedEventId || 'default-event-id'}>
                  <SelectTrigger className="w-full mt-1 bg-background/70">
                    <SelectValue placeholder="Sélectionner un événement" />
                  </SelectTrigger>
                  <SelectContent>
                    {validEventsForDate.map(event => (
                      <SelectItem key={event.id} value={event.id.toString()}>{event.title} ({Array.isArray(event.group) ? event.group.join(', ') : event.group})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {validEventsForDate.length === 0 && courseDate && (
              <p className="text-muted-foreground mt-2">Aucun événement prévu pour cette date ou pour vos groupes.</p>
            )}

            {selectedEventId && selectedEventId !== 'default-event-id' && membersForEvent.length > 0 && (
              <div className="space-y-2 pt-4">
                <h3 className="text-lg font-medium text-foreground">Membres ({membersForEvent[0]?.group || validEventsForDate.find(e => e.id.toString() === selectedEventId)?.group || 'N/A'}):</h3>
                {membersForEvent.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                    <span>{member.name}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant={attendance[member.id] === true ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAttendanceMark(member.id, true)}
                        className={attendance[member.id] === true ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                        disabled={absences.some(a => a.memberId === member.id && a.eventId.toString() === selectedEventId && (a.status === ABSENCE_STATUS.ACCEPTEE || a.status === ABSENCE_STATUS.ACCEPTEE_ATTENTE_JUSTIFICATIF))}
                      >
                        Présent
                      </Button>
                      <Button
                        variant={attendance[member.id] === false ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleAttendanceMark(member.id, false)}
                        disabled={absences.some(a => a.memberId === member.id && a.eventId.toString() === selectedEventId && (a.status === ABSENCE_STATUS.ACCEPTEE || a.status === ABSENCE_STATUS.ACCEPTEE_ATTENTE_JUSTIFICATIF))}
                      >
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedEventId && selectedEventId !== 'default-event-id' && membersForEvent.length === 0 && (
              <p className="text-muted-foreground mt-2">Aucun membre à afficher pour cet événement/groupe.</p>
            )}
          </CardContent>
          {selectedEventId && selectedEventId !== 'default-event-id' && membersForEvent.length > 0 && (
            <CardFooter>
              <Button onClick={submitAttendance} className="bg-indigo-600 hover:bg-indigo-700 text-white">Enregistrer l'appel</Button>
            </CardFooter>
          )}
        </Card>
      );
    };