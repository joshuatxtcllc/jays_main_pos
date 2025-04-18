import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  PlusCircle, 
  RefreshCw, 
  ShoppingCart, 
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import './FrameDesigner.css';

// Import catalog related hooks
import { useFramesForDesigner, useMatboardsForDesigner } from '@/hooks/use-frame-designer';

interface FrameOption {
  id: string;
  name: string;
  color: string;
  width: number;
  price: number;
  inStock: boolean;
}

interface MatOption {
  id: string;
  name: string;
  color: string;
  price: number;
  inStock: boolean;
}

// Use empty arrays as fallback until real data is loaded
const defaultFrameOptions: FrameOption[] = [];
const defaultMatOptions: MatOption[] = [];

interface FrameDesignerProps {
  onAddToCart?: (designData: {
    image: string | null;
    frame: FrameOption | null;
    mat: MatOption | null;
    dimensions: {
      width: number;
      height: number;
      matWidth: number;
    }
  }) => void;
  frameOptions?: FrameOption[];
  matOptions?: MatOption[];
  initialImage?: string;
  showAddToCart?: boolean;
}

const FrameDesigner: React.FC<FrameDesignerProps> = ({
  onAddToCart,
  frameOptions = defaultFrameOptions,
  matOptions = defaultMatOptions,
  initialImage,
  showAddToCart = true
}) => {
  // State for the uploaded image
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);
  
  // State for selected options
  const [selectedFrame, setSelectedFrame] = useState<FrameOption | null>(null);
  const [selectedMat, setSelectedMat] = useState<MatOption | null>(matOptions[0]);
  
  // State for dimensions
  const [artworkWidth, setArtworkWidth] = useState<number>(16);
  const [artworkHeight, setArtworkHeight] = useState<number>(20);
  const [matWidth, setMatWidth] = useState<number>(2);
  
  // Filter options to only show in-stock items
  const availableFrames = frameOptions.filter(frame => frame.inStock);
  const availableMats = matOptions.filter(mat => mat.inStock);
  
  // Calculate total dimensions
  const totalWidth = artworkWidth + (selectedMat ? matWidth * 2 : 0) + (selectedFrame ? selectedFrame.width * 2 : 0);
  const totalHeight = artworkHeight + (selectedMat ? matWidth * 2 : 0) + (selectedFrame ? selectedFrame.width * 2 : 0);
  
  // Calculate costs
  const framePrice = selectedFrame ? selectedFrame.price * ((artworkWidth + artworkHeight) / 12) : 0;
  const matPrice = selectedMat ? selectedMat.price * (artworkWidth * artworkHeight / 144) : 0;
  const totalPrice = framePrice + matPrice;
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle input changes
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 0) {
      setArtworkWidth(value);
    }
  };
  
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 0) {
      setArtworkHeight(value);
    }
  };
  
  const handleMatWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0) {
      setMatWidth(value);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (!uploadedImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image to continue",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedFrame) {
      toast({
        title: "No frame selected",
        description: "Please select a frame to continue",
        variant: "destructive"
      });
      return;
    }
    
    const designData = {
      image: uploadedImage,
      frame: selectedFrame,
      mat: selectedMat,
      dimensions: {
        width: artworkWidth,
        height: artworkHeight,
        matWidth: matWidth
      }
    };
    
    if (onAddToCart) {
      onAddToCart(designData);
    } else {
      toast({
        title: "Design saved",
        description: "Your custom frame design has been saved",
      });
    }
  };
  
  return (
    <div className="framing-tool-container">
      <div className="framing-tool-grid">
        {/* Upload Column */}
        <div className="framing-tool-column">
          <h3>Upload Artwork</h3>
          <div 
            className={`upload-area ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            {!uploadedImage ? (
              <div className="upload-placeholder">
                <Upload size={32} />
                <p>Drag and drop your artwork here or click to browse</p>
                <p className="text-xs">Supported formats: JPG, PNG, GIF</p>
              </div>
            ) : (
              <div className="uploaded-image-container">
                <img src={uploadedImage} alt="Uploaded artwork" className="uploaded-image" />
                <button className="change-image-btn btn-secondary btn-sm">Change Image</button>
              </div>
            )}
          </div>
          
          <div className="dimension-inputs">
            <div className="input-group">
              <label htmlFor="width">Width (inches)</label>
              <input 
                type="number" 
                id="width" 
                value={artworkWidth} 
                onChange={handleWidthChange} 
                step="0.125"
                min="0.125"
                className="input"
              />
            </div>
            <div className="input-group">
              <label htmlFor="height">Height (inches)</label>
              <input 
                type="number" 
                id="height" 
                value={artworkHeight} 
                onChange={handleHeightChange} 
                step="0.125"
                min="0.125"
                className="input"
              />
            </div>
          </div>
        </div>
        
        {/* Options Column */}
        <div className="framing-tool-column">
          <h3>Choose Options</h3>
          <div className="frame-option-group">
            <h4>Frame Style</h4>
            <div className="frame-options">
              {availableFrames.map(frame => (
                <div 
                  key={frame.id} 
                  className={`frame-option ${selectedFrame?.id === frame.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFrame(frame)}
                >
                  <div className="frame-color-preview" style={{ backgroundColor: frame.color }}></div>
                  <div>
                    <div>{frame.name}</div>
                    <div className="text-xs text-secondary">${frame.price.toFixed(2)}/ft</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="frame-option-group">
            <h4>Mat Options</h4>
            <div className="mat-options">
              {availableMats.map(mat => (
                <div 
                  key={mat.id} 
                  className={`mat-option ${selectedMat?.id === mat.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMat(mat)}
                >
                  <div className="mat-color-preview" style={{ backgroundColor: mat.color }}></div>
                  <div>
                    <div>{mat.name}</div>
                    <div className="text-xs text-secondary">${mat.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <label htmlFor="matWidth">Mat Width (inches)</label>
              <input 
                type="number" 
                id="matWidth" 
                value={matWidth} 
                onChange={handleMatWidthChange} 
                step="0.25"
                min="0"
                className="input w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Preview Column */}
        <div className="framing-tool-column preview-column">
          <h3>Frame Preview</h3>
          <div className="frame-preview">
            <div className="preview-container">
              <div className="preview-section">
                <div className="preview-header">Unframed</div>
                {uploadedImage ? (
                  <div className="unframed-image">
                    <img src={uploadedImage} alt="Unframed artwork" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <ImageIcon size={48} />
                    <p>Upload an image to see preview</p>
                  </div>
                )}
              </div>
              
              <div className="preview-section">
                <div className="preview-header">Framed</div>
                {uploadedImage && selectedFrame ? (
                  <div 
                    className="framed-image" 
                    style={{
                      borderWidth: `${selectedFrame.width / 3}rem`,
                      borderColor: selectedFrame.color,
                      padding: selectedMat ? `${matWidth / 3}rem` : '0',
                      backgroundColor: selectedMat ? selectedMat.color : 'transparent'
                    }}
                  >
                    <img src={uploadedImage} alt="Framed artwork" />
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <ArrowsExpand size={48} />
                    <p>Select a frame to see preview</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="summary-details">
              <div className="dimensions-summary">
                Finished size: {totalWidth.toFixed(2)}" × {totalHeight.toFixed(2)}"
              </div>
              <div className="price-summary">
                Total: ${totalPrice.toFixed(2)}
              </div>
            </div>
            
            {showAddToCart && (
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameDesigner;