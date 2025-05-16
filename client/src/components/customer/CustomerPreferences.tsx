
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Save, Edit, User, Bell } from 'lucide-react';

interface CustomerPreferences {
  id: number;
  customerId: number;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  specialInstructions: string;
  notes: string;
  preferredMatType: string;
  preferredGlassType: string;
  preferredPickupDay: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerPreferences({ customerId }: { customerId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [preferences, setPreferences] = useState<Partial<CustomerPreferences>>({});

  const { data: customerPreferences, isLoading } = useQuery<CustomerPreferences>({
    queryKey: [`/api/customers/${customerId}/preferences`],
    queryFn: () => {
      return apiRequest('GET', `/api/customers/${customerId}/preferences`)
        .then(res => res.json())
        .catch(error => {
          // If preferences don't exist yet, return default values
          if (error.status === 404) {
            return {
              customerId,
              notificationsEnabled: true,
              emailNotifications: true,
              smsNotifications: false,
              specialInstructions: '',
              notes: '',
              preferredMatType: '',
              preferredGlassType: '',
              preferredPickupDay: '',
            };
          }
          throw error;
        });
    },
    enabled: !!customerId,
  });

  // Update preferences when data is loaded
  React.useEffect(() => {
    if (customerPreferences) {
      setPreferences(customerPreferences);
    }
  }, [customerPreferences]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<CustomerPreferences>) => {
      const endpoint = `/api/customers/${customerId}/preferences`;
      const method = customerPreferences?.id ? 'PATCH' : 'POST';
      
      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}/preferences`] });
      setEditMode(false);
      toast({
        title: "Preferences saved",
        description: "Customer preferences have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving preferences",
        description: "There was a problem saving customer preferences",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setPreferences(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferencesMutation.mutate(preferences);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Preferences</CardTitle>
          <CardDescription>Loading customer preferences...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Customer Preferences</CardTitle>
          <CardDescription>
            Preferences and special notes for this customer
          </CardDescription>
        </div>
        {!editMode ? (
          <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Preferences
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notificationsEnabled" className="flex-1">
                      Enable notifications
                    </Label>
                    <Switch
                      id="notificationsEnabled"
                      checked={preferences.notificationsEnabled}
                      onCheckedChange={(checked) => handleSwitchChange('notificationsEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications" className="flex-1">
                      Email notifications
                    </Label>
                    <Switch
                      id="emailNotifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                      disabled={!preferences.notificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smsNotifications" className="flex-1">
                      SMS notifications
                    </Label>
                    <Switch
                      id="smsNotifications"
                      checked={preferences.smsNotifications}
                      onCheckedChange={(checked) => handleSwitchChange('smsNotifications', checked)}
                      disabled={!preferences.notificationsEnabled}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Special Instructions
                </h3>
                <Textarea
                  name="specialInstructions"
                  value={preferences.specialInstructions || ''}
                  onChange={handleInputChange}
                  placeholder="Add special framing instructions for this customer"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Internal Notes</h3>
                <Textarea
                  name="notes"
                  value={preferences.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Add internal notes about this customer (not visible to customer)"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updatePreferencesMutation.isPending}
              >
                {updatePreferencesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Notification Preferences
              </h3>
              <div className="rounded-md border p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Notifications:</div>
                  <div>{preferences.notificationsEnabled ? 'Enabled' : 'Disabled'}</div>
                  
                  <div className="text-muted-foreground">Email Notifications:</div>
                  <div>{preferences.emailNotifications ? 'Enabled' : 'Disabled'}</div>
                  
                  <div className="text-muted-foreground">SMS Notifications:</div>
                  <div>{preferences.smsNotifications ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Special Instructions</h3>
              <div className="rounded-md border p-3 min-h-[80px]">
                {preferences.specialInstructions ? (
                  <p className="text-sm">{preferences.specialInstructions}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No special instructions</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Internal Notes</h3>
              <div className="rounded-md border p-3 min-h-[80px]">
                {preferences.notes ? (
                  <p className="text-sm">{preferences.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No internal notes</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
