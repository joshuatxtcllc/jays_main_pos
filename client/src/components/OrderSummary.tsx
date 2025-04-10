import React from 'react';
import { Frame, MatColor, GlassOption, SpecialService } from '@shared/schema';
import { 
  calculateFramePrice, 
  calculateMatPrice, 
  calculateGlassPrice, 
  calculateBackingPrice, 
  calculateLaborPrice, 
  calculateTotalPrice 
} from '@/lib/utils';

interface OrderSummaryProps {
  frame: Frame | null;
  matColor: MatColor | null;
  glassOption: GlassOption | null;
  artworkWidth: number;
  artworkHeight: number;
  matWidth: number;
  specialServices: SpecialService[];
  onCreateOrder: () => void;
  onSaveQuote: () => void;
  onCreateWholesaleOrder: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  frame,
  matColor,
  glassOption,
  artworkWidth,
  artworkHeight,
  matWidth,
  specialServices,
  onCreateOrder,
  onSaveQuote,
  onCreateWholesaleOrder
}) => {
  // Calculate prices
  const framePrice = frame ? calculateFramePrice(artworkWidth, artworkHeight, frame.price) : 0;
  const matPrice = matColor ? calculateMatPrice(artworkWidth, artworkHeight, matWidth, matColor.price) : 0;
  const glassPrice = glassOption ? calculateGlassPrice(artworkWidth, artworkHeight, matWidth, glassOption.price) : 0;
  const backingPrice = calculateBackingPrice(artworkWidth, artworkHeight, matWidth);
  const laborPrice = calculateLaborPrice(artworkWidth, artworkHeight);
  
  // Calculate special services price
  const specialServicesPrice = specialServices.reduce((total, service) => total + Number(service.price), 0);
  
  // Calculate total
  const { subtotal, tax, total } = calculateTotalPrice(
    framePrice,
    matPrice,
    glassPrice,
    backingPrice,
    laborPrice,
    specialServicesPrice
  );
  
  return (
    <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 header-underline">Order Summary</h2>
      <div className="space-y-3">
        {frame && (
          <div className="flex justify-between">
            <span className="text-light-textSecondary dark:text-dark-textSecondary">
              Frame ({frame.name})
            </span>
            <span>${framePrice.toFixed(2)}</span>
          </div>
        )}
        
        {matColor && (
          <div className="flex justify-between">
            <span className="text-light-textSecondary dark:text-dark-textSecondary">
              Mat ({matColor.name}, {matWidth}")
            </span>
            <span>${matPrice.toFixed(2)}</span>
          </div>
        )}
        
        {glassOption && (
          <div className="flex justify-between">
            <span className="text-light-textSecondary dark:text-dark-textSecondary">
              Glass ({glassOption.name})
            </span>
            <span>${glassPrice.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-light-textSecondary dark:text-dark-textSecondary">Backing</span>
          <span>${backingPrice.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-light-textSecondary dark:text-dark-textSecondary">Labor</span>
          <span>${laborPrice.toFixed(2)}</span>
        </div>
        
        {/* Special Services, shown only if selected */}
        {specialServices.length > 0 && (
          <div className="border-t border-light-border dark:border-dark-border pt-2">
            <div className="flex justify-between font-medium">
              <span>Special Services</span>
              <span>${specialServicesPrice.toFixed(2)}</span>
            </div>
            {specialServices.map(service => (
              <div key={service.id} className="flex justify-between text-sm text-light-textSecondary dark:text-dark-textSecondary">
                <span>{service.name}</span>
                <span>${Number(service.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="border-t border-light-border dark:border-dark-border pt-2">
          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-light-textSecondary dark:text-dark-textSecondary">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="border-t border-light-border dark:border-dark-border pt-2">
          <div className="flex justify-between text-lg font-semibold text-primary">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <button 
          className={`w-full py-3 ${!frame || !matColor || !glassOption ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} text-white rounded-lg font-medium transition-colors flex items-center justify-center`}
          onClick={() => {
            console.log('Create Order button clicked in OrderSummary');
            console.log('Button disabled state:', (!frame || !matColor || !glassOption));
            onCreateOrder();
          }}
          disabled={!frame || !matColor || !glassOption}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Create Order
        </button>
        
        <button 
          className="w-full py-3 border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-bg/80 transition-colors flex items-center justify-center"
          onClick={onSaveQuote}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Save as Quote
        </button>
      </div>
      
      {/* Wholesale Order Details */}
      {frame && (
        <div className="mt-6 border border-light-border dark:border-dark-border rounded-lg p-3 bg-gray-50 dark:bg-dark-bg/30">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Wholesale Order
          </h3>
          <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-2">
            This order will require these materials from your wholesalers:
          </p>
          <ul className="text-xs space-y-1">
            <li className="flex justify-between">
              <span>{frame.manufacturer} ({frame.id})</span>
              <span>{Math.ceil((2 * (artworkWidth + artworkHeight) / 12) + 1)} ft</span>
            </li>
            {glassOption && (
              <li className="flex justify-between">
                <span>{glassOption.name}</span>
                <span>{artworkWidth + 2 * matWidth}" × {artworkHeight + 2 * matWidth}"</span>
              </li>
            )}
            {matColor && (
              <li className="flex justify-between">
                <span>{matColor.name} Mat Board</span>
                <span>{artworkWidth + 2 * matWidth + 4}" × {artworkHeight + 2 * matWidth + 4}"</span>
              </li>
            )}
          </ul>
          <button 
            className="mt-2 w-full py-1.5 text-xs bg-secondary text-white rounded font-medium hover:bg-secondary/90 transition-colors"
            onClick={onCreateWholesaleOrder}
          >
            Create Wholesale Order
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
