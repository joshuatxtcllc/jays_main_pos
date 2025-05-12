import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useProductionKanban } from '@/hooks/use-production';
import { ProductionStatus } from '@shared/schema';

export function VoiceControlProduction() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const { updateOrderStatus, orders } = useProductionKanban();

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptValue = result[0].transcript;
      setTranscript(transcriptValue);
      setConfidence(result[0].confidence * 100);

      if (result.isFinal) {
        processCommand(transcriptValue);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice controls.",
          variant: "destructive"
        });
        setIsListening(false);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      recognitionRef.current?.start();
    } else {
      recognitionRef.current?.stop();
      setTranscript('');
    }
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Commands format: "move order {number} to {status}"
    const moveOrderRegex = /move\s+order\s+(\d+)\s+to\s+(\w+(?:\s+\w+)*)/i;
    const match = lowerCommand.match(moveOrderRegex);

    if (match) {
      const orderId = parseInt(match[1]);
      let targetStatus = match[2].replace(/\s+/g, '_').toLowerCase();

      // Map spoken words to valid status values
      const statusMap: Record<string, ProductionStatus> = {
        'order_processed': 'order_processed',
        'scheduled': 'scheduled',
        'materials_ordered': 'materials_ordered',
        'materials_arrived': 'materials_arrived',
        'frame_cut': 'frame_cut',
        'mat_cut': 'mat_cut',
        'prepped': 'prepped',
        'completed': 'completed',
        'delayed': 'delayed',
        // Alternative spoken versions
        'order': 'order_processed',
        'order_process': 'order_processed',
        'material_order': 'materials_ordered',
        'material_ordered': 'materials_ordered',
        'material_arrive': 'materials_arrived',
        'material_arrived': 'materials_arrived',
        'materials': 'materials_ordered',
        'frame': 'frame_cut',
        'mat': 'mat_cut',
        'prep': 'prepped',
        'prepared': 'prepped',
        'preparation': 'prepped',
        'complete': 'completed',
        'finished': 'completed',
        'done': 'completed',
        'delay': 'delayed',
        'on_hold': 'delayed'
      };

      // Find the order
      const order = orders?.find(o => o.id === orderId);

      if (order) {
        if (statusMap[targetStatus]) {
          updateOrderStatus({ 
            id: orderId, 
            status: statusMap[targetStatus]
          });

          toast({
            title: "Order Updated",
            description: `Order #${orderId} moved to ${statusMap[targetStatus].replace(/_/g, ' ')}`,
            variant: "default"
          });
        } else {
          toast({
            title: "Command Error",
            description: `Unknown status: "${match[2]}"`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Command Error",
          description: `Order #${orderId} not found`,
          variant: "destructive"
        });
      }
    } else if (lowerCommand.includes('help')) {
      toast({
        title: "Voice Command Help",
        description: `Try saying: "Move order 123 to completed" or "Move order 456 to frame cut"`,
        variant: "default"
      });
    } else if (transcript.trim() !== '') {
      toast({
        title: "Command Not Recognized",
        description: "Try format: 'Move order [number] to [status]'",
        variant: "destructive"
      });
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full mb-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
            Voice Control Unavailable
          </CardTitle>
          <CardDescription>
            Your browser doesn't support the Speech Recognition API.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Volume2 className="h-5 w-5 mr-2" />
          Voice Control
        </CardTitle>
        <CardDescription>
          Update order status hands-free with voice commands
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isListening && (
          <div className="text-sm mb-4">
            <div className="font-medium">Heard:</div>
            <div className="p-2 bg-muted rounded-md mt-1 min-h-[50px]">
              {transcript || "Listening..."}
            </div>
            {confidence > 0 && (
              <div className="mt-1 text-xs text-muted-foreground">
                Confidence: {confidence.toFixed(0)}%
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg bg-secondary/30 p-3 text-xs">
          <div className="font-medium mb-1">Example commands:</div>
          <ul className="list-disc pl-4 space-y-1">
            <li>"Move order 123 to materials ordered"</li>
            <li>"Move order 456 to completed"</li>
            <li>"Move order 789 to frame cut"</li>
            <li>"Help" - Show command tips</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {isListening && (
            <Badge variant="outline" className="animate-pulse bg-red-500/10">
              Listening
            </Badge>
          )}
        </div>
        <Button 
          variant={isListening ? "destructive" : "default"}
          size="sm"
          onClick={toggleListening}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Listening
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}