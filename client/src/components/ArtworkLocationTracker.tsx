import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ArtworkLocationTrackerProps {
  orderId: number;
  onSave?: () => void;
  className?: string;
}

export function ArtworkLocationTracker({ orderId, onSave, className }: ArtworkLocationTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [artworkLocation, setArtworkLocation] = useState('');
  const [savedLocation, setSavedLocation] = useState('');
  const [updateDate, setUpdateDate] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch existing location data
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}/location`);

        if (response.ok) {
          const data = await response.json();
          setArtworkLocation(data.location || '');
          setSavedLocation(data.location || '');
          setUpdateDate(data.updatedAt ? new Date(data.updatedAt).toLocaleString() : null);
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchLocationData();
    }
  }, [orderId]);

  // Save artwork location
  const saveArtworkLocation = async () => {
    if (!artworkLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a physical storage location for the artwork.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/orders/${orderId}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: artworkLocation }),
      });

      if (!response.ok) {
        throw new Error('Failed to save artwork location');
      }

      const data = await response.json();
      setSavedLocation(artworkLocation);
      setUpdateDate(new Date().toLocaleString());

      toast({
        title: "Location Saved",
        description: "Artwork location has been saved successfully."
      });

      if (onSave) {
        onSave();
      }

    } catch (error) {
      console.error('Error saving artwork location:', error);
      toast({
        title: "Error",
        description: "Failed to save location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Artwork Location Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="location">Physical Storage Location</Label>
            <Input
              id="location"
              placeholder="e.g., Shelf A3, Bin 42, Rack 7-B"
              value={artworkLocation}
              onChange={(e) => setArtworkLocation(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter the physical location where this artwork is stored
            </p>
          </div>

          {savedLocation && (
            <div className="bg-muted p-3 rounded-md mt-4">
              <h3 className="font-medium">Current Location Information</h3>
              <p><span className="font-medium">Location:</span> {savedLocation}</p>
              {updateDate && (
                <p><span className="font-medium">Last Updated:</span> {updateDate}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={saveArtworkLocation} 
          disabled={loading || !artworkLocation.trim()}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Artwork Location
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ArtworkLocationTracker;