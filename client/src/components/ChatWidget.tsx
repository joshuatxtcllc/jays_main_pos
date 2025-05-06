import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareText, 
  Send, 
  X, 
  Loader2,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

interface SearchResult {
  id: string;
  type: 'frame' | 'matboard' | 'glass' | 'customer' | 'order' | 'help';
  name: string;
  description?: string;
  route?: string;
  thumbnail?: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initial greeting when widget opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          content: 'Hello! I can help you find frames, matboards, and navigate through the system. What are you looking for today?',
          sender: 'system',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsSearching(true);
    
    try {
      // Send message to API for processing
      const response = await apiRequest('POST', '/api/chat', {
        message: userMessage.content
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }
      
      const data = await response.json();
      
      // Add system response
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        content: data.response,
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      // Update search results if any
      if (data.searchResults && data.searchResults.length > 0) {
        setSearchResults(data.searchResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Chat API error:', error);
      // Fallback message if API fails
      const fallbackMessage: ChatMessage = {
        id: `system-fallback-${Date.now()}`,
        content: "I'm having trouble connecting to the search system. Please try again later or use the search bar directly.",
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      
      toast({
        title: 'Search Error',
        description: 'Failed to process your request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsTyping(false);
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const navigateTo = (route: string) => {
    if (route) {
      window.location.href = route;
      setIsOpen(false);
    }
  };

  // Format timestamp to readable time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat toggle button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleChat}
            className="rounded-full h-12 w-12 fixed bottom-6 right-6 shadow-lg"
            size="icon"
            variant="default"
          >
            <MessageSquareText className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Chat Assistant</p>
        </TooltipContent>
      </Tooltip>

      {/* Chat window */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-md p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="text-lg">Chat Assistant</SheetTitle>
            <SheetClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
          
          <div 
            ref={messageContainerRef}
            className="px-4 py-2 overflow-y-auto flex-1" 
            style={{ height: 'calc(100vh - 140px)' }}
          >
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`mb-4 ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                <Card className={`max-w-[80%] ${message.sender === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto'}`}>
                  <CardContent className="p-3">
                    <div>{message.content}</div>
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {formatTime(message.timestamp)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {isTyping && (
              <div className="mb-4">
                <Card className="max-w-[80%] mr-auto">
                  <CardContent className="p-3">
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Typing...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Search results */}
            {searchResults.length > 0 && !isSearching && (
              <div className="mt-4 mb-2">
                <h3 className="text-sm font-medium mb-2">Search Results:</h3>
                <div className="space-y-2">
                  {searchResults.map(result => (
                    <Card 
                      key={result.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => result.route && navigateTo(result.route)}
                    >
                      <CardContent className="p-3 flex items-center">
                        {result.thumbnail ? (
                          <img 
                            src={result.thumbnail} 
                            alt={result.name}
                            className="w-10 h-10 object-cover mr-3 rounded-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted flex items-center justify-center mr-3 rounded-sm">
                            <Search className="h-5 w-5 text-muted-foreground/70" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          {result.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {result.description}
                            </div>
                          )}
                          <div className="text-xs text-primary/70">
                            {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <SheetFooter className="px-4 py-3 border-t">
            <div className="flex w-full">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="mr-2"
                disabled={isTyping}
              />
              <Button 
                onClick={sendMessage} 
                size="icon"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatWidget;