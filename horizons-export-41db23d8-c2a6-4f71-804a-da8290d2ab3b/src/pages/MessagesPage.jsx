import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { MessageSquare, Send, Search } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { MessageList } from '@/components/messages/MessageList';
    import { MessageForm } from '@/components/messages/MessageForm';
    import { Input } from '@/components/ui/input';

    const MessagesPage = () => {
      const { user, getAllUsers, GROUPS } = useAuth();
      const { toast } = useToast();
      const [messages, setMessages] = useState([]);
      const [showComposeForm, setShowComposeForm] = useState(false);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedMessage, setSelectedMessage] = useState(null);
      const [allUsersList, setAllUsersList] = useState([]);

      useEffect(() => {
        if (getAllUsers) {
            setAllUsersList(getAllUsers());
        }
      }, [getAllUsers]);
      
      useEffect(() => {
        const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
        setMessages(storedMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }, []);

      const saveMessages = (updatedMessages) => {
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        setMessages(updatedMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      };

      const handleSendMessage = (messageData) => {
        if (!user) {
            toast({ title: "Erreur utilisateur", description: "Impossible d'envoyer le message, utilisateur non identifié.", variant: "destructive" });
            return;
        }
        const newMessage = {
          id: Date.now(),
          sender: user.name,
          senderId: user.id,
          ...messageData,
          timestamp: new Date().toISOString(),
          readBy: [user.id], 
        };
        saveMessages([...messages, newMessage]);
        toast({ title: "Message envoyé", description: `Votre message "${messageData.subject}" a été envoyé.` });
        setShowComposeForm(false);

        if (messageData.attachment) {
           const messageAttachments = (JSON.parse(localStorage.getItem('messages')) || [])
              .filter(msg => msg.attachment)
              .map(msg => ({
                id: `msg-att-${msg.id}`,
                name: msg.attachment.name,
                description: `Pièce jointe du message: "${msg.subject}"`,
                type: msg.attachment.type,
                size: msg.attachment.size,
                dataUrl: msg.attachment.dataUrl,
                uploadedBy: msg.sender,
                uploadDate: msg.timestamp,
                groups: msg.isGroupMessage ? msg.recipients : ['Tous'], 
                isAttachment: true,
                associatedMessageSubject: msg.subject
              }));
            
            const currentDocs = JSON.parse(localStorage.getItem('documents')) || [];
            const newAttachmentsToSave = messageAttachments.filter(
              att => !currentDocs.some(doc => doc.id === att.id)
            );

            if (newAttachmentsToSave.length > 0) {
                localStorage.setItem('documents', JSON.stringify([...currentDocs, ...newAttachmentsToSave]));
            }
        }
      };

      const markAsRead = (messageId) => {
        if (!user) return;
        const updatedMessages = messages.map(msg => {
            if (msg.id === messageId) {
                const newReadBy = msg.readBy ? [...new Set([...msg.readBy, user.id])] : [user.id];
                return { ...msg, readBy: newReadBy };
            }
            return msg;
        });
        saveMessages(updatedMessages);
      };
      
      const deleteMessage = (messageId) => {
        const messageToDelete = messages.find(msg => msg.id === messageId);
        if (messageToDelete && messageToDelete.attachment) {
            const currentDocs = JSON.parse(localStorage.getItem('documents')) || [];
            const updatedDocs = currentDocs.filter(doc => doc.id !== `msg-att-${messageId}`);
            localStorage.setItem('documents', JSON.stringify(updatedDocs));
        }
        saveMessages(messages.filter(msg => msg.id !== messageId));
        toast({ title: "Message supprimé", variant: "destructive" });
        setSelectedMessage(null);
      };

      const isMessageUnread = (message) => {
        if (!user || !message.readBy) return false;
        return !message.readBy.includes(user.id);
      };

      const filteredMessages = messages.filter(msg => {
        if (!user) return false;
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        let isRecipient = false;
        if (msg.isGroupMessage) {
            const userBelongsToGroup = Array.isArray(msg.recipients) && (msg.recipients.includes(user.group) || msg.recipients.includes('Tous'));
            isRecipient = userBelongsToGroup;
        } else {
            const recipientUser = allUsersList.find(u => u.name === msg.recipients[0]);
            isRecipient = recipientUser ? recipientUser.id === user.id : false;
        }

        const isSender = msg.senderId === user.id;
        const isAdminOrProfessorViewing = (user.role === 'admin' || user.role === 'professor');
        
        const relevantToUser = isRecipient || isSender || isAdminOrProfessorViewing;

        if (!relevantToUser) return false;

        return (
          (msg.subject && msg.subject.toLowerCase().includes(lowerSearchTerm)) ||
          (msg.sender && msg.sender.toLowerCase().includes(lowerSearchTerm)) ||
          (msg.isGroupMessage && Array.isArray(msg.recipients) && msg.recipients.some(r => r.toLowerCase().includes(lowerSearchTerm))) ||
          (!msg.isGroupMessage && Array.isArray(msg.recipients) && msg.recipients[0] && msg.recipients[0].toLowerCase().includes(lowerSearchTerm)) ||
          (msg.content && msg.content.toLowerCase().includes(lowerSearchTerm))
        );
      });
      
      const unreadMessagesCount = messages.filter(msg => {
        if (!user) return false;
        let isRecipient = false;
         if (msg.isGroupMessage) {
            const userBelongsToGroup = Array.isArray(msg.recipients) && (msg.recipients.includes(user.group) || msg.recipients.includes('Tous'));
            isRecipient = userBelongsToGroup;
        } else {
            const recipientUser = allUsersList.find(u => u.name === msg.recipients[0]);
            isRecipient = recipientUser ? recipientUser.id === user.id : false;
        }
        return isRecipient && isMessageUnread(msg);
      }).length;


      if (!user) {
        return <p>Chargement des informations utilisateur...</p>;
      }

      return (
        <div className="flex flex-col h-full space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Messagerie</h1>
            <div className="flex items-center space-x-2">
                {unreadMessagesCount > 0 && (
                    <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full">
                        {unreadMessagesCount} non lu(s)
                    </span>
                )}
                <Button onClick={() => setShowComposeForm(true)} className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm p-2 sm:p-3">
                    <Send className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Nouveau Message
                </Button>
            </div>
          </div>

          {showComposeForm && (
            <MessageForm
              user={user}
              groups={GROUPS || []}
              allUsers={allUsersList || []}
              onSendMessage={handleSendMessage}
              toast={toast}
            />
          )}

          <Card className="flex-1 flex flex-col bg-card/70 backdrop-blur-sm border-border/30 shadow-lg overflow-hidden">
            <CardHeader className="border-b p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <MessageSquare className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  Boîte de réception
                </CardTitle>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 bg-background/70 h-9 sm:h-10 text-xs sm:text-sm w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
               <MessageList 
                  messages={filteredMessages} 
                  currentUser={user} 
                  onSelectMessage={(msg) => { setSelectedMessage(msg); if (isMessageUnread(msg)) markAsRead(msg.id);}} 
                  selectedMessage={selectedMessage}
                  onDeleteMessage={deleteMessage}
                  isMessageUnread={isMessageUnread}
                />
            </CardContent>
          </Card>
        </div>
      );
    };

    export default MessagesPage;