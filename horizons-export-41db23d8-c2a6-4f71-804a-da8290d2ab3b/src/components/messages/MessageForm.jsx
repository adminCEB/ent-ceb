import React, { useState, useRef, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Checkbox } from "@/components/ui/checkbox";
    import { Send, Users, User, Paperclip, Upload, Trash2 } from 'lucide-react';

    export const MessageForm = ({ user, groups = [], allUsers = [], onSendMessage, toast }) => {
      const [subject, setSubject] = useState('');
      const [newMessageContent, setNewMessageContent] = useState('');
      const [recipientType, setRecipientType] = useState('user');
      const [selectedUserRecipient, setSelectedUserRecipient] = useState('');
      const [selectedGroupRecipients, setSelectedGroupRecipients] = useState([]);
      const [attachment, setAttachment] = useState(null);
      const [attachmentPreview, setAttachmentPreview] = useState(null);
      const attachmentInputRef = useRef(null);

      useEffect(() => {
        if (!user) {
          toast({ title: "Utilisateur non chargé", description: "Impossible d'initialiser le formulaire de message.", variant: "destructive"});
        }
      }, [user, toast]);

      if (!user) {
        return <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg p-4"><p>Chargement du formulaire...</p></Card>;
      }

      const handleAttachmentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 10 * 1024 * 1024) { 
            toast({ title: "Fichier trop volumineux", description: "La pièce jointe ne doit pas dépasser 10Mo.", variant: "destructive" });
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            setAttachment({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
            setAttachmentPreview(file.name);
          };
          reader.readAsDataURL(file);
        }
      };

      const removeAttachment = () => {
        setAttachment(null);
        setAttachmentPreview(null);
        if (attachmentInputRef.current) attachmentInputRef.current.value = "";
      };

      const handleGroupSelection = (groupName) => {
        setSelectedGroupRecipients(prev => 
          prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
        );
      };

      const handleSubmit = () => {
        if (!subject.trim()) {
            toast({ title: "Sujet manquant", description: "Veuillez entrer un sujet pour votre message.", variant: "destructive"});
            return;
        }
        if (!newMessageContent.trim()) {
          toast({ title: "Message vide", description: "Veuillez écrire un contenu pour votre message.", variant: "destructive" });
          return;
        }
        
        let recipientsData = [];
        let isGroupMsg = false;
        let ccAdminsFlag = false;

        if (recipientType === 'user') {
          if (!selectedUserRecipient) {
            toast({ title: "Destinataire manquant", description: "Veuillez sélectionner un utilisateur.", variant: "destructive" });
            return;
          }
          const recipientUserObj = allUsers.find(u => u.id === selectedUserRecipient);
          if (!recipientUserObj) {
             toast({ title: "Destinataire invalide", description: "L'utilisateur sélectionné n'est pas valide.", variant: "destructive" });
             return;
          }
          recipientsData.push(recipientUserObj.name);
        } else { 
          if (selectedGroupRecipients.length === 0) {
            toast({ title: "Groupe manquant", description: "Veuillez sélectionner au moins un groupe.", variant: "destructive" });
            return;
          }
          recipientsData = [...selectedGroupRecipients];
          isGroupMsg = true;
          if (user.role === 'professor' || user.role === 'admin') ccAdminsFlag = true;
        }

        const newMessageData = {
          recipients: recipientsData, 
          subject: subject,
          content: newMessageContent,
          isGroupMessage: isGroupMsg,
          ccAdmins: ccAdminsFlag,
          attachment: attachment,
        };
        onSendMessage(newMessageData);
        setSubject('');
        setNewMessageContent('');
        setSelectedUserRecipient('');
        setSelectedGroupRecipients([]);
        removeAttachment();
      };

      const canSendToGroup = user.role === 'professor' || user.role === 'admin';
      const canAttachFile = user.role === 'professor' || user.role === 'admin';
      const validUsersForSelection = allUsers.filter(u => u && u.id && u.name && u.id !== user.id);
      const availableGroups = Array.isArray(groups) ? groups.filter(g => g && g !== 'Tous') : [];


      return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="mr-2 h-6 w-6 text-indigo-400" /> Nouveau Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label htmlFor="messageSubject">Sujet</Label>
                <Input id="messageSubject" placeholder="Sujet de votre message" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 bg-background/70" />
            </div>
            <div>
              <Label>Type de destinataire</Label>
              <Select onValueChange={(value) => { setRecipientType(value); setSelectedUserRecipient(''); setSelectedGroupRecipients([]); }} value={recipientType}>
                <SelectTrigger className="w-full bg-background/70 mt-1"><SelectValue placeholder="Sélectionner type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user"><User className="inline mr-2 h-4 w-4" />Utilisateur unique</SelectItem>
                  {canSendToGroup && <SelectItem value="group"><Users className="inline mr-2 h-4 w-4" />Groupe(s)</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            {recipientType === 'user' && (
              <div>
                <Label htmlFor="userRecipient">Destinataire</Label>
                <Select onValueChange={setSelectedUserRecipient} value={selectedUserRecipient}>
                  <SelectTrigger className="w-full bg-background/70 mt-1"><SelectValue placeholder="Sélectionner un utilisateur" /></SelectTrigger>
                  <SelectContent>
                    {validUsersForSelection.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {recipientType === 'group' && canSendToGroup && (
              <div>
                <Label>Groupes Destinataires</Label>
                <div className="mt-2 space-y-2 p-3 border rounded-md bg-background/50 max-h-40 overflow-y-auto">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="group-Tous"
                        checked={selectedGroupRecipients.includes("Tous")}
                        onCheckedChange={() => handleGroupSelection("Tous")}
                      />
                      <Label htmlFor="group-Tous" className="font-normal">Tous les groupes</Label>
                    </div>
                  {availableGroups.map(group => (
                    <div key={group} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group}`}
                        checked={selectedGroupRecipients.includes(group)}
                        onCheckedChange={() => handleGroupSelection(group)}
                        disabled={selectedGroupRecipients.includes("Tous")}
                      />
                      <Label htmlFor={`group-${group}`} className="font-normal">{group}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="messageContent">Message</Label>
              <Textarea id="messageContent" placeholder="Votre message..." value={newMessageContent} onChange={(e) => setNewMessageContent(e.target.value)} className="mt-1 bg-background/70 min-h-[100px]" />
            </div>
            {canAttachFile && (
              <div>
                <Label htmlFor="attachmentFile">Pièce jointe (optionnel, max 10Mo)</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => attachmentInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Choisir un fichier</Button>
                  {attachmentPreview && (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Paperclip className="h-4 w-4" /><span>{attachmentPreview}</span>
                      <Button type="button" size="icon" variant="ghost" onClick={removeAttachment} className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
                <Input id="attachmentFile" type="file" ref={attachmentInputRef} className="hidden" onChange={handleAttachmentChange} />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
                onClick={handleSubmit} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!subject.trim() || !newMessageContent.trim() || (recipientType === 'user' && !selectedUserRecipient) || (recipientType === 'group' && selectedGroupRecipients.length === 0)}
            >
                Envoyer
            </Button>
          </CardFooter>
        </Card>
      );
    };