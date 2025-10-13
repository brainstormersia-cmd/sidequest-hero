import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select(`
          id, 
          title, 
          status,
          owner_id,
          runner_id,
          profiles!missions_owner_id_fkey(first_name, last_name, avatar_url),
          runner:profiles!missions_runner_id_fkey(first_name, last_name, avatar_url),
          messages(content, created_at, sender_id)
        `)
        .or(`owner_id.eq.${user?.id},runner_id.eq.${user?.id}`)
        .not('runner_id', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-12 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const getOtherUser = (conv: any) => {
    return conv.owner_id === user?.id ? conv.runner : conv.profiles;
  };

  const getLastMessage = (conv: any) => {
    if (!conv.messages || conv.messages.length === 0) return null;
    return conv.messages[conv.messages.length - 1];
  };

  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
          <p className="text-sm text-muted-foreground">Le tue conversazioni attive</p>
        </div>
      </div>

      <div className="px-6 py-6 pb-24 max-w-2xl mx-auto">
        {!conversations || conversations.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna conversazione</h3>
            <p className="text-muted-foreground">
              Accetta una missione per iniziare a chattare!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              const lastMessage = getLastMessage(conv);
              
              return (
                <Card
                  key={conv.id}
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-smooth"
                  onClick={() => navigate(`/chat/${conv.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherUser?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {otherUser?.first_name?.[0]}{otherUser?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {otherUser?.first_name} {otherUser?.last_name}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lastMessage.created_at), { 
                              addSuffix: true, 
                              locale: it 
                            })}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 truncate">
                        {conv.title}
                      </p>
                      
                      {lastMessage && (
                        <p className="text-sm text-foreground/70 line-clamp-1">
                          {lastMessage.sender_id === user?.id && "Tu: "}
                          {lastMessage.content}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={conv.status === 'open' ? 'default' : 'secondary'}>
                          {conv.status === 'open' ? 'Aperta' : 
                           conv.status === 'in_progress' ? 'In corso' : 
                           conv.status === 'completed' ? 'Completata' : 'Chiusa'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
