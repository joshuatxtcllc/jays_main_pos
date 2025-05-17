
import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';

interface CustomerPreferences {
  id?: number;
  customerId: number;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  specialInstructions: string;
  notes: string;
  preferredMatType: string;
  preferredGlassType: string;
  preferredPickupDay: string;
}

export default function CustomerPortalPreferences({ customerId }: { customerId: number }) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CustomerPreferences>({
    customerId,
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    specialInstructions: '',
    notes: '',
    preferredMatType: '',
    preferredGlassType: '',
    preferredPickupDay: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('customerAuthToken');
        
        if (!token) {
          throw new Error('Authentication token missing');
        }
        
        const response = await apiRequest(
          'GET', 
          `/api/customers/${customerId}/preferences`,
          null,
          { 
            headers: { 
              'Authorization': `Bearer ${token}` 
            } 
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setPreferences(data);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        // If no preferences exist yet, the default values set above will be used
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      fetchPreferences();
    }
  }, [customerId]);

  const handleChange = (field: keyof CustomerPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('customerAuthToken');
      
      if (!token) {
        throw new Error('Authentication token missing');
      }
      
      const method = preferences.id ? 'PATCH' : 'POST';
      const response = await apiRequest(
        method,
        `/api/customers/${customerId}/preferences`,
        preferences,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      const updatedPreferences = await response.json();
      setPreferences(updatedPreferences);

      toast({
        title: 'Preferences saved',
        description: 'Your preferences have been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error saving preferences',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Receive Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get updates about your order status
              </p>
            </div>
            <Switch 
              id="notifications"
              checked={preferences.notificationsEnabled}
              onCheckedChange={(checked) => handleChange('notificationsEnabled', checked)}
            />
          </div>
          
          {preferences.notificationsEnabled && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch 
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via text message
                  </p>
                </div>
                <Switch 
                  id="sms-notifications"
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) => handleChange('smsNotifications', checked)}
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Framing Preferences</h3>
        
        <div className="space-y-2">
          <Label htmlFor="preferred-mat">Preferred Mat Type</Label>
          <Select
            value={preferences.preferredMatType}
            onValueChange={(value) => handleChange('preferredMatType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select preferred mat type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No preference</SelectItem>
              <SelectItem value="cotton">Cotton (Acid-Free)</SelectItem>
              <SelectItem value="conservation">Conservation</SelectItem>
              <SelectItem value="museum">Museum</SelectItem>
              <SelectItem value="fabric">Fabric</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="preferred-glass">Preferred Glass Type</Label>
          <Select
            value={preferences.preferredGlassType}
            onValueChange={(value) => handleChange('preferredGlassType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select preferred glass type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No preference</SelectItem>
              <SelectItem value="regular">Regular Glass</SelectItem>
              <SelectItem value="non-glare">Non-Glare Glass</SelectItem>
              <SelectItem value="conservation">Conservation Glass</SelectItem>
              <SelectItem value="museum">Museum Glass</SelectItem>
              <SelectItem value="acrylic">Acrylic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="preferred-pickup">Preferred Pickup Day</Label>
          <Select
            value={preferences.preferredPickupDay}
            onValueChange={(value) => handleChange('preferredPickupDay', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select preferred pickup day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No preference</SelectItem>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="tuesday">Tuesday</SelectItem>
              <SelectItem value="wednesday">Wednesday</SelectItem>
              <SelectItem value="thursday">Thursday</SelectItem>
              <SelectItem value="friday">Friday</SelectItem>
              <SelectItem value="saturday">Saturday</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Special Instructions</h3>
        <Textarea
          value={preferences.specialInstructions}
          onChange={(e) => handleChange('specialInstructions', e.target.value)}
          placeholder="Any special requirements for your framing orders"
          className="min-h-[100px]"
        />
      </div>
      
      <Button 
        onClick={savePreferences} 
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </>
        )}
      </Button>
    </div>
  );
}
