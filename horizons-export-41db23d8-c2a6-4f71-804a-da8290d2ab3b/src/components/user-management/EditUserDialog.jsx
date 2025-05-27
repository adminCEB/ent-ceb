import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { USER_ROLES } from '@/contexts/AuthContext';
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

    export const EditUserDialog = ({ isOpen, onClose, user, onSave, availableGroups }) => {
      const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '', 
        role: '',
        user_group: '',
        child_first_name: '',
        child_last_name: '',
        status: 'pending', 
      });

      const roleDisplayMap = {
        'membre': 'Membre',
        'professeur': 'Professeur',
        'admin': 'Admin'
      };
      
      const statusDisplayMap = {
          'pending': 'En attente',
          'active': 'Actif',
          'inactive': 'Inactif'
      };

      useEffect(() => {
        if (user) {
          setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            email: user.email || '', 
            role: user.role || '',
            user_group: user.user_group || (user.role === 'membre' && availableGroups && availableGroups.length > 0 ? availableGroups[0] : ''),
            child_first_name: user.child_first_name || '',
            child_last_name: user.child_last_name || '',
            status: user.status || 'pending',
          });
        }
      }, [user, availableGroups]);

      const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
      };
      
      const handleRoleChange = (newRole) => {
        setFormData(prev => ({
            ...prev,
            role: newRole,
            user_group: newRole === 'membre' ? (prev.user_group || (availableGroups && availableGroups.length > 0 ? availableGroups[0] : '')) : '',
            child_first_name: newRole === 'membre' ? prev.child_first_name : '',
            child_last_name: newRole === 'membre' ? prev.child_last_name : '',
        }));
      };

      const handleSaveChanges = () => {
        if (!user) return;
        
        const payload = {
          id: user.id, 
          email: formData.email, 
          ...formData, 
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          user_group: formData.role === 'membre' ? (formData.user_group || (availableGroups && availableGroups.length > 0 ? availableGroups[0] : null)) : null,
          child_first_name: formData.role === 'membre' ? formData.child_first_name.trim() : null,
          child_last_name: formData.role === 'membre' ? formData.child_last_name.trim() : null,
        };
        onSave(payload);
        onClose();
      };

      if (!isOpen || !user) return null;

      return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
          <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Modifier l'utilisateur: {user.first_name} {user.last_name}</AlertDialogTitle>
              <AlertDialogDescription>
                Modifiez les informations de l'utilisateur.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="editFirstName">Prénom</Label><Input id="editFirstName" value={formData.first_name} onChange={e => handleChange('first_name', e.target.value)} className="bg-background/70 mt-1" /></div>
                <div><Label htmlFor="editLastName">Nom</Label><Input id="editLastName" value={formData.last_name} onChange={e => handleChange('last_name', e.target.value)} className="bg-background/70 mt-1" /></div>
              </div>
               <div>
                <Label htmlFor="editEmail">Email (non modifiable)</Label>
                <Input id="editEmail" type="email" value={formData.email} readOnly className="bg-muted/70 mt-1" />
               </div>
              <div><Label htmlFor="editPhone">Téléphone</Label><Input id="editPhone" type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="bg-background/70 mt-1" /></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="editRole">Rôle</Label>
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger id="editRole" className="bg-background/70 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {USER_ROLES.filter(r => r).map(role => <SelectItem key={role} value={role}>{roleDisplayMap[role] || role}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="editStatus">Statut</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger id="editStatus" className="bg-background/70 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.entries(statusDisplayMap).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
              </div>

              {formData.role === 'membre' && (
                <>
                  {availableGroups && availableGroups.length > 0 && (
                    <div>
                        <Label htmlFor="editGroup">Groupe</Label>
                        <Select value={formData.user_group || ''} onValueChange={(value) => handleChange('user_group', value)}>
                        <SelectTrigger id="editGroup" className="bg-background/70 mt-1"><SelectValue placeholder="Sélectionner un groupe" /></SelectTrigger>
                        <SelectContent>
                            {availableGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                        </SelectContent>
                        </Select>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="editChildFirstName">Prénom de l'enfant</Label><Input id="editChildFirstName" value={formData.child_first_name} onChange={e => handleChange('child_first_name', e.target.value)} className="bg-background/70 mt-1" /></div>
                    <div><Label htmlFor="editChildLastName">Nom de l'enfant</Label><Input id="editChildLastName" value={formData.child_last_name} onChange={e => handleChange('child_last_name', e.target.value)} className="bg-background/70 mt-1" /></div>
                  </div>
                </>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveChanges}>Enregistrer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };
  