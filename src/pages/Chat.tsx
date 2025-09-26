import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Paperclip, MapPin, Star, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "runner" | "owner";
  timestamp: Date;
  type?: "text" | "location" | "attachment";
}

const ChatBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
    <div className={`chat-bubble ${isOwn ? "chat-bubble-runner" : "chat-bubble-owner"}`}>
      <p className="leading-relaxed">{message.text}</p>
      <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  </div>
);

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Ciao! Ho visto che sei interessato alla missione di consegna pacchi. Hai esperienza in questo tipo di lavori?",
      sender: "owner",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: 2,
      text: "Salve! Sì, ho già fatto diverse consegne in zona centro. Ho la macchina e conosco bene la città. Quando dovrei iniziare?",
      sender: "runner",
      timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
    },
    {
      id: 3,
      text: "Perfetto! Idealmente domani mattina alle 9. I pacchi sono pronti per il ritiro presso il nostro ufficio in Via Roma 15.",
      sender: "owner",
      timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
    },
    {
      id: 4,
      text: "Va bene, domani alle 9 sarò lì. Potresti condividere gli indirizzi di consegna così posso organizzare il percorso?",
      sender: "runner",
      timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
    },
    {
      id: 5,
      text: "Certamente! Ti invio la lista completa con tutti i dettagli. Grazie per la disponibilità!",
      sender: "owner",
      timestamp: new Date(Date.now() - 2400000), // 40 minutes ago
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock contact info
  const contact = {
    name: id?.replace("-", " ") || "Marco Rossi",
    rating: 4.8,
    avatar: "MR",
    online: true,
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage.trim(),
        sender: "runner", // Current user is runner in this mock
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                {contact.avatar}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">{contact.name}</h2>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${contact.online ? "bg-success" : "bg-muted-foreground"}`} />
                <span className="text-muted-foreground">
                  {contact.online ? "Online" : "Ultimo accesso 2h fa"}
                </span>
                <Star className="w-3 h-3 fill-current text-primary ml-2" />
                <span className="text-muted-foreground">{contact.rating}</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate(`/profile/${contact.name.toLowerCase().replace(" ", "-")}`)}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-lg mx-auto">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              isOwn={message.sender === "runner"} // Current user is runner
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-border/50 bg-card/95 backdrop-blur-lg">
        <div className="px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full flex-shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full flex-shrink-0"
            >
              <MapPin className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi un messaggio..."
                className="bg-muted/50 border-0 focus:bg-card transition-smooth rounded-2xl"
                autoComplete="off"
              />
            </div>
            
            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-card transition-bounce hover:scale-110 active:scale-95"
              disabled={!newMessage.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;