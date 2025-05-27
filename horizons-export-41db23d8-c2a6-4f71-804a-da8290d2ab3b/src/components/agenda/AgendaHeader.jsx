import React, { useCallback } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardHeader } from '@/components/ui/card';
    import { ChevronLeft, ChevronRight, PlusCircle, Share2 } from 'lucide-react';

    const DEFAULT_VIEWS_OBJECT = {
        DAY: 'Jour',
        WEEK: 'Semaine',
        MONTH: 'Mois',
        YEAR: 'Année',
        LIST: 'Liste',
    };
    
    export const AgendaHeader = ({ currentView, currentDate, onChangeDate, onSetView, onOpenAddEventForm, onOpenExportDialog, user, views }) => {
        const currentViews = views && Object.keys(views).length > 0 ? views : DEFAULT_VIEWS_OBJECT;

        const getHeaderTitle = useCallback(() => {
            if (!currentViews || !currentDate) return '';
            switch (currentView) {
            case currentViews.DAY: return currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            case currentViews.WEEK:
                const startOfWeek = new Date(currentDate);
                startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1)); 
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return `Semaine du ${startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            case currentViews.MONTH: return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            case currentViews.YEAR: return currentDate.getFullYear().toString();
            default: return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }); 
            }
        }, [currentDate, currentView, currentViews]);

        return (
            <>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary hidden sm:block">Agenda</h1>
                <div className="flex space-x-1 sm:space-x-2">
                    {user && (user.role === 'professeur' || user.role === 'admin') && (
                    <Button onClick={onOpenAddEventForm} className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm p-2 sm:p-3">
                        <PlusCircle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Ajouter
                    </Button>
                    )}
                    <Button onClick={onOpenExportDialog} variant="outline" size="sm" className="text-xs sm:text-sm p-2 sm:p-3">
                        <Share2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Exporter
                    </Button>
                </div>
            </div>
            <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg mb-6">
                <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 p-4">
                <div className="flex items-center space-x-2 w-full md:w-auto justify-center">
                    <Button variant="outline" size="icon" onClick={() => onChangeDate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
                    <h2 className="text-lg sm:text-xl font-semibold text-center min-w-[180px] sm:min-w-[250px] md:min-w-[300px]">
                    {getHeaderTitle()}
                    </h2>
                    <Button variant="outline" size="icon" onClick={() => onChangeDate(1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
                <div className="flex space-x-1 overflow-x-auto w-full md:w-auto justify-center pb-2 md:pb-0">
                    {Object.values(currentViews).map(view => (
                    <Button key={view} variant={currentView === view ? 'default' : 'outline'} onClick={() => onSetView(view)} size="sm" className="text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5 whitespace-nowrap">
                        {view}
                    </Button>
                    ))}
                </div>
                </CardHeader>
            </Card>
            </>
        );
    };