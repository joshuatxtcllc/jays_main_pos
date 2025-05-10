import React from 'react';
import { ProductionKanban } from '@/components/ProductionKanban';
import { VoiceControlProduction } from '@/components/VoiceControlProduction';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

export default function ProductionPage() {
  const [showVoiceControl, setShowVoiceControl] = useState(false);

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowVoiceControl(!showVoiceControl)}
        >
          <Volume2 className="h-4 w-4 mr-2" />
          {showVoiceControl ? 'Hide Voice Control' : 'Show Voice Control'}
        </Button>
      </div>

      {showVoiceControl && (
        <VoiceControlProduction />
      )}

      <ProductionKanban />
    </div>
  );
}