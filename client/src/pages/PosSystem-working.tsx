import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import OrderSummary from '@/components/OrderSummary';
import ManualFrameEntry from '@/components/ManualFrameEntry';
import SpecialServices from '@/components/SpecialServices';
import MiscellaneousCharges from '@/components/MiscellaneousCharges';
import { Frame, MatColor, InsertOrder, InsertCustomer } from '@shared/schema';

// Simple glass options for the catalog
const glassOptions = [
  {
    id: 'regular-glass',
    name: 'Regular Glass',
    description: 'Standard clear glass for basic protection',
    price: '0.45'
  },
  {
    id: 'uv-protection-glass',
    name: 'UV Protection Glass',
    description: 'Blocks 99% of harmful UV rays to prevent fading',
    price: '1.25'
  },
  {
    id: 'museum-glass',
    name: 'Museum Glass',
    description: 'Ultimate clarity with maximum UV protection',
    price: '2.85'
  }
];

const PosSystem = () => {
  // Customer info state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Artwork dimensions state
  const [artworkWidth, setArtworkWidth] = useState(16);
  const [artworkHeight, setArtworkHeight] = useState(20);
  const [artworkType, setArtworkType] = useState('print');
  const [artworkDescription, setArtworkDescription] = useState('');
  const [artworkLocation, setArtworkLocation] = useState('');

  // Frame selection state
  const [selectedFrames, setSelectedFrames] = useState<any[]>([]);
  const [frameSearch, setFrameSearch] = useState('');

  // Mat selection state
  const [selectedMatboards, setSelectedMatboards] = useState<any[]>([]);
  const [useMultipleMats, setUseMultipleMats] = useState(false);
  const [activeMatPosition, setActiveMatPosition] = useState(1);
  const [primaryMatWidth, setPrimaryMatWidth] = useState(2);

  // Glass and services state
  const [selectedGlassOption, setSelectedGlassOption] = useState(glassOptions[0]);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [miscCharges, setMiscCharges] = useState<any[]>([]);

  // Manual frame entry state
  const [useManualFrame, setUseManualFrame] = useState(false);
  const [manualFrameName, setManualFrameName] = useState('');
  const [manualFrameCost, setManualFrameCost] = useState(0);

  // Order management state
  const [addToWholesaleOrder, setAddToWholesaleOrder] = useState(false);

  // Fetch frames data
  const { data: frames = [], isLoading: framesLoading } = useQuery<Frame[]>({
    queryKey: ['/api/frames'],
  });

  // Fetch mat colors data
  const { data: matboards = [], isLoading: matboardsLoading } = useQuery<MatColor[]>({
    queryKey: ['/api/mat-colors'],
  });

  // Filter frames based on search
  const filteredFrames = frames.filter(frame => 
    !frameSearch || frame.name?.toLowerCase().includes(frameSearch.toLowerCase()) ||
    frame.material?.toLowerCase().includes(frameSearch.toLowerCase()) ||
    frame.manufacturer?.toLowerCase().includes(frameSearch.toLowerCase())
  );

  // Handle frame selection
  const handleSelectFrame = (frame: Frame) => {
    setSelectedFrames(prev => {
      const existing = prev.find(f => f.frame.id === frame.id);
      if (existing) {
        return prev.filter(f => f.frame.id !== frame.id);
      }
      
      return [...prev, {
        frame,
        position: 1,
        pricingMethod: 'chop',
        distance: 0
      }];
    });
  };

  // Handle mat selection
  const handleMatSelect = (matboard: MatColor) => {
    setSelectedMatboards(prev => {
      const existing = prev.find(m => m.matboard.id === matboard.id);
      if (existing) {
        return prev.filter(m => m.matboard.id !== matboard.id);
      }
      
      return [...prev, {
        matboard,
        position: activeMatPosition,
        width: primaryMatWidth,
        offset: 0
      }];
    });
  };

  // Handle glass option change
  const handleGlassOptionChange = (glassId: string) => {
    const glass = glassOptions.find(g => g.id === glassId);
    if (glass) {
      setSelectedGlassOption(glass);
    }
  };

  // Calculate size surcharge
  const getSizeSurcharge = () => {
    const area = artworkWidth * artworkHeight;
    if (area > 500) return 50;
    if (area > 300) return 25;
    return 0;
  };

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('Failed to create order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Created",
        description: "Order has been successfully created.",
      });
    },
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: InsertCustomer) => {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) throw new Error('Failed to create customer');
      return response.json();
    },
  });

  // Handle create order
  const handleCreateOrder = async () => {
    if (!customerName) {
      toast({
        title: "Customer Required",
        description: "Please enter customer information.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create customer first
      const customer = await createCustomerMutation.mutateAsync({
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      });

      // Create order
      const orderData = {
        customerId: customer.id,
        artworkWidth: artworkWidth.toString(),
        artworkHeight: artworkHeight.toString(),
        artworkType,
        artworkDescription,
        artworkLocation,
        frames: selectedFrames,
        mats: selectedMatboards,
        glassOption: selectedGlassOption.id,
        specialServices: selectedServices,
        miscCharges,
        subtotal: '0',
        tax: '0',
        total: '0',
        status: 'pending',
        useManualFrame,
        manualFrameName: useManualFrame ? manualFrameName : undefined,
        manualFrameCost: useManualFrame ? manualFrameCost.toString() : undefined,
      };

      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle save quote
  const handleSaveQuote = () => {
    toast({
      title: "Quote Saved",
      description: "Quote has been saved for later.",
    });
  };

  // Handle create wholesale order
  const handleCreateWholesaleOrder = () => {
    toast({
      title: "Wholesale Order Created",
      description: "Wholesale order has been created.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Jays Frames - Custom Framing POS</h1>
      
      {/* Top Section - Customer Info and Artwork Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 header-underline">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Customer Name *
              </label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800" 
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Phone Number
              </label>
              <input 
                type="tel" 
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800" 
                placeholder="Enter phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Email Address
              </label>
              <input 
                type="email" 
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800" 
                placeholder="Enter email address"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Artwork Dimensions */}
        <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 header-underline">Artwork Dimensions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Width (inches)
              </label>
              <input 
                type="number" 
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800" 
                value={artworkWidth}
                onChange={(e) => setArtworkWidth(parseFloat(e.target.value) || 0)}
                min="1"
                step="0.25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Height (inches)
              </label>
              <input 
                type="number" 
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800" 
                value={artworkHeight}
                onChange={(e) => setArtworkHeight(parseFloat(e.target.value) || 0)}
                min="1"
                step="0.25"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Frame Preview Section */}
      <div className="mb-6">
        <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 header-underline">Frame Preview</h2>
          <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Frame Preview Area - {artworkWidth}" x {artworkHeight}"
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {selectedFrames.length} frame(s) selected, {selectedMatboards.length} mat(s) selected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Frame Selection */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 header-underline">Frame Selection</h2>
            
            {/* Frame Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search frames..."
                value={frameSearch}
                onChange={(e) => setFrameSearch(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Frame Grid */}
            <div className="h-64 overflow-y-auto p-2 border border-light-border dark:border-dark-border rounded-lg mb-4">
              {framesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  <span className="ml-3 text-gray-500">Loading frames...</span>
                </div>
              ) : filteredFrames.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>No frames found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredFrames.map(frame => (
                    <div 
                      key={frame.id}
                      className={`cursor-pointer hover:scale-105 transform transition-transform duration-200 relative rounded overflow-hidden ${selectedFrames.some(f => f.frame.id === frame.id) ? 'border-2 border-primary' : 'border border-gray-300'}`}
                      onClick={() => handleSelectFrame(frame)}
                    >
                      <div 
                        className="w-full h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"
                        style={{
                          backgroundColor: frame.color || '#8B4513',
                        }}
                      >
                        <span className="text-white text-xs font-mono tracking-tight opacity-70">
                          {frame.manufacturer?.split('-')[0]} #{frame.id?.split('-')[1]}
                        </span>
                      </div>
                      <div className="bg-black/70 text-white text-xs p-1 absolute bottom-0 left-0 right-0">
                        <div className="font-medium truncate">{frame.name}</div>
                        <div className="flex justify-between">
                          <span>{frame.material}</span>
                          <span>${frame.price}/ft</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Column - Mat Selection */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 header-underline">Mat Selection</h2>
            
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useMultipleMats}
                  onChange={(e) => setUseMultipleMats(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Use Multiple Mats</span>
              </label>
            </div>

            {/* Mat Grid */}
            <div className="h-64 overflow-y-auto p-2 border border-light-border dark:border-dark-border rounded-lg">
              {matboardsLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  <span className="ml-3 text-gray-500">Loading mats...</span>
                </div>
              ) : (
                <div className="grid grid-cols-8 gap-2">
                  {matboards.map(matboard => (
                    <div
                      key={matboard.id}
                      className={`cursor-pointer hover:scale-110 transform transition-transform duration-200 relative ${
                        selectedMatboards.some(m => m.matboard.id === matboard.id) 
                          ? 'ring-2 ring-primary ring-offset-1' 
                          : ''
                      }`}
                      onClick={() => handleMatSelect(matboard)}
                      title={`${matboard.name} - ${matboard.manufacturer}`}
                    >
                      <div
                        className="w-8 h-8 rounded-md border border-gray-300 shadow-sm"
                        style={{ backgroundColor: matboard.color || '#FFFFFF' }}
                      ></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Glass, Manual Frame, Services */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 header-underline">Glass Options</h2>
            <div className="grid grid-cols-1 gap-4">
              {glassOptions.map(glassOption => (
                <div 
                  key={glassOption.id}
                  className={`border ${selectedGlassOption.id === glassOption.id ? 'border-primary' : 'border-gray-300'} rounded-lg p-3 cursor-pointer hover:border-primary transition-colors`}
                  onClick={() => handleGlassOptionChange(glassOption.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{glassOption.name}</h4>
                      <p className="text-sm text-gray-600">
                        {glassOption.description}
                      </p>
                    </div>
                    <div className={`flex h-5 w-5 ${selectedGlassOption.id === glassOption.id ? 'border border-primary' : 'border border-gray-300'} rounded-full items-center justify-center`}>
                      {selectedGlassOption.id === glassOption.id && (
                        <div className="h-3 w-3 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-right">
                    ${parseFloat(glassOption.price) * 100}/sq ft
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ManualFrameEntry
            useManualFrame={useManualFrame}
            onToggleManualFrame={setUseManualFrame}
            frameName={manualFrameName}
            onFrameNameChange={setManualFrameName}
            frameCost={manualFrameCost}
            onFrameCostChange={setManualFrameCost}
          />

          <SpecialServices 
            selectedServices={selectedServices}
            onChange={setSelectedServices}
          />

          <MiscellaneousCharges
            charges={miscCharges}
            onChange={setMiscCharges}
          />
        </div>
      </div>

      {/* Bottom Section - Artwork Details */}
      <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 header-underline">Artwork Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Art Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
              value={artworkType}
              onChange={(e) => setArtworkType(e.target.value)}
            >
              <option value="print">Print</option>
              <option value="original">Original Artwork</option>
              <option value="photo">Photograph</option>
              <option value="document">Certificate/Document</option>
              <option value="poster">Poster</option>
              <option value="memorabilia">Memorabilia</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Description
            </label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800" 
              placeholder="Enter artwork description"
              value={artworkDescription}
              onChange={(e) => setArtworkDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Physical Storage Location
            </label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800" 
              placeholder="Enter physical storage location at shop"
              value={artworkLocation}
              onChange={(e) => setArtworkLocation(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
        <OrderSummary
          frames={selectedFrames}
          mats={selectedMatboards}
          glassOption={selectedGlassOption}
          artworkWidth={artworkWidth}
          artworkHeight={artworkHeight}
          artworkLocation={artworkLocation}
          primaryMatWidth={primaryMatWidth}
          specialServices={selectedServices}
          onCreateOrder={handleCreateOrder}
          onSaveQuote={handleSaveQuote}
          onCreateWholesaleOrder={handleCreateWholesaleOrder}
          useMultipleMats={useMultipleMats}
          useMultipleFrames={false}
          addToWholesaleOrder={addToWholesaleOrder}
          setAddToWholesaleOrder={setAddToWholesaleOrder}
          orderId={1}
          sizeSurcharge={getSizeSurcharge()}
          useManualFrame={useManualFrame}
          manualFrameName={manualFrameName}
          manualFrameCost={manualFrameCost}
          miscCharges={miscCharges}
        />
      </div>
    </div>
  );
};

export default PosSystem;