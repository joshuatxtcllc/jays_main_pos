
import React from 'react';
import { FrameEducationGuide } from '@/components/FrameEducationGuide';

export default function FrameEducationPage() {
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Frame Education Center</h1>
        <p className="text-muted-foreground">
          Everything you need to know about custom framing to make informed decisions
        </p>
      </div>
      
      <div className="space-y-8">
        <FrameEducationGuide />
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted/30 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Framing Glossary</h2>
            <p className="mb-3">Essential framing terms to know:</p>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">United Inches</dt>
                <dd className="text-sm text-muted-foreground">The sum of the width and height of your framed piece, used for pricing.</dd>
              </div>
              <div>
                <dt className="font-medium">Mat Board</dt>
                <dd className="text-sm text-muted-foreground">The paper-based border between artwork and frame that adds visual space.</dd>
              </div>
              <div>
                <dt className="font-medium">Conservation Framing</dt>
                <dd className="text-sm text-muted-foreground">Techniques that protect artwork from environmental damage and deterioration.</dd>
              </div>
              <div>
                <dt className="font-medium">Rabbet</dt>
                <dd className="text-sm text-muted-foreground">The groove in a frame where the glass, mat, artwork, and backing fit.</dd>
              </div>
              <div>
                <dt className="font-medium">Fillet</dt>
                <dd className="text-sm text-muted-foreground">A small decorative molding inside the main frame or between artwork and mat.</dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Framing FAQ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">How do I choose the right frame color?</h3>
                <p className="text-sm text-muted-foreground">Select a color from your artwork, match your decor, or choose a neutral that complements the artwork's tones.</p>
              </div>
              <div>
                <h3 className="font-medium">Is UV glass worth the extra cost?</h3>
                <p className="text-sm text-muted-foreground">Yes, especially for valuable artwork, photographs, or pieces displayed in bright areas where fading is a concern.</p>
              </div>
              <div>
                <h3 className="font-medium">Should I frame without a mat?</h3>
                <p className="text-sm text-muted-foreground">Mats provide visual space around artwork and prevent it from touching the glass. Frameless mounting works best for canvas and modern art.</p>
              </div>
              <div>
                <h3 className="font-medium">How often should I reframe artwork?</h3>
                <p className="text-sm text-muted-foreground">Every 10-15 years for valuable pieces, or when you notice yellowing, warping, or other signs of deterioration.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
