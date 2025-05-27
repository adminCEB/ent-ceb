import React, { useState, useEffect, useRef } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea'; 
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { UserX, Send, CalendarDays, Upload, Paperclip, Trash2, AlertCircle } from 'lucide-react';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { getAbsenceStatusIcon, ABSENCE_STATUS } from '@/lib/absenceUtils';

    const MAX_UNJUSTIFIED_ABSENCES = 3;

    const getCurrentSchoolYearBounds = () => {
      const today = new Date();
      const currentMonth = today.getMonth(); 
      let startYear = today.getFullYear();
      if (currentMonth < 8) { 
        startYear -= 1;
      }
      const startDate = new Date(startYear, 8, 1); 
      const endDate = new Date(startYear + 1, 7, 31); 
      return { startDate, endDate };
    };


    const MyAbsencesPage = () => {
      const { user } = useAuth();
      const { toast } = useToast();
      const [myAbsences, setMyAbsences] = useState([]);
      const [absenceDate, setAbsenceDate] = useState('');
      const [absenceReason, setAbsenceReason] = useState('');
      const [medicalCertificate, setMedicalCertificate] = useState(null);
      const [medicalCertificatePreview, setMedicalCertificatePreview] = useState(null);
      const certificateInputRef = useRef(null);
      const [eventsForDate, setEventsForDate] = useState([]);
      const [selectedEventId, setSelectedEventId] = useState('');
      const [unjustifiedAbsencesCount, setUnjustifiedAbsencesCount] = useState(0);

      useEffect(() => {
        const storedAbsences = JSON.parse(localStorage.getItem('absences')) || [];
        const userAbsences = storedAbsences.filter(abs => abs.memberId === user.id).sort((a,b) => new Date(b.date) - new Date(a.date));
        setMyAbsences(userAbsences);

        const { startDate, endDate } = getCurrentSchoolYearBounds();
        const currentYearUnjustified = userAbsences.filter(abs => 
          abs.status === ABSENCE_STATUS.INJUSTIFIEE &&
          new Date(abs.date) >= startDate &&
          new Date(abs.date) <= endDate
        ).length;
        setUnjustifiedAbsencesCount(currentYearUnjustified);

      }, [user.id]);
      
      useEffect(() => {
        if (absenceDate) {
            const allEvents = JSON.parse(localStorage.getItem('agendaEvents')) || [];
            const filtered = allEvents.filter(event => 
                new Date(event.date).toISOString().split('T')[0] === absenceDate &&
                (event.groups.includes(user.group) || event.groups.includes('Tous'))
            );
            setEventsForDate(filtered);
            setSelectedEventId(''); 
        } else {
            setEventsForDate([]);
            setSelectedEventId('');
        }
      }, [absenceDate, user.group]);

      const saveAbsences = (allAbsences) => {
        localStorage.setItem('absences', JSON.stringify(allAbsences));
        const userAbsences = allAbsences.filter(abs => abs.memberId === user.id).sort((a,b) => new Date(b.date) - new Date(a.date));
        setMyAbsences(userAbsences);

        const { startDate, endDate } = getCurrentSchoolYearBounds();
        const currentYearUnjustified = userAbsences.filter(abs => 
          abs.status === ABSENCE_STATUS.INJUSTIFIEE &&
          new Date(abs.date) >= startDate &&
          new Date(abs.date) <= endDate
        ).length;
        setUnjustifiedAbsencesCount(currentYearUnjustified);
      };

      const handleCertificateChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === "application/pdf" || file.type === "image/jpeg" || file.type === "image/png")) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ title: "Fichier trop volumineux", description: "Le justificatif ne doit pas dépasser 5Mo.", variant: "destructive" });
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            setMedicalCertificate({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
            setMedicalCertificatePreview(file.name);
          };
          reader.readAsDataURL(file);
        } else {
          toast({ title: "Type de fichier invalide", description: "Veuillez sélectionner un PDF ou une image (JPG, PNG).", variant: "destructive"});
        }
      };

      const removeCertificate = () => {
        setMedicalCertificate(null);
        setMedicalCertificatePreview(null);
        if (certificateInputRef.current) certificateInputRef.current.value = "";
      };

      const handleRequestAbsence = (e) => {
        e.preventDefault();
        if (!absenceDate || !absenceReason) {
          toast({ title: "Champs requis", description: "Veuillez fournir une date et un motif.", variant: "destructive" });
          return;
        }
        const selectedEvent = eventsForDate.find(ev => ev.id.toString() === selectedEventId);
        const newAbsence = {
          id: `abs-${Date.now()}`,
          memberId: user.id,
          memberName: user.name,
          date: absenceDate,
          reason: absenceReason,
          status: ABSENCE_STATUS.DEMANDEE,
          requestedBy: user.name,
          certificate: medicalCertificate,
          eventId: selectedEvent ? selectedEvent.id : null,
          eventTitle: selectedEvent ? selectedEvent.title : null,
          group: user.group,
        };
        const allAbsences = JSON.parse(localStorage.getItem('absences')) || [];
        saveAbsences([...allAbsences, newAbsence]);
        setAbsenceDate('');
        setAbsenceReason('');
        removeCertificate();
        setSelectedEventId('');
        setEventsForDate([]);
        toast({ title: "Demande d'absence envoyée", description: "Votre demande a été soumise pour approbation." });
      };

      const getUnjustifiedAbsenceAlertColor = () => {
        if (unjustifiedAbsencesCount >= MAX_UNJUSTIFIED_ABSENCES) return "text-red-600 bg-red-100 border-red-500";
        if (unjustifiedAbsencesCount > 0) return "text-orange-600 bg-orange-100 border-orange-500";
        return "text-green-600 bg-green-100 border-green-500";
      };

      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-primary">Mes Absences</h1>

          <Card className={`bg-card/70 backdrop-blur-sm border shadow-lg ${getUnjustifiedAbsenceAlertColor()}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className={`mr-2 h-6 w-6 ${unjustifiedAbsencesCount >= MAX_UNJUSTIFIED_ABSENCES ? 'text-red-600' : unjustifiedAbsencesCount > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                Suivi des absences injustifiées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                Vous avez <strong className="font-bold">{unjustifiedAbsencesCount}</strong> absence(s) injustifiée(s) cette année scolaire.
              </p>
              <p className="text-sm mt-1">
                Rappel : Seules <strong>{MAX_UNJUSTIFIED_ABSENCES} absences injustifiées</strong> sont tolérées sur l'année scolaire.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
            <CardHeader><CardTitle className="flex items-center"><Send className="mr-2 h-6 w-6 text-indigo-400" /> Faire une demande d'absence</CardTitle></CardHeader>
            <form onSubmit={handleRequestAbsence}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="absenceDate">Date de l'absence</Label>
                  <Input id="absenceDate" type="date" value={absenceDate} onChange={(e) => setAbsenceDate(e.target.value)} className="mt-1 bg-background/70" />
                </div>
                {absenceDate && eventsForDate.length > 0 && (
                  <div>
                    <Label htmlFor="eventSelect">Événement concerné (optionnel)</Label>
                    <Select onValueChange={setSelectedEventId} value={selectedEventId}>
                      <SelectTrigger className="w-full mt-1 bg-background/70"><SelectValue placeholder="Sélectionner un événement" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun événement spécifique</SelectItem>
                        {eventsForDate.map(event => (
                          <SelectItem key={event.id} value={event.id.toString()}>{event.title} ({new Date(event.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {absenceDate && eventsForDate.length === 0 && (<p className="text-sm text-muted-foreground">Aucun événement de votre groupe prévu à cette date.</p>)}
                <div>
                  <Label htmlFor="absenceReason">Motif de l'absence</Label>
                  <Textarea id="absenceReason" placeholder="Expliquez brièvement le motif..." value={absenceReason} onChange={(e) => setAbsenceReason(e.target.value)} className="mt-1 bg-background/70" />
                </div>
                <div>
                  <Label htmlFor="medicalCertificateFile">Justificatif (optionnel, PDF/JPG/PNG, max 5Mo)</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Button type="button" size="sm" variant="outline" onClick={() => certificateInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Téléverser</Button>
                    {medicalCertificatePreview && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Paperclip className="h-4 w-4" /><span>{medicalCertificatePreview}</span>
                        <Button type="button" size="icon" variant="ghost" onClick={removeCertificate} className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                  <Input id="medicalCertificateFile" type="file" ref={certificateInputRef} className="hidden" accept="application/pdf,image/jpeg,image/png" onChange={handleCertificateChange} />
                </div>
              </CardContent>
              <CardFooter><Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Envoyer la demande</Button></CardFooter>
            </form>
          </Card>
          <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
            <CardHeader><CardTitle className="flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-purple-400" /> Historique de mes absences</CardTitle></CardHeader>
            <CardContent>
              {myAbsences.length === 0 ? (<p className="text-muted-foreground">Vous n'avez aucune absence enregistrée.</p>) : (
                <ul className="space-y-3">
                  {myAbsences.map(abs => (
                    <li key={abs.id} className="p-3 border rounded-md bg-background/50">
                      <p className="font-semibold">Date: {new Date(abs.date).toLocaleDateString()}</p>
                      {abs.eventTitle && <p className="text-sm text-blue-500">Événement: {abs.eventTitle}</p>}
                      <p className="text-sm text-muted-foreground">Motif: {abs.reason}</p>
                      <p className="text-sm text-muted-foreground flex items-center">Statut: {getAbsenceStatusIcon(abs.status)} <span className="ml-1">{abs.status}</span></p>
                      {abs.certificate && (<p className="text-sm text-muted-foreground flex items-center"><Paperclip className="h-4 w-4 mr-1 text-green-500" /> Justificatif: {abs.certificate.name}</p>)}
                      {abs.processedBy && <p className="text-xs text-muted-foreground">Traité par: {abs.processedBy}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      );
    };

    export default MyAbsencesPage;