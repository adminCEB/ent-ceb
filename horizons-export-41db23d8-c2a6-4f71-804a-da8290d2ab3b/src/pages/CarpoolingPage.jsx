import React, { useState, useEffect, useMemo } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { PlusCircle, Search } from 'lucide-react';
    import { CarpoolForm } from '@/components/carpooling/CarpoolForm';
    import { CarpoolItem } from '@/components/carpooling/CarpoolItem';
    import { useCarpoolData } from '@/lib/carpoolDataHooks';

    const CarpoolingPage = () => {
      const location = useLocation();
      const navigate = useNavigate();
      const [searchTerm, setSearchTerm] = useState('');
      const [showOfferForm, setShowOfferForm] = useState(false);
      const [filterEventId, setFilterEventId] = useState(null);
      const [filterEventTitle, setFilterEventTitle] = useState('');

      const {
        user,
        carpools,
        allUsersData,
        eventsWithCarpoolLink,
        editingCarpool,
        suggestedEventForForm,
        handleSubmitOffer,
        handleEditOffer,
        handleDeleteOffer,
        handleJoinCarpool,
        handleLeaveCarpool,
        handleOfferFromSuggestion,
        clearEditingState
      } = useCarpoolData(location.state?.eventId, location.state?.eventTitle);

      useEffect(() => {
        if (location.state?.eventId) {
          setFilterEventId(location.state.eventId.toString());
          setFilterEventTitle(location.state.eventTitle || '');
          navigate(location.pathname, { replace: true, state: {} }); 
        }
      }, [location.state, navigate]);
      
      const resetFormAndClose = () => {
        setShowOfferForm(false);
        clearEditingState();
      };

      const onFormSubmit = (formState) => {
        if (handleSubmitOffer(formState)) {
          resetFormAndClose();
        }
      };

      const onEditClick = (carpool) => {
        handleEditOffer(carpool);
        setShowOfferForm(true);
      };
      
      const onOfferFromSuggestionClick = (suggestion) => {
        handleOfferFromSuggestion(suggestion);
        setShowOfferForm(true);
      };

      const displayedCarpools = useMemo(() => {
        let filtered = carpools;
        if (filterEventId) {
          filtered = filtered.filter(cp => cp.eventId?.toString() === filterEventId);
        }
        if (searchTerm) {
          const lowerSearchTerm = searchTerm.toLowerCase();
          filtered = filtered.filter(cp => {
            const driverData = allUsersData.find(u => u.id === cp.driverId);
            return cp.departure?.toLowerCase().includes(lowerSearchTerm) ||
                   cp.destination?.toLowerCase().includes(lowerSearchTerm) ||
                   (driverData?.name || cp.driverName)?.toLowerCase().includes(lowerSearchTerm) ||
                   (cp.eventTitle && cp.eventTitle.toLowerCase().includes(lowerSearchTerm));
          });
        }
        return filtered;
      }, [carpools, searchTerm, filterEventId, allUsersData]);

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold text-primary mb-4 sm:mb-0">Covoiturages</h1>
            <Button onClick={() => { setShowOfferForm(true); clearEditingState(); }} className="bg-green-600 hover:bg-green-700 text-white">
              <PlusCircle className="mr-2 h-5 w-5" /> Proposer un trajet
            </Button>
          </div>

          <CarpoolForm 
            isOpen={showOfferForm}
            onClose={resetFormAndClose}
            onSubmit={onFormSubmit}
            events={eventsWithCarpoolLink} 
            initialData={editingCarpool}
            user={user}
            suggestedEvent={suggestedEventForForm}
          />

          <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-6 w-6 text-blue-400" />
                Rechercher un covoiturage
              </CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Rechercher par lieu, conducteur, événement..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/70"
                />
              </div>
              {filterEventId && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 flex justify-between items-center">
                  <span>Filtrage pour l'événement : <strong>{filterEventTitle || `ID ${filterEventId}`}</strong></span>
                  <Button variant="ghost" size="sm" onClick={() => {setFilterEventId(null); setFilterEventTitle('');}} className="text-blue-700 hover:text-blue-900">Effacer le filtre</Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {displayedCarpools.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {filterEventId ? `Aucun covoiturage trouvé pour l'événement "${filterEventTitle}".` : "Aucune offre de covoiturage disponible pour le moment ou correspondant à votre recherche."}
                </p>
              ) : (
                <ul className="space-y-4">
                  {displayedCarpools.map(cp => (
                    <CarpoolItem 
                        key={cp.id}
                        carpool={cp}
                        user={user}
                        onEdit={onEditClick}
                        onDelete={handleDeleteOffer}
                        onJoin={handleJoinCarpool}
                        onLeave={handleLeaveCarpool}
                        onOfferFromSuggestion={onOfferFromSuggestionClick}
                        allUsersData={allUsersData}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      );
    };

    export default CarpoolingPage;