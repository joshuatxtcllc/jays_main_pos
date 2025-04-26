import { useState, useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function VendorSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    larsonApiKey: '',
    larsonApiSecret: '',
    romaApiKey: '',
    romaApiSecret: '',
    bellaApiKey: '',
    bellaApiSecret: '',
  });

  const [apiStatus, setApiStatus] = useState({
    larson: { connected: false, message: 'Not connected' },
    roma: { connected: false, message: 'Not connected' },
    bella: { connected: false, message: 'Not connected' },
  });

  const { toast } = useToast();

  useEffect(() => {
    // Fetch current API settings
    const fetchSettings = async () => {
      try {
        const response = await apiRequest('GET', '/api/vendor-api/settings');
        const data = await response.json();
        
        // Only update state with keys that exist in the response
        const newSettings = { ...settings };
        if (data.larsonApiKey) newSettings.larsonApiKey = data.larsonApiKey;
        if (data.larsonApiSecret) newSettings.larsonApiSecret = '••••••••'; // Don't expose actual secret
        if (data.romaApiKey) newSettings.romaApiKey = data.romaApiKey;
        if (data.romaApiSecret) newSettings.romaApiSecret = '••••••••';
        if (data.bellaApiKey) newSettings.bellaApiKey = data.bellaApiKey;
        if (data.bellaApiSecret) newSettings.bellaApiSecret = '••••••••';
        
        setSettings(newSettings);
        
        // Update connection status
        setApiStatus({
          larson: { 
            connected: !!data.larsonApiKey && data.larsonStatus === 'connected', 
            message: data.larsonStatus === 'connected' ? 'Connected' : 'Not connected' 
          },
          roma: { 
            connected: !!data.romaApiKey && data.romaStatus === 'connected', 
            message: data.romaStatus === 'connected' ? 'Connected' : 'Not connected' 
          },
          bella: { 
            connected: !!data.bellaApiKey && data.bellaStatus === 'connected', 
            message: data.bellaStatus === 'connected' ? 'Connected' : 'Not connected' 
          },
        });
      } catch (error) {
        console.error('Failed to fetch vendor API settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load vendor API settings',
          variant: 'destructive',
        });
      }
    };
    
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveSettings = async (vendor: 'larson' | 'roma' | 'bella') => {
    setIsLoading(true);
    
    try {
      const payload: Record<string, string> = {};
      
      switch (vendor) {
        case 'larson':
          payload.larsonApiKey = settings.larsonApiKey;
          if (settings.larsonApiSecret && settings.larsonApiSecret !== '••••••••') {
            payload.larsonApiSecret = settings.larsonApiSecret;
          }
          break;
        case 'roma':
          payload.romaApiKey = settings.romaApiKey;
          if (settings.romaApiSecret && settings.romaApiSecret !== '••••••••') {
            payload.romaApiSecret = settings.romaApiSecret;
          }
          break;
        case 'bella':
          payload.bellaApiKey = settings.bellaApiKey;
          if (settings.bellaApiSecret && settings.bellaApiSecret !== '••••••••') {
            payload.bellaApiSecret = settings.bellaApiSecret;
          }
          break;
      }
      
      const response = await apiRequest('POST', '/api/vendor-api/settings', payload);
      const result = await response.json();
      
      // Update connection status for the specific vendor
      setApiStatus(prev => ({
        ...prev,
        [vendor]: { 
          connected: result[`${vendor}Status`] === 'connected', 
          message: result[`${vendor}Status`] === 'connected' ? 'Connected' : 'Not connected' 
        }
      }));

      toast({
        title: 'Settings Saved',
        description: `${vendor.charAt(0).toUpperCase() + vendor.slice(1)} API settings updated successfully!`,
      });
      
      // Test the connection
      await testConnection(vendor);
    } catch (error) {
      console.error(`Failed to save ${vendor} API settings:`, error);
      toast({
        title: 'Error',
        description: `Failed to save ${vendor} API settings. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (vendor: 'larson' | 'roma' | 'bella') => {
    try {
      const response = await apiRequest('POST', `/api/vendor-api/test-connection/${vendor}`);
      const result = await response.json();
      
      setApiStatus(prev => ({
        ...prev,
        [vendor]: { 
          connected: result.success, 
          message: result.success ? 'Connected' : result.message || 'Connection failed' 
        }
      }));

      if (result.success) {
        toast({
          title: 'Connection Successful',
          description: `Connected to ${vendor.charAt(0).toUpperCase() + vendor.slice(1)} API successfully!`,
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: result.message || `Failed to connect to ${vendor.charAt(0).toUpperCase() + vendor.slice(1)} API.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(`Failed to test ${vendor} API connection:`, error);
      toast({
        title: 'Connection Error',
        description: `Failed to test ${vendor} API connection. Please check your settings.`,
        variant: 'destructive',
      });
      
      setApiStatus(prev => ({
        ...prev,
        [vendor]: { 
          connected: false, 
          message: 'Connection failed' 
        }
      }));
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Vendor API Settings</h1>
      <p className="text-gray-500 mb-8">
        Configure API connections to frame vendor catalogs to access complete product data and wholesale pricing.
      </p>
      
      <Tabs defaultValue="larson" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="larson">Larson-Juhl</TabsTrigger>
          <TabsTrigger value="roma">Roma Moulding</TabsTrigger>
          <TabsTrigger value="bella">Bella Moulding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="larson">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Larson-Juhl API Connection
                {apiStatus.larson.connected ? (
                  <Check className="ml-2 h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="ml-2 h-5 w-5 text-amber-500" />
                )}
              </CardTitle>
              <CardDescription>
                Connect to Larson-Juhl's API for real-time frame catalog data and pricing.
                Status: <span className={apiStatus.larson.connected ? "text-green-500" : "text-amber-500"}>
                  {apiStatus.larson.message}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="larsonApiKey">API Key</Label>
                <Input
                  id="larsonApiKey"
                  name="larsonApiKey"
                  placeholder="Enter your Larson-Juhl API key"
                  value={settings.larsonApiKey}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="larsonApiSecret">API Secret</Label>
                <Input
                  id="larsonApiSecret"
                  name="larsonApiSecret"
                  type="password"
                  placeholder="Enter your Larson-Juhl API secret"
                  value={settings.larsonApiSecret}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => testConnection('larson')} disabled={isLoading}>
                Test Connection
              </Button>
              <Button onClick={() => saveSettings('larson')} disabled={isLoading}>
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="roma">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Roma Moulding API Connection
                {apiStatus.roma.connected ? (
                  <Check className="ml-2 h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="ml-2 h-5 w-5 text-amber-500" />
                )}
              </CardTitle>
              <CardDescription>
                Connect to Roma Moulding's API for real-time frame catalog data and pricing.
                Status: <span className={apiStatus.roma.connected ? "text-green-500" : "text-amber-500"}>
                  {apiStatus.roma.message}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="romaApiKey">API Key</Label>
                <Input
                  id="romaApiKey"
                  name="romaApiKey"
                  placeholder="Enter your Roma Moulding API key"
                  value={settings.romaApiKey}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="romaApiSecret">API Secret</Label>
                <Input
                  id="romaApiSecret"
                  name="romaApiSecret"
                  type="password"
                  placeholder="Enter your Roma Moulding API secret"
                  value={settings.romaApiSecret}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => testConnection('roma')} disabled={isLoading}>
                Test Connection
              </Button>
              <Button onClick={() => saveSettings('roma')} disabled={isLoading}>
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="bella">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Bella Moulding API Connection
                {apiStatus.bella.connected ? (
                  <Check className="ml-2 h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="ml-2 h-5 w-5 text-amber-500" />
                )}
              </CardTitle>
              <CardDescription>
                Connect to Bella Moulding's API for real-time frame catalog data and pricing.
                Status: <span className={apiStatus.bella.connected ? "text-green-500" : "text-amber-500"}>
                  {apiStatus.bella.message}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bellaApiKey">API Key</Label>
                <Input
                  id="bellaApiKey"
                  name="bellaApiKey"
                  placeholder="Enter your Bella Moulding API key"
                  value={settings.bellaApiKey}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bellaApiSecret">API Secret</Label>
                <Input
                  id="bellaApiSecret"
                  name="bellaApiSecret"
                  type="password"
                  placeholder="Enter your Bella Moulding API secret"
                  value={settings.bellaApiSecret}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => testConnection('bella')} disabled={isLoading}>
                Test Connection
              </Button>
              <Button onClick={() => saveSettings('bella')} disabled={isLoading}>
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h2 className="text-xl font-semibold mb-4">Vendor API Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-md border border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Larson-Juhl</h3>
              <span className={`${apiStatus.larson.connected ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} px-2 py-1 rounded text-xs font-medium`}>
                {apiStatus.larson.connected ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{apiStatus.larson.message}</p>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Roma Moulding</h3>
              <span className={`${apiStatus.roma.connected ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} px-2 py-1 rounded text-xs font-medium`}>
                {apiStatus.roma.connected ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{apiStatus.roma.message}</p>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Bella Moulding</h3>
              <span className={`${apiStatus.bella.connected ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} px-2 py-1 rounded text-xs font-medium`}>
                {apiStatus.bella.connected ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{apiStatus.bella.message}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Note: To obtain API keys, please contact each vendor's account manager or visit their developer portal:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-500">
            <li><a href="https://www.larsonjuhl.com/api" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Larson-Juhl Developer Portal</a></li>
            <li><a href="https://www.romamoulding.com/api" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Roma Moulding Developer Portal</a></li>
            <li><a href="https://www.bellamoulding.com/api" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Bella Moulding Developer Portal</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}