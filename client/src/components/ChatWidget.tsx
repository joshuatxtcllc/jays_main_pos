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
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
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
      <TooltipProvider>
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
      </TooltipProvider>

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
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './ui/avatar';
import { AiOutlineSend, AiOutlineClose, AiOutlineQuestionCircle, AiOutlinePushpin } from 'react-icons/ai';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { BiLoader } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "../hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isPinned?: boolean;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          content: "Hello! I'm your Jay's Frames assistant. I can help you navigate the system, check order status, or answer questions about framing. What can I help you with today?",
          sender: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    // Update UI with user message
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      // Update UI with assistant message
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });

      // Create error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting to the server. Please try again in a moment.",
        sender: 'assistant',
        timestamp: new Date(),
      };

      // Update UI with error message
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePin = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, isPinned: !msg.isPinned } : msg))
    );
  };

  const clearChat = () => {
    const pinnedMessages = messages.filter((msg) => msg.isPinned);
    setMessages([
      {
        id: Date.now().toString(),
        content: "Chat history cleared. How can I help you?",
        sender: 'assistant',
        timestamp: new Date(),
      },
      ...pinnedMessages,
    ]);
  };

  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 rounded-full p-4 shadow-lg z-50 bg-primary hover:bg-primary/90"
      >
        {isOpen ? (
          <AiOutlineClose className="h-6 w-6" />
        ) : (
          <AiOutlineQuestionCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-40 ${
              isExpanded ? 'top-4 right-4 left-4 bottom-20' : 'bottom-20 right-4 w-96'
            }`}
          >
            <Card className="shadow-xl border-2 border-primary/20 h-full flex flex-col">
              {/* Header */}
              <div className="p-3 border-b flex justify-between items-center bg-muted/30">
                <h3 className="font-semibold text-foreground">Jay's Frames Assistant</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Minimize" : "Maximize"}
                  >
                    {isExpanded ? (
                      <FiMinimize2 className="h-4 w-4" />
                    ) : (
                      <FiMaximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChat}
                    title="Clear chat"
                  >
                    <AiOutlineClose className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <CardContent className="flex-grow p-0 overflow-hidden">
                <ScrollArea className="h-full max-h-[500px] p-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`mb-4 ${
                        message.isPinned ? 'bg-muted/30 p-2 rounded-lg border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.sender === 'assistant' && (
                          <Avatar className="h-8 w-8 mr-2">
                            <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full rounded-full text-xs font-bold">
                              JF
                            </div>
                          </Avatar>
                        )}
                        <div className={`max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} p-3 rounded-lg`}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {message.sender === 'user' && (
                          <Avatar className="h-8 w-8 ml-2">
                            <div className="bg-muted-foreground text-muted flex items-center justify-center h-full w-full rounded-full text-xs font-bold">
                              ME
                            </div>
                          </Avatar>
                        )}
                      </div>
                      {message.sender === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePin(message.id)}
                          className="mt-1 h-6 w-6"
                          title={message.isPinned ? "Unpin message" : "Pin message"}
                        >
                          <AiOutlinePushpin className={`h-3 w-3 ${message.isPinned ? 'text-primary' : 'text-muted-foreground'}`} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>

              {/* Message loading indicator */}
              {isLoading && (
                <div className="px-4 py-2">
                  <div className="flex items-center text-muted-foreground">
                    <BiLoader className="h-4 w-4 mr-2 animate-spin" />
                    <span className="text-sm">Assistant is typing...</span>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t mt-auto">
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="resize-none min-h-[2.5rem] max-h-[150px]"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="shrink-0"
                  >
                    <AiOutlineSend className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
