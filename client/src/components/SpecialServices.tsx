import React from 'react';
import { SpecialService } from '@shared/schema';
import { specialServicesCatalog } from '@/data/glassOptions';

interface SpecialServicesProps {
  selectedServices: SpecialService[];
  onChange: (services: SpecialService[]) => void;
}

const SpecialServices: React.FC<SpecialServicesProps> = ({
  selectedServices,
  onChange
}) => {
  // Handler for checkbox services (float mount, glass float, shadowbox)
  const handleCheckboxChange = (serviceId: string) => {
    const service = specialServicesCatalog.find(s => s.id === serviceId);
    
    if (!service) return;
    
    const isSelected = selectedServices.some(s => s.id === serviceId);
    
    if (isSelected) {
      // Remove service
      onChange(selectedServices.filter(s => s.id !== serviceId));
    } else {
      // Add service
      onChange([...selectedServices, service]);
    }
  };
  
  // Handler for labor dropdown
  const handleLaborChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    // Remove any existing labor services
    const servicesWithoutLabor = selectedServices.filter(
      s => s.id !== 'labor-30min' && s.id !== 'labor-1hour'
    );
    
    if (value === '0') {
      // No labor selected
      onChange(servicesWithoutLabor);
    } else {
      // Add the selected labor service
      const laborService = specialServicesCatalog.find(s => s.id === value);
      if (laborService) {
        onChange([...servicesWithoutLabor, laborService]);
      }
    }
  };
  
  // Get current labor value
  const laborValue = selectedServices.find(
    s => s.id === 'labor-30min' || s.id === 'labor-1hour'
  )?.id || '0';
  
  return (
    <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 header-underline">Special Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="border border-light-border dark:border-dark-border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleCheckboxChange('float-mount')}
        >
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium">Float Mount</h4>
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Artwork appears to float</p>
            </div>
            <div>
              <input 
                type="checkbox" 
                id="float-mount" 
                className="h-4 w-4 text-primary border-gray-300 rounded"
                checked={selectedServices.some(s => s.id === 'float-mount')}
                onChange={() => handleCheckboxChange('float-mount')}
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-light-textSecondary dark:text-dark-textSecondary">+$35.00</div>
        </div>
        
        <div 
          className="border border-light-border dark:border-dark-border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleCheckboxChange('glass-float')}
        >
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium">Glass Float</h4>
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Suspended between glass</p>
            </div>
            <div>
              <input 
                type="checkbox" 
                id="glass-float" 
                className="h-4 w-4 text-primary border-gray-300 rounded"
                checked={selectedServices.some(s => s.id === 'glass-float')}
                onChange={() => handleCheckboxChange('glass-float')}
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-light-textSecondary dark:text-dark-textSecondary">+$55.00</div>
        </div>
        
        <div 
          className="border border-light-border dark:border-dark-border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleCheckboxChange('shadowbox')}
        >
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium">Shadowbox</h4>
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">For 3D objects</p>
            </div>
            <div>
              <input 
                type="checkbox" 
                id="shadowbox" 
                className="h-4 w-4 text-primary border-gray-300 rounded"
                checked={selectedServices.some(s => s.id === 'shadowbox')}
                onChange={() => handleCheckboxChange('shadowbox')}
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-light-textSecondary dark:text-dark-textSecondary">+$65.00</div>
        </div>
        
        <div className="border border-light-border dark:border-dark-border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors">
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium">Additional Labor</h4>
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Custom work</p>
            </div>
            <div>
              <select 
                className="text-sm border border-light-border dark:border-dark-border rounded bg-light-bg dark:bg-dark-bg p-1"
                value={laborValue}
                onChange={handleLaborChange}
              >
                <option value="0">None</option>
                <option value="labor-30min">30 min (+$30)</option>
                <option value="labor-1hour">1 hour (+$55)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialServices;
