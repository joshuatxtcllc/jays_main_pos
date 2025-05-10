
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Square, 
  Circle, 
  Triangle, 
  Heart, 
  Star, 
  Layers, 
  Shield, 
  Sun, 
  Moon,
  ChevronRight, 
  ChevronLeft,
  ExternalLink
} from 'lucide-react';

interface EducationTopic {
  id: string;
  title: string;
  sections: {
    title: string;
    content: React.ReactNode;
    illustration?: React.ReactNode;
  }[];
}

export function FrameEducationGuide() {
  const [activeTopic, setActiveTopic] = useState('styles');
  const [activeSection, setActiveSection] = useState(0);
  
  const topics: EducationTopic[] = [
    {
      id: 'styles',
      title: 'Frame Styles',
      sections: [
        {
          title: 'Modern',
          content: (
            <div className="space-y-2">
              <p>Modern frames feature clean lines, minimalist designs, and often come in metal finishes or simple wood styles with neutral tones.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Perfect for contemporary artwork or photography</li>
                <li>Creates a sleek, unobtrusive presentation</li>
                <li>Popular choices include simple black, white, or metal profiles</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <Square className="text-primary h-24 w-24" strokeWidth={1} />
                <Square className="text-primary/30 h-28 w-28 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={1} />
              </div>
            </div>
          )
        },
        {
          title: 'Traditional',
          content: (
            <div className="space-y-2">
              <p>Traditional frames offer classic styling with ornate details, carved designs, and rich finishes like gold, silver, or dark wood tones.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Ideal for classic artwork, portraits, or oil paintings</li>
                <li>Adds a sense of elegance and formality</li>
                <li>Often features decorative corners and intricate patterns</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <Square className="text-primary h-24 w-24" strokeWidth={1} />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <Shield className="text-primary/30 h-16 w-16" />
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'Rustic',
          content: (
            <div className="space-y-2">
              <p>Rustic frames feature natural wood textures, distressed finishes, and a handcrafted appearance, celebrating the beauty of imperfection.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Great for nature photography, landscapes, or casual art</li>
                <li>Creates a warm, organic, and relaxed aesthetic</li>
                <li>Often showcases natural wood grain patterns</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <div className="border-4 border-primary/70 h-24 w-24 border-dashed rounded-sm"></div>
                <Triangle className="text-primary/30 h-16 w-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          )
        },
        {
          title: 'Floating',
          content: (
            <div className="space-y-2">
              <p>Floating frames create the illusion that artwork is suspended within the frame, with space between the art and frame edge.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Ideal for canvas art, contemporary pieces, or gallery displays</li>
                <li>Creates a three-dimensional, modern presentation</li>
                <li>Allows all edges of artwork to remain visible</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <Square className="text-primary/30 h-28 w-28" strokeWidth={1} />
                <Square className="text-primary h-20 w-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={2} />
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'materials',
      title: 'Frame Materials',
      sections: [
        {
          title: 'Wood',
          content: (
            <div className="space-y-2">
              <p>Wood frames are timeless classics that come in countless styles, finishes, and profiles to suit any decor or artwork.</p>
              <ul className="list-disc pl-5 text-sm">
                <li><strong>Hardwoods:</strong> Oak, maple, walnut (durable, refined grain patterns)</li>
                <li><strong>Softwoods:</strong> Pine, cedar (more economical, casual appearance)</li>
                <li><strong>Finishes:</strong> Natural, stained, painted, distressed, or gilded</li>
                <li>Provides warmth and a natural aesthetic</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <div className="h-24 w-24 bg-gradient-to-r from-amber-700 to-amber-500 rounded-sm"></div>
                <div className="absolute inset-0 opacity-30">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-full h-4 border-b border-amber-900/30"></div>
                  ))}
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'Metal',
          content: (
            <div className="space-y-2">
              <p>Metal frames offer a sleek, contemporary look with excellent durability and precise, clean lines.</p>
              <ul className="list-disc pl-5 text-sm">
                <li><strong>Aluminum:</strong> Lightweight, doesn't rust, available in many colors</li>
                <li><strong>Steel:</strong> Very strong, often with a powder-coated finish</li>
                <li><strong>Finishes:</strong> Matte, glossy, brushed, antiqued, or anodized</li>
                <li>Ideal for modern art, photography, and diplomas</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <div className="h-24 w-24 bg-gradient-to-r from-gray-400 to-gray-300 rounded-sm"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="w-[90%] h-[90%] border-2 border-gray-500"></div>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'Composite',
          content: (
            <div className="space-y-2">
              <p>Composite frames blend materials like polystyrene and resin to mimic the look of wood or metal at a more affordable price point.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Highly resistant to warping, moisture damage, and fading</li>
                <li>Available in a wide variety of styles and finishes</li>
                <li>Lighter weight than solid wood frames</li>
                <li>Good option for larger frames where weight is a concern</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <div className="h-24 w-24 bg-gradient-to-r from-neutral-300 to-stone-200 rounded-sm"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <Layers className="text-primary/30 h-14 w-14" />
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'Acrylic',
          content: (
            <div className="space-y-2">
              <p>Acrylic frames provide a modern, minimalist look with excellent durability and lightweight properties.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Shatter-resistant alternative to glass</li>
                <li>Available in clear, colored, or frosted finishes</li>
                <li>Creates an open, floating appearance</li>
                <li>Ideal for contemporary spaces and gallery walls</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <div className="h-24 w-24 border-2 border-primary/30 bg-primary/5 rounded-sm"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-sm"></div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'preservation',
      title: 'Preservation Benefits',
      sections: [
        {
          title: 'UV Protection',
          content: (
            <div className="space-y-2">
              <p>UV-protective glass and acrylic block harmful ultraviolet rays that cause artwork fading and deterioration.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Blocks 97-99% of UV rays, depending on the quality</li>
                <li>Prevents paper yellowing and ink fading</li>
                <li>Critical for valuable art, historical documents, and photographs</li>
                <li>Higher quality UV glass is virtually invisible to the viewer</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <Sun className="text-amber-500 h-20 w-20" />
                <div className="absolute inset-0 flex justify-center items-center">
                  <Shield className="text-primary/50 h-24 w-24" />
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'Acid-Free Materials',
          content: (
            <div className="space-y-2">
              <p>Acid-free mat boards and backing materials prevent chemical damage and discoloration of artwork over time.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Prevents "mat burn" - the brown line that forms where mat meets artwork</li>
                <li>Conservation-grade mats have neutral pH (6.5-7.5)</li>
                <li>Museum-grade mats are alkaline-buffered for extra protection</li>
                <li>Essential for preserving valuable art and photographs</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <div className="h-24 w-24 border-2 border-primary rounded-sm bg-white"></div>
                <div className="h-16 w-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neutral-100 border border-primary"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-800 font-bold text-xs">pH 7</div>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'Archival Mounting',
          content: (
            <div className="space-y-2">
              <p>Archival mounting techniques secure artwork without damaging it, using reversible methods that won't compromise value.</p>
              <ul className="list-disc pl-5 text-sm">
                <li><strong>Hinging:</strong> Attaching art with acid-free paper strips and wheat paste</li>
                <li><strong>Corners:</strong> Using archival photo corners that don't touch the artwork</li>
                <li><strong>Conservation Mounting:</strong> Methods that are completely reversible</li>
                <li>Prevents buckling, rippling, and movement within the frame</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <Square className="text-primary h-24 w-24" strokeWidth={1} />
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/70"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/70"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/70"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/70"></div>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'Climate Control',
          content: (
            <div className="space-y-2">
              <p>Proper framing creates a microenvironment that helps protect artwork from humidity fluctuations and airborne pollutants.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Sealed frames provide a barrier against dust and pollutants</li>
                <li>Spacers prevent artwork from touching glass (important to prevent mold)</li>
                <li>Backing boards with vapor barriers protect against humidity</li>
                <li>Museum-quality packages may include silica gel for humidity control</li>
              </ul>
            </div>
          ),
          illustration: (
            <div className="flex justify-center items-center h-full">
              <div className="relative">
                <div className="h-24 w-24 border-2 border-primary rounded-sm relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex space-x-1">
                      <Sun className="text-amber-400 h-8 w-8" />
                      <Moon className="text-blue-400 h-8 w-8" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-blue-100 to-transparent"></div>
                </div>
              </div>
            </div>
          )
        }
      ]
    }
  ];
  
  const currentTopic = topics.find(t => t.id === activeTopic) || topics[0];
  const currentSection = currentTopic.sections[activeSection];
  
  const handleNext = () => {
    if (activeSection < currentTopic.sections.length - 1) {
      setActiveSection(activeSection + 1);
    } else {
      // Move to next topic if available
      const currentTopicIndex = topics.findIndex(t => t.id === activeTopic);
      if (currentTopicIndex < topics.length - 1) {
        setActiveTopic(topics[currentTopicIndex + 1].id);
        setActiveSection(0);
      }
    }
  };
  
  const handlePrevious = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    } else {
      // Move to previous topic if available
      const currentTopicIndex = topics.findIndex(t => t.id === activeTopic);
      if (currentTopicIndex > 0) {
        setActiveTopic(topics[currentTopicIndex - 1].id);
        setActiveSection(topics[currentTopicIndex - 1].sections.length - 1);
      }
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Frame Education Guide</CardTitle>
        <CardDescription>
          Learn about different frame styles, materials, and preservation benefits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTopic} onValueChange={setActiveTopic} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            {topics.map(topic => (
              <TabsTrigger key={topic.id} value={topic.id} onClick={() => setActiveSection(0)}>
                {topic.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {topics.map(topic => (
            <TabsContent key={topic.id} value={topic.id} className="mt-0">
              <div className="border rounded-lg">
                <div className="bg-muted/50 p-3 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{currentSection.title}</h3>
                    <div className="text-sm text-muted-foreground">
                      {activeSection + 1} of {currentTopic.sections.length}
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      {currentSection.content}
                    </div>
                    <div className="flex justify-center md:border-l md:pl-6">
                      {currentSection.illustration}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={activeSection === 0 && topics.findIndex(t => t.id === activeTopic) === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={
                      activeSection === currentTopic.sections.length - 1 && 
                      topics.findIndex(t => t.id === activeTopic) === topics.length - 1
                    }
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="link" size="sm" className="text-sm text-muted-foreground">
          <ExternalLink className="h-3 w-3 mr-1" />
          Learn More About Framing
        </Button>
      </CardFooter>
    </Card>
  );
}
