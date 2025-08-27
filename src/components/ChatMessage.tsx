import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const ChatMessage = ({ type, content, timestamp }: ChatMessageProps) => {
  const isUser = type === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
        <div className={`glass rounded-lg p-3 ${isUser ? 'bg-primary/20 ml-auto' : 'bg-card/50'}`}>
          <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
        </div>
        <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {format(timestamp, 'HH:mm')}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;