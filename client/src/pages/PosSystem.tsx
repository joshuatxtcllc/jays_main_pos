import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { 
  Frame, 
  MatColor, 
  GlassOption, 
  SpecialService, 
  InsertOrder, 
  InsertCustomer 
} from '@shared/schema';
import { getMatColorById, getMatColorsByManufacturer, getMatColorsByCategory, getUniqueMatCategories } from '@/data/matColors';
import { glassOptionCatalog, getGlassOptionById, specialServicesCatalog } from '@/data/glassOptions';
import { fileToDataUrl, resizeImage, calculateAspectRatio, calculateDimensions } from '@/lib/imageUtils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import FrameVisualizer from '@/components/FrameVisualizer';
import SpecialServices from '@/components/SpecialServices';
import OrderSummary from '@/components/OrderSummary';
import MatboardCatalogViewer from '@/components/MatboardCatalogViewer';
import VendorFrameSearch from '@/components/VendorFrameSearch';
import { useMatboards } from '@/hooks/use-matboards';
import { useFrames } from '@/hooks/use-frames';
import { ArtworkSizeDetector } from '@/components/ArtworkSizeDetector';
import { ArtworkDimensions } from '@/lib/artworkSizeDetector';

const PosSystem = () => {
  const { toast } = useToast();
  
  // Customer Information
  const [customer, setCustomer] = useState<InsertCustomer>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Artwork Details
  const [artworkWidth, setArtworkWidth] = useState<number>(16);
  const [artworkHeight, setArtworkHeight] = useState<number>(20);
  const [artworkImage, setArtworkImage] = useState<string | null>(null);
  const [artworkDescription, setArtworkDescription] = useState<string>('');
  const [artworkType, setArtworkType] = useState<string>('print');
  const [aspectRatio, setAspectRatio] = useState<number>(0.8); // Default 4:5
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // Webcam states
  const [showWebcam, setShowWebcam] = useState<boolean>(false);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Frame Selection
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [materialFilter, setMaterialFilter] = useState<string>('all');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('all');
  const [widthFilter, setWidthFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [frameSearch, setFrameSearch] = useState<string>('');
  
  // Mat Options
  const { matboards, crescentMatboards, loading: matboardsLoading, getMatboardById } = useMatboards();
  // Initialize with null and update when matboards load
  const [selectedMatColor, setSelectedMatColor] = useState<MatColor | null>(null);
  
  // Update selectedMatColor when matboards loads
  useEffect(() => {
    if (matboards && matboards.length > 0 && !selectedMatColor) {
      setSelectedMatColor(matboards[0]);
    }
  }, [matboards, selectedMatColor]);
  const [matWidth, setMatWidth] = useState<number>(2);
  const [matManufacturerFilter, setMatManufacturerFilter] = useState<string>('all');
  
  // Glass Options - Set Museum glass as default (index 1)
  const [selectedGlassOption, setSelectedGlassOption] = useState<GlassOption>(glassOptionCatalog[1]);
  
  // Special Services
  const [selectedServices, setSelectedServices] = useState<SpecialService[]>([]);
  
  // Use the frames hook
  const { frames, loading: framesLoading, error: framesError } = useFrames();
  
  // Filtered Frames
  const filteredFrames = React.useMemo(() => {
    if (!frames) return [];
    
    return frames.filter(frame => {
      // Search filter
      if (frameSearch.trim() !== '') {
        const searchLower = frameSearch.trim().toLowerCase();
        
        // Get item number from frame.id (e.g., "larson-4512" -> "4512")
        const frameItemNumber = frame.id.split('-')[1] || '';
        
        // Prioritize exact item number match
        if (frameItemNumber === searchLower) {
          return true;
        }
        
        // Check if search matches any of the following:
        const idMatch = frame.id.toLowerCase().includes(searchLower);
        const itemNumberMatch = frameItemNumber.toLowerCase().includes(searchLower);
        const nameMatch = frame.name.toLowerCase().includes(searchLower);
        const manufacturerMatch = frame.manufacturer.toLowerCase().includes(searchLower);
        
        if (!(idMatch || itemNumberMatch || nameMatch || manufacturerMatch)) {
          return false;
        }
      }
      
      // Material filter
      if (materialFilter !== 'all' && frame.material !== materialFilter) {
        return false;
      }
      
      // Manufacturer filter
      if (manufacturerFilter !== 'all' && frame.manufacturer !== manufacturerFilter) {
        return false;
      }
      
      // Width filter
      if (widthFilter !== 'all') {
        const width = parseFloat(frame.width);
        switch(widthFilter) {
          case 'narrow':
            if (width >= 1.0) return false;
            break;
          case 'medium':
            if (width < 1.0 || width >= 2.0) return false;
            break;
          case 'wide':
            if (width < 2.0) return false;
            break;
        }
      }
      
      // Price filter
      if (priceFilter !== 'all') {
        const price = parseFloat(frame.price);
        switch(priceFilter) {
          case 'economy':
            if (price >= 15.0) return false;
            break;
          case 'standard':
            if (price < 15.0 || price >= 30.0) return false;
            break;
          case 'premium':
            if (price < 30.0) return false;
            break;
        }
      }
      
      return true;
    });
  }, [frames, materialFilter, manufacturerFilter, widthFilter, priceFilter, frameSearch]);
  
  // Manufacturers and Materials for filters
  const manufacturers = React.useMemo(() => {
    if (!frames) return [];
    const uniqueManufacturers = Array.from(new Set(frames.map(frame => frame.manufacturer)));
    return uniqueManufacturers;
  }, [frames]);
  
  const materials = React.useMemo(() => {
    if (!frames) return [];
    const uniqueMaterials = Array.from(new Set(frames.map(frame => frame.material)));
    return uniqueMaterials;
  }, [frames]);
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Processing image upload:', file.name, file.type, file.size);
      
      // Convert file to data URL
      const dataUrl = await fileToDataUrl(file);
      console.log('File converted to data URL, length:', dataUrl.length);
      
      // Resize image if it's too large
      const resizedImage = await resizeImage(dataUrl, 1200, 1200);
      console.log('Image resized, new data URL length:', resizedImage.length);
      
      // Create an image element to get dimensions
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded with dimensions:', img.width, 'x', img.height);
        const imgAspectRatio = img.width / img.height;
        setAspectRatio(imgAspectRatio);
        
        // Update width based on the height and aspect ratio
        const newWidth = parseFloat((artworkHeight * imgAspectRatio).toFixed(2));
        console.log('Setting artwork width to:', newWidth);
        setArtworkWidth(newWidth);
      };
      
      // IMPORTANT: We need to set the artworkImage state before setting the img.src
      // This ensures the state is updated immediately
      setArtworkImage(resizedImage);
      console.log('Setting artwork image in state');
      
      // Now set the image source for dimension calculation
      img.src = resizedImage;
      
      toast({
        title: "Image Uploaded",
        description: "Your artwork image has been uploaded and is ready for framing."
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error processing image",
        description: "There was a problem processing your image. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };
  
  // Handle button click for file input
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle webcam toggle
  const handleWebcamToggle = () => {
    if (showWebcam) {
      // Turn off webcam
      if (webcamRef.current && webcamRef.current.srcObject) {
        const stream = webcamRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        webcamRef.current.srcObject = null;
      }
      setShowWebcam(false);
    } else {
      // Turn on webcam
      setShowWebcam(true);
      startWebcam();
    }
  };
  
  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast({
        title: "Webcam Error",
        description: "Could not access the webcam. Please check your permissions and try again.",
        variant: "destructive"
      });
      setShowWebcam(false);
    }
  };
  
  // Capture image from webcam
  const captureImage = () => {
    if (webcamRef.current && canvasRef.current) {
      const video = webcamRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        // Process captured image
        processWebcamImage(dataUrl);
        
        // Turn off webcam
        handleWebcamToggle();
      }
    }
  };
  
  // Process webcam image
  const processWebcamImage = async (dataUrl: string) => {
    try {
      console.log('Processing webcam image, data URL length:', dataUrl.length);
      
      // Resize image if it's too large
      const resizedImage = await resizeImage(dataUrl, 1200, 1200);
      console.log('Webcam image resized, new data URL length:', resizedImage.length);
      
      // Create an image element to get dimensions
      const img = new Image();
      img.onload = () => {
        console.log('Webcam image loaded with dimensions:', img.width, 'x', img.height);
        const imgAspectRatio = img.width / img.height;
        setAspectRatio(imgAspectRatio);
        
        // Update width based on the height and aspect ratio
        const newWidth = parseFloat((artworkHeight * imgAspectRatio).toFixed(2));
        console.log('Setting artwork width to:', newWidth);
        setArtworkWidth(newWidth);
      };
      
      // IMPORTANT: Set the state before setting the img.src
      setArtworkImage(resizedImage);
      console.log('Setting artwork image from webcam in state');
      
      // Now set the image source for dimension calculation
      img.src = resizedImage;
      
      toast({
        title: "Image Captured",
        description: "Artwork image has been captured from webcam.",
      });
    } catch (error) {
      console.error('Error processing webcam image:', error);
      toast({
        title: "Error Processing Image",
        description: "There was a problem processing your webcam image. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle mat color selection
  const handleMatColorChange = (id: string) => {
    console.log('Changing mat color to ID:', id);
    const matColor = getMatboardById(id);
    
    if (matColor) {
      console.log('Found mat color:', matColor);
      setSelectedMatColor(matColor);
    } else {
      // Fallback to use static data
      console.log('Mat color not found in API data, trying static catalog...');
      const staticMatColor = getMatColorById(id);
      if (staticMatColor) {
        console.log('Found mat color in static catalog:', staticMatColor);
        setSelectedMatColor(staticMatColor);
      } else {
        console.error('Mat color not found in any catalog:', id);
      }
    }
  };
  
  // Handle mat width change
  const handleMatWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMatWidth(parseFloat(e.target.value));
  };
  
  // Handle glass option selection
  const handleGlassOptionChange = (id: string) => {
    const glassOption = getGlassOptionById(id);
    if (glassOption) {
      setSelectedGlassOption(glassOption);
    }
  };
  
  // Handle dimension changes
  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    if (value <= 0) return;
    
    if (dimension === 'width') {
      setArtworkWidth(value);
      setArtworkHeight(parseFloat((value / aspectRatio).toFixed(2)));
    } else {
      setArtworkHeight(value);
      setArtworkWidth(parseFloat((value * aspectRatio).toFixed(2)));
    }
  };
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the orders and order groups queries to refresh the cart
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/order-groups'] });
      
      toast({
        title: "Order Created",
        description: "The order has been successfully created and added to your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Order",
        description: error.message || "There was an error creating the order.",
        variant: "destructive"
      });
    }
  });
  
  // Create wholesale order mutation
  const createWholesaleOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest('POST', '/api/wholesale-orders', { orderId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Wholesale Order Created",
        description: "The wholesale order has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Wholesale Order",
        description: error.message || "There was an error creating the wholesale order.",
        variant: "destructive"
      });
    }
  });
  
  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: InsertCustomer) => {
      const response = await apiRequest('POST', '/api/customers', customerData);
      return response.json();
    }
  });
  
  // Handle create order
  const handleCreateOrder = async () => {
    console.log("Create Order button clicked");
    
    if (!selectedFrame || !selectedMatColor || !selectedGlassOption) {
      console.log("Missing required selections:", { 
        frame: selectedFrame ? "Selected" : "Missing", 
        matColor: selectedMatColor ? "Selected" : "Missing", 
        glassOption: selectedGlassOption ? "Selected" : "Missing" 
      });
      
      let missingItems = [];
      if (!selectedFrame) missingItems.push("frame");
      if (!selectedMatColor) missingItems.push("mat color");
      if (!selectedGlassOption) missingItems.push("glass option");
      
      toast({
        title: "Incomplete Order",
        description: `Please select a ${missingItems.join(", ")}.`,
        variant: "destructive"
      });
      return;
    }
    
    if (!customer.name) {
      console.log("Missing customer name");
      
      toast({
        title: "Customer Information Required",
        description: "Please enter customer name.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Customer data:", customer);
    
    try {
      console.log("Creating customer with data:", customer);
      
      // First create or get customer
      const customerResponse = await createCustomerMutation.mutateAsync(customer);
      console.log("Customer created/retrieved:", customerResponse);
      
      // Calculate prices for the order
      const framePrice = selectedFrame.price;
      const matPrice = selectedMatColor.price;
      const glassPrice = selectedGlassOption.price;
      
      // Prepare order data
      const orderData: InsertOrder = {
        customerId: customerResponse.id,
        frameId: selectedFrame.id,
        matColorId: selectedMatColor.id,
        glassOptionId: selectedGlassOption.id,
        artworkWidth: artworkWidth.toString(),
        artworkHeight: artworkHeight.toString(),
        matWidth: matWidth.toString(),
        artworkDescription,
        artworkType,
        subtotal: "0", // Will be calculated on the server
        tax: "0", // Will be calculated on the server
        total: "0", // Will be calculated on the server
        artworkImage
      };
      
      console.log("Creating order with data:", orderData);
      
      // Create the order
      const orderResponse = await createOrderMutation.mutateAsync(orderData);
      console.log("Order created successfully:", orderResponse);
      
      // Create special service relationships
      if (selectedServices.length > 0) {
        console.log("Adding special services:", selectedServices);
        
        await Promise.all(selectedServices.map(service => 
          apiRequest('POST', '/api/order-special-services', {
            orderId: orderResponse.id,
            specialServiceId: service.id
          })
        ));
      }
      
      toast({
        title: "Order Created Successfully",
        description: `Order #${orderResponse.id} has been created.`,
      });
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error Creating Order",
        description: "There was an error creating the order. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle save quote
  const handleSaveQuote = () => {
    toast({
      title: "Quote Saved",
      description: "The quote has been saved for future reference.",
    });
  };
  
  // Handle create wholesale order
  const handleCreateWholesaleOrder = async () => {
    if (!selectedFrame) {
      toast({
        title: "Frame Required",
        description: "Please select a frame to create a wholesale order.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // This should only run AFTER the actual order has been created
      // So we'll check if we have completed the actual order creation
      if (!customer.name) {
        toast({
          title: "Customer Information Required",
          description: "Please enter customer name and create the order first before adding to wholesale order.",
          variant: "destructive"
        });
        return;
      }
      
      // Create a real wholesale order
      const materialOrderData = {
        materialType: 'frame',
        materialId: selectedFrame.id,
        materialName: selectedFrame.name,
        quantity: Math.ceil((2 * (artworkWidth + artworkHeight) / 12) + 1).toString(), // Frame length in feet
        status: 'pending',
        notes: `Wholesale order for ${customer.name}`,
        vendor: selectedFrame.manufacturer,
        priority: 'normal'
      };
      
      const response = await apiRequest('POST', '/api/material-orders', materialOrderData);
      const wholesaleOrder = await response.json();
      
      toast({
        title: "Wholesale Order Created",
        description: `A wholesale order for ${selectedFrame.manufacturer} has been created.`,
      });
      
      // Also add wholesale orders for mat and glass if selected
      if (selectedMatColor) {
        const matOrderData = {
          materialType: 'mat',
          materialId: selectedMatColor.id,
          materialName: selectedMatColor.name,
          quantity: '1', // One sheet
          status: 'pending',
          notes: `Mat for ${customer.name}`,
          vendor: selectedMatColor.manufacturer || 'Crescent',
          priority: 'normal'
        };
        
        await apiRequest('POST', '/api/material-orders', matOrderData);
      }
      
      if (selectedGlassOption) {
        const glassOrderData = {
          materialType: 'glass',
          materialId: selectedGlassOption.id,
          materialName: selectedGlassOption.name,
          quantity: '1', // One piece
          status: 'pending',
          notes: `Glass for ${customer.name}`,
          vendor: 'TruVue',
          priority: 'normal'
        };
        
        await apiRequest('POST', '/api/material-orders', glassOrderData);
      }
      
    } catch (error) {
      console.error('Error creating wholesale order:', error);
      toast({
        title: "Error Creating Wholesale Order",
        description: "There was an error creating the wholesale order. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Reset form
  const resetForm = () => {
    setCustomer({
      name: '',
      email: '',
      phone: '',
      address: ''
    });
    setArtworkWidth(16);
    setArtworkHeight(20);
    setArtworkImage(null);
    setArtworkDescription('');
    setArtworkType('print');
    setAspectRatio(0.8);
    setSelectedFrame(null);
    setMaterialFilter('all');
    setManufacturerFilter('all');
    setWidthFilter('all');
    setPriceFilter('all');
    // Use first matboard from API or null if not available yet
    setSelectedMatColor(matboards && matboards.length > 0 ? matboards[0] : null);
    setMatWidth(2);
    setMatManufacturerFilter('all');
    setSelectedGlassOption(glassOptionCatalog[0]);
    setSelectedServices([]);
    
    // Turn off webcam if it's on
    if (showWebcam) {
      handleWebcamToggle();
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Frame Selection & Customization */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order Information Section */}
        <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 header-underline">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Customer Name
              </label>
              <input 
                type="text" 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg" 
                placeholder="Enter customer name"
                value={customer.name}
                onChange={(e) => setCustomer({...customer, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Order Date
              </label>
              <input 
                type="date" 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
                value={new Date().toISOString().split('T')[0]}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Phone
              </label>
              <input 
                type="tel" 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg" 
                placeholder="(555) 123-4567"
                value={customer.phone || ''}
                onChange={(e) => setCustomer({...customer, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Email
              </label>
              <input 
                type="email" 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg" 
                placeholder="customer@example.com"
                value={customer.email || ''}
                onChange={(e) => setCustomer({...customer, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Artwork Details Section */}
        <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 header-underline">Artwork Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Width (inches)
              </label>
              <input 
                type="number" 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg" 
                step="0.125"
                min="0.125"
                value={artworkWidth}
                onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Height (inches)
              </label>
              <input 
                type="number" 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg" 
                step="0.125"
                min="0.125"
                value={artworkHeight}
                onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Art Type
              </label>
              <select
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
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
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Description
              </label>
              <input 
                type="text" 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg" 
                placeholder="Enter artwork description"
                value={artworkDescription}
                onChange={(e) => setArtworkDescription(e.target.value)}
              />
            </div>
          </div>
          
          {/* Artwork Size Detector Component */}
          <div className="mb-4">
            <ArtworkSizeDetector 
              defaultWidth={artworkWidth}
              defaultHeight={artworkHeight}
              onDimensionsDetected={(dimensions, imageDataUrl) => {
                // Update dimensions in the parent component
                setArtworkWidth(dimensions.width);
                setArtworkHeight(dimensions.height);
                setAspectRatio(dimensions.width / dimensions.height);
                setArtworkImage(imageDataUrl);
                
                console.log('Dimensions detected:', dimensions);
                toast({
                  title: "Artwork Dimensions Detected",
                  description: `Width: ${dimensions.width}", Height: ${dimensions.height}"`,
                });
              }}
            />
          </div>
        </div>

        {/* Frame Customization Section */}
        <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold header-underline">Frame Selection</h2>
          </div>
          
          {/* Frame Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
              Search Frame by Item # or Name
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-2 pl-8 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
                placeholder="Enter frame item # (e.g. '4512') or name..."
                value={frameSearch}
                onChange={(e) => setFrameSearch(e.target.value)}
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 absolute left-2 top-3 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              {frameSearch && (
                <button
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setFrameSearch('')}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Vendor Catalog Search */}
          <div className="mb-4">
            <VendorFrameSearch onSelectFrame={setSelectedFrame} />
          </div>
          
          {/* Frame filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Material
              </label>
              <select 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
                value={materialFilter}
                onChange={(e) => setMaterialFilter(e.target.value)}
              >
                {materials.map(material => (
                  <option key={material} value={material}>
                    {material === 'all' ? 'All Materials' : material.charAt(0).toUpperCase() + material.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Manufacturer
              </label>
              <select 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
                value={manufacturerFilter}
                onChange={(e) => setManufacturerFilter(e.target.value)}
              >
                {manufacturers.map(manufacturer => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer === 'all' ? 'All Manufacturers' : manufacturer}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Width Range
              </label>
              <select 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
                value={widthFilter}
                onChange={(e) => setWidthFilter(e.target.value)}
              >
                <option value="all">All Widths</option>
                <option value="narrow">Narrow (0-1.5 in)</option>
                <option value="medium">Medium (1.5-2.5 in)</option>
                <option value="wide">Wide (2.5+ in)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Price Range
              </label>
              <select 
                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="all">All Prices</option>
                <option value="economy">Economy ($5-9/ft)</option>
                <option value="standard">Standard ($10-14/ft)</option>
                <option value="premium">Premium ($15+/ft)</option>
              </select>
            </div>
          </div>
          
          {/* Frame Catalog */}
          <div className="h-64 overflow-y-auto p-2 border border-light-border dark:border-dark-border rounded-lg mb-4">
            {framesLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
                <span className="ml-3 text-gray-500">Loading frames...</span>
              </div>
            ) : filteredFrames.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>No frames match your filter criteria.</p>
                <button 
                  className="mt-2 text-primary hover:underline"
                  onClick={() => {
                    setMaterialFilter('all');
                    setManufacturerFilter('all');
                    setWidthFilter('all');
                    setPriceFilter('all');
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredFrames.map(frame => (
                <div 
                  key={frame.id}
                  className={`cursor-pointer hover:scale-105 transform transition-transform duration-200 relative rounded overflow-hidden frame-option ${selectedFrame?.id === frame.id ? 'border-2 border-primary' : ''}`}
                  onClick={() => setSelectedFrame(frame)}
                >
                  <div 
                    className="w-full h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"
                    style={{
                      backgroundColor: frame.color || '#8B4513',
                      backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 2px, transparent 2px, transparent 8px)`
                    }}
                  >
                    <span className="text-white text-xs font-mono tracking-tight opacity-70">
                      {frame.manufacturer.split('-')[0]} #{frame.id.split('-')[1]}
                    </span>
                  </div>
                  <div className="bg-black/70 text-white text-xs p-1 absolute bottom-0 left-0 right-0">
                    <div className="font-medium truncate">{frame.name}</div>
                    <div className="flex justify-between">
                      <span>{frame.material}</span>
                      <span>${frame.price}/ft</span>
                    </div>
                  </div>
                  {selectedFrame?.id === frame.id && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              </div>
            )}
          </div>
          
          {/* Mat Options */}
          <h3 className="text-lg font-medium mb-3">Mat Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Mat Color
              </label>
              
              {/* Mat color filter tabs */}
              <div className="flex mb-2 border-b border-light-border dark:border-dark-border">
                <button 
                  className={`px-3 py-1 text-sm ${matManufacturerFilter === 'all' ? 'font-medium border-b-2 border-primary' : ''}`}
                  onClick={() => setMatManufacturerFilter('all')}
                >
                  All Matboards
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${matManufacturerFilter === 'Crescent' ? 'font-medium border-b-2 border-primary' : ''}`}
                  onClick={() => setMatManufacturerFilter('Crescent')}
                >
                  By Category
                </button>
              </div>
              
              {/* Category sections for Crescent matboards */}
              {matManufacturerFilter === 'Crescent' && (
                <div className="mb-2 max-h-40 overflow-y-auto pr-2">
                  {matboardsLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
                      <span className="ml-3 text-gray-500">Loading matboards...</span>
                    </div>
                  ) : (
                    <>
                      {getUniqueMatCategories().map(category => (
                        <div key={category} className="mb-2">
                          <h4 className="text-xs text-light-textSecondary dark:text-dark-textSecondary font-medium mb-1">{category}</h4>
                          <div className="grid grid-cols-5 gap-1">
                            {getMatColorsByCategory(category).map(matColor => (
                              <div
                                key={matColor.id}
                                className={`mat-color-option ${selectedMatColor && selectedMatColor.id === matColor.id ? 'border-2 border-primary' : 'border border-gray-400'} rounded-full h-6 w-6 cursor-pointer hover:scale-110 transition-transform overflow-hidden`}
                                onClick={() => handleMatColorChange(matColor.id)}
                                title={`${matColor.name} (${matColor.code})`}
                              >
                                <div 
                                  className="w-full h-full" 
                                  style={{ 
                                    backgroundColor: matColor.color || '#FFFFFF',
                                    border: '2px solid transparent'
                                  }}
                                ></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
              
              {/* Simple grid for All matboards view */}
              {matManufacturerFilter === 'all' && (
                <div className="grid grid-cols-4 gap-2">
                  {matboardsLoading ? (
                    <div className="flex justify-center items-center py-6 col-span-4">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
                      <span className="ml-3 text-gray-500">Loading matboards...</span>
                    </div>
                  ) : (
                    <>
                      {(matManufacturerFilter === 'all' ? matboards : crescentMatboards).map(matColor => (
                        <div
                          key={matColor.id}
                          className={`mat-color-option ${selectedMatColor && selectedMatColor.id === matColor.id ? 'border-2 border-primary' : 'border border-gray-400'} rounded-full h-8 w-8 cursor-pointer hover:scale-110 transition-transform overflow-hidden`}
                          onClick={() => handleMatColorChange(matColor.id)}
                          title={matColor.name}
                        >
                          <div 
                            className="w-full h-full" 
                            style={{ 
                              backgroundColor: matColor.color || '#FFFFFF',
                              border: '2px solid transparent'
                            }}
                          ></div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
              
              {/* Selected mat color details */}
              {selectedMatColor && (
                <div className="mt-4 text-sm">
                  <h3 className="font-medium mb-2">Selected Mat</h3>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-md inline-block border border-gray-300 shadow-sm" 
                      style={{ backgroundColor: selectedMatColor.color || '#FFFFFF' }}
                    ></div>
                    <div>
                      <p className="font-semibold text-base">
                        {selectedMatColor.name}
                        {selectedMatColor.code && <span className="ml-1 text-light-textSecondary dark:text-dark-textSecondary text-sm">({selectedMatColor.code})</span>}
                      </p>
                      {selectedMatColor.manufacturer && selectedMatColor.manufacturer !== 'Basic' && (
                        <p className="text-light-textSecondary dark:text-dark-textSecondary">{selectedMatColor.manufacturer}</p>
                      )}
                      {selectedMatColor.category && (
                        <p className="text-light-textSecondary dark:text-dark-textSecondary text-xs">{selectedMatColor.category}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Mat Width (inches)
              </label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="6" 
                  step="0.25" 
                  value={matWidth} 
                  onChange={handleMatWidthChange}
                  className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-2 min-w-[40px] text-center">{matWidth}"</span>
              </div>
            </div>
          </div>
          
          {/* Glass Options */}
          <h3 className="text-lg font-medium mb-3">Glass Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Using static glass options catalog for now, will be replaced with API data */}
            {glassOptionCatalog.map(glassOption => (
              <div 
                key={glassOption.id}
                className={`border ${selectedGlassOption.id === glassOption.id ? 'border-primary' : 'border-light-border dark:border-dark-border'} rounded-lg p-3 cursor-pointer hover:border-primary transition-colors bg-white dark:bg-dark-bg`}
                onClick={() => handleGlassOptionChange(glassOption.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{glassOption.name}</h4>
                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      {glassOption.description}
                    </p>
                  </div>
                  <div className={`flex h-5 w-5 ${selectedGlassOption.id === glassOption.id ? 'border border-primary' : 'border border-gray-300 dark:border-dark-border'} rounded-full items-center justify-center`}>
                    {selectedGlassOption.id === glassOption.id && (
                      <div className="h-3 w-3 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm text-right">
                  ${parseFloat(String(glassOption.price)) * 100}/sq ft
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Special Services Section */}
        <SpecialServices 
          selectedServices={selectedServices}
          onChange={setSelectedServices}
        />
      </div>
      
      {/* Right Column - Preview & Order Summary */}
      <div className="space-y-6">
        {/* Frame Preview */}
        <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 header-underline">Frame Preview</h2>
          
          {/* Preview Container */}
          <div className="border border-light-border dark:border-dark-border rounded-lg p-4 bg-gray-100 dark:bg-dark-bg/50 flex items-center justify-center">
            <FrameVisualizer
              frame={selectedFrame}
              matColor={selectedMatColor}
              matWidth={matWidth}
              artworkWidth={artworkWidth}
              artworkHeight={artworkHeight}
              artworkImage={artworkImage}
            />
          </div>
          
          {/* Frame Details */}
          {selectedFrame && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Selected Frame Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-light-textSecondary dark:text-dark-textSecondary">Name:</td>
                    <td className="py-1 font-medium">{selectedFrame.name}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-light-textSecondary dark:text-dark-textSecondary">Material:</td>
                    <td className="py-1">{selectedFrame.material}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-light-textSecondary dark:text-dark-textSecondary">Width:</td>
                    <td className="py-1">{selectedFrame.width} inches</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-light-textSecondary dark:text-dark-textSecondary">Depth:</td>
                    <td className="py-1">{selectedFrame.depth} inches</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-light-textSecondary dark:text-dark-textSecondary">Wholesale Price:</td>
                    <td className="py-1">${selectedFrame.price} per foot</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Price Summary */}
        <OrderSummary
          frame={selectedFrame}
          matColor={selectedMatColor}
          glassOption={selectedGlassOption}
          artworkWidth={artworkWidth}
          artworkHeight={artworkHeight}
          matWidth={matWidth}
          specialServices={selectedServices}
          onCreateOrder={handleCreateOrder}
          onSaveQuote={handleSaveQuote}
          onCreateWholesaleOrder={handleCreateWholesaleOrder}
        />
      </div>
    </div>
  );
};

export default PosSystem;
