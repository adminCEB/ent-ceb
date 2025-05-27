import React, { useState, useEffect, useCallback } from 'react';
    import { Button } from '@/components/ui/button';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { CalendarPlus, Download, RotateCcw } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { AgendaHeader } from '@/components/agenda/AgendaHeader';
    import CalendarGrid from '@/components/agenda/CalendarGrid';
    import EventList from '@/components/agenda/EventList';
    import EventFormDialog from '@/components/agenda/EventFormDialog';
    import EventDetailDialog from '@/components/agenda/EventDetailDialog';
    import { ExportDialog } from '@/components/agenda/ExportDialog';
    import { supabase } from '@/lib/supabaseClient';
    import { getDefaultEvent } from '@/lib/agendaUtils';

    const VIEWS = {
      MONTH: 'Mois',
      WEEK: 'Semaine',
      DAY: 'Jour',
      LIST: 'Liste',
    };

    const AgendaPage = () => {
      const { user, GROUPS: authGroups, supabase: supabaseClientFromAuth } = useAuth();
      const { toast } = useToast();
      const [currentDate, setCurrentDate] = useState(new Date());
      const [viewMode, setViewMode] = useState(VIEWS.MONTH);
      const [events, setEvents] = useState([]);
      const [filteredEvents, setFilteredEvents] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [isEventFormOpen, setIsEventFormOpen] = useState(false);
      const [editingEvent, setEditingEvent] = useState(null);
      const [selectedEvent, setSelectedEvent] = useState(null);
      const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
      const [isExporting, setIsExporting] = useState(false);
      const [filters, setFilters] = useState({
        searchTerm: '',
        groups: ['Tous'],
        eventType: 'Tous',
      });

      const availableGroupsForFilter = authGroups || ['Tous'];

      const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        let query = supabaseClientFromAuth.from('events').select('*').order('date', { ascending: true });
        
        if (user && user.role === 'membre' && user.group_name) {
          query = query.or(`groups.cs.{"Tous"},groups.cs.{"${user.group_name}"}`);
        } else if (user && (user.role === 'professeur' || user.role === 'admin')) {
          if (filters.groups && !filters.groups.includes('Tous')) {
             const groupFilters = filters.groups.map(g => `groups.cs.{"${g}"}`).join(',');
             query = query.or(groupFilters);
          }
        }
        if (filters.eventType && filters.eventType !== 'Tous') {
            query = query.eq('event_type', filters.eventType);
        }
        if (filters.searchTerm) {
            query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
        }

        const { data, error } = await query;

        if (error) {
          toast({ title: "Erreur de chargement des événements", description: error.message, variant: "destructive" });
          setEvents([]);
        } else {
          setEvents(data || []);
        }
        setIsLoading(false);
      }, [supabaseClientFromAuth, toast, user, filters.groups, filters.eventType, filters.searchTerm]);

      useEffect(() => {
        fetchEvents();
      }, [fetchEvents]);

      useEffect(() => {
        let newFilteredEvents = [...events];
        setFilteredEvents(newFilteredEvents);
      }, [events, filters]);
      

      const handleAddEvent = () => {
        setEditingEvent(getDefaultEvent(user, availableGroupsForFilter));
        setIsEventFormOpen(true);
      };

      const handleEditEvent = (event) => {
        setEditingEvent({ ...event, date: new Date(event.date) });
        setIsEventFormOpen(true);
      };

      const handleSaveEvent = async (eventData) => {
        setIsLoading(true);
        const eventToSave = {
          ...eventData,
          date: new Date(eventData.date).toISOString(),
          created_by_user_id: user.id,
          created_by_user_name: user.name,
          updated_at: new Date().toISOString(),
        };

        let result;
        if (eventData.id) { 
          result = await supabaseClientFromAuth.from('events').update(eventToSave).eq('id', eventData.id).select();
        } else { 
          const { id, ...insertData } = eventToSave; 
          result = await supabaseClientFromAuth.from('events').insert(insertData).select();
        }

        if (result.error) {
          toast({ title: "Erreur d'enregistrement", description: result.error.message, variant: "destructive" });
        } else {
          toast({ title: eventData.id ? "Événement modifié" : "Événement créé", description: `L'événement "${eventToSave.title}" a été sauvegardé.` });
          fetchEvents(); 
        }
        setIsEventFormOpen(false);
        setEditingEvent(null);
        setIsLoading(false);
      };
      
      const handleDeleteEvent = async (eventId) => {
        setIsLoading(true);
        const { error } = await supabaseClientFromAuth.from('events').delete().eq('id', eventId);
        if (error) {
          toast({ title: "Erreur de suppression", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Événement supprimé", description: "L'événement a été supprimé." });
          fetchEvents(); 
        }
        setIsDetailViewOpen(false);
        setSelectedEvent(null);
        setIsLoading(false);
      };

      const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsDetailViewOpen(true);
      };
      
      const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
      };
      
      const handleActualExport = (exportOptions) => {
        console.log("Exporting with options:", exportOptions, "and events:", events);
        toast({
            title: "Fonctionnalité d'exportation",
            description: "L'exportation des événements n'est pas encore implémentée.",
            variant: "info",
        });
        setIsExporting(false);
      };
      
      const changeDate = (amount) => {
        const newDate = new Date(currentDate);
        if (viewMode === VIEWS.DAY) newDate.setDate(currentDate.getDate() + amount);
        else if (viewMode === VIEWS.WEEK) newDate.setDate(currentDate.getDate() + (amount * 7));
        else if (viewMode === VIEWS.MONTH) newDate.setMonth(currentDate.getMonth() + amount);
        else if (viewMode === VIEWS.YEAR) newDate.setFullYear(currentDate.getFullYear() + amount);
        setCurrentDate(newDate);
      };

      const eventTypes = ['Tous', ...new Set(events.map(e => e.event_type).filter(Boolean))];

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col h-full p-4 md:p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100"
        >
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              Agenda
            </h1>
            <div className="flex items-center space-x-2">
              {(user?.role === 'admin' || user?.role === 'professeur') && (
                <Button onClick={handleAddEvent} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md">
                  <CalendarPlus className="mr-2 h-5 w-5" /> Ajouter un événement
                </Button>
              )}
              <Button onClick={fetchEvents} variant="outline" className="shadow-sm">
                <RotateCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Rafraîchir
              </Button>
               <Button onClick={() => setIsExporting(true)} variant="outline" className="shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Exporter
              </Button>
            </div>
          </div>

          <AgendaHeader
            currentDate={currentDate}
            onChangeDate={changeDate}
            currentView={viewMode}
            onSetView={setViewMode}
            onOpenAddEventForm={handleAddEvent}
            onOpenExportDialog={() => setIsExporting(true)}
            user={user}
            views={VIEWS}
          />
          
          {isLoading && <p className="text-center text-lg text-muted-foreground py-8">Chargement des événements...</p>}
          {!isLoading && filteredEvents.length === 0 && <p className="text-center text-lg text-muted-foreground py-8">Aucun événement à afficher pour les filtres actuels.</p>}
          
          {!isLoading && filteredEvents.length > 0 && (
             viewMode === VIEWS.MONTH ? (
              <CalendarGrid currentDate={currentDate} events={filteredEvents} user={user} onEventClick={handleEventClick} />
            ) : (
              <EventList events={filteredEvents} onEventClick={handleEventClick} viewMode={viewMode} currentDate={currentDate} user={user} />
            )
          )}

          {isEventFormOpen && editingEvent && (
            <EventFormDialog
              isOpen={isEventFormOpen}
              onClose={() => { setIsEventFormOpen(false); setEditingEvent(null); }}
              onSave={handleSaveEvent}
              eventData={editingEvent}
              allGroups={availableGroupsForFilter.filter(g => g !== 'Tous')}
              user={user}
            />
          )}

          {isDetailViewOpen && selectedEvent && (
            <EventDetailDialog
              isOpen={isDetailViewOpen}
              onClose={() => { setIsDetailViewOpen(false); setSelectedEvent(null); }}
              event={selectedEvent}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              userRole={user?.role}
            />
          )}
          
          <ExportDialog
            isOpen={isExporting}
            onClose={() => setIsExporting(false)}
            onExport={handleActualExport}
            defaultDate={currentDate}
          />

        </motion.div>
      );
    };

    export default AgendaPage;