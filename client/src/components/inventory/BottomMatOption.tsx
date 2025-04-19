import React from 'react';
import { Layers } from 'lucide-react';
import './FrameDesigner.css';

interface MatOption {
  id: string;
  name: string;
  color: string;
  price: number;
  inStock: boolean;
}

interface BottomMatOptionProps {
  showBottomMat: boolean;
  bottomMatWidth: number;
  selectedBottomMat: MatOption | null;
  availableMats: MatOption[];
  onToggleBottomMat: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBottomMatWidthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBottomMatSelect: (mat: MatOption) => void;
}

const BottomMatOption: React.FC<BottomMatOptionProps> = ({
  showBottomMat,
  bottomMatWidth,
  selectedBottomMat,
  availableMats,
  onToggleBottomMat,
  onBottomMatWidthChange,
  onBottomMatSelect
}) => {
  return (
    <div className="mt-4 bottom-mat-section">
      <div className="bottom-mat-header">
        <input 
          type="checkbox" 
          id="showBottomMat" 
          checked={showBottomMat}
          onChange={onToggleBottomMat}
          className="mr-2"
        />
        <label htmlFor="showBottomMat" className="flex items-center cursor-pointer">
          <Layers className="h-4 w-4 mr-1" />
          <span className="font-bold">Add Bottom Mat</span>
        </label>
      </div>
      
      {showBottomMat && (
        <div className="mt-2">
          <div className="mb-2">
            <label htmlFor="bottomMatWidth">Bottom Mat Width (inches)</label>
            <input 
              type="number" 
              id="bottomMatWidth" 
              value={bottomMatWidth} 
              onChange={onBottomMatWidthChange} 
              step="0.125"
              min="0.125"
              max="0.5"
              className="input w-full"
            />
            <p className="text-xs mt-1 text-secondary">
              Recommended: between 0.125" and 0.5"
            </p>
          </div>
          
          <div>
            <label>Bottom Mat Color</label>
            <div className="mat-options mat-options-small mt-2">
              {availableMats.map(mat => (
                <div 
                  key={`bottom-${mat.id}`} 
                  className={`mat-option ${selectedBottomMat?.id === mat.id ? 'selected' : ''}`}
                  onClick={() => onBottomMatSelect(mat)}
                >
                  <div className="mat-color-preview" style={{ backgroundColor: mat.color }}></div>
                  <div>
                    <div>{mat.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomMatOption;