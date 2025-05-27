import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { MessagesSquare, Eye, Trash2, Paperclip } from 'lucide-react';

    export const MessageList = ({ messages, currentUser, onMarkAsRead, onDeleteMessage, onDownloadAttachment }) => {
      if (messages.length === 0) {
        return (
          <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
            <CardHeader><CardTitle className="flex items-center"><MessagesSquare className="mr-2 h-6 w-6 text-purple-400" /> Boîte de Réception / Messages Envoyés</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Aucun message.</p></CardContent>
          </Card>
        );
      }

      const isMessageRead = (message) => {
        return message.readBy && message.readBy.includes(currentUser.id);
      };

      return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-lg">
          <CardHeader><CardTitle className="flex items-center"><MessagesSquare className="mr-2 h-6 w-6 text-purple-400" /> Boîte de Réception / Messages Envoyés</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {messages.map(msg => {
                const messageIsReadForCurrentUser = isMessageRead(msg);
                const isSender = msg.senderId === currentUser.id;
                let recipientDisplay = '';
                if (isSender) {
                  if (msg.isGroupMessage) {
                    recipientDisplay = `À Groupes: ${msg.recipients.join(', ')}`;
                  } else {
                    recipientDisplay = `À: ${msg.recipients[0]}`;
                  }
                } else {
                  recipientDisplay = `De: ${msg.sender}`;
                  if (msg.isGroupMessage) {
                     recipientDisplay += ` (via Groupe: ${msg.recipients.find(r => r === currentUser.group) || msg.recipients.join(', ')})`;
                  }
                }

                return (
                  <li key={msg.id} className={`p-3 border rounded-md ${messageIsReadForCurrentUser && !isSender ? 'bg-background/30' : 'bg-primary/10 border-primary/50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-primary">{msg.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {recipientDisplay}
                        </p>
                        <p className="text-sm mt-1">{msg.content}</p>
                        {msg.attachment && (
                          <Button variant="link" size="sm" onClick={() => onDownloadAttachment(msg.attachment)} className="p-0 h-auto text-sm mt-1">
                            <Paperclip className="mr-1 h-4 w-4" /> {msg.attachment.name}
                          </Button>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{new Date(msg.timestamp).toLocaleString('fr-FR')}</p>
                      </div>
                      <div className="flex flex-col space-y-1 items-end">
                        {!messageIsReadForCurrentUser && !isSender && (
                          <Button variant="ghost" size="sm" onClick={() => onMarkAsRead(msg.id)} className="text-xs text-blue-500 hover:text-blue-700">
                            <Eye className="mr-1 h-3 w-3" /> Marquer comme lu
                          </Button>
                        )}
                        {messageIsReadForCurrentUser && !isSender && <span className="text-xs text-green-500 flex items-center"><Eye className="mr-1 h-3 w-3" /> Lu</span>}
                        <Button variant="ghost" size="sm" onClick={() => onDeleteMessage(msg.id)} className="text-xs text-red-500 hover:text-red-700">
                          <Trash2 className="mr-1 h-3 w-3" /> Supprimer
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      );
    };