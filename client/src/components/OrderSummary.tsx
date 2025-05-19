import React, { useState } from 'react';
import { Frame, MatColor, GlassOption, SpecialService } from '@shared/schema';
import { 
  calculateFramePrice, 
  calculateMatPrice, 
  calculateGlassPrice, 
  calculateBackingPrice, 
  calculateLaborPrice, 
  calculateTotalPrice,
  generateQrCode 
} from '@/lib/utils'; // Assumed generateQrCode function exists
import { Checkbox } from '@/components/ui/checkbox';
import QRCode from 'react-qr-code'; // Added import for QRCode


interface OrderSummaryProps {
  frames: {
    frame: Frame;
    position: number;
    distance: number;
  }[];
  mats: {
    matboard: MatColor;
    position: number;
    width: number;
    offset: number;
  }[];
  glassOption: GlassOption | null;
  artworkWidth: number;
  artworkHeight: number;
  artworkLocation?: string;
  orderId?: number;
  primaryMatWidth: number; // Added property for primary mat width
  specialServices: SpecialService[];
  onCreateOrder: () => void;
  onSaveQuote: () => void;
  onCreateWholesaleOrder: () => void;
  onProceedToCheckout?: (orderGroupId: number) => void;
  orderGroupId?: number;
  showCheckoutButton?: boolean;
  useMultipleMats?: boolean;
  useMultipleFrames?: boolean;
  addToWholesaleOrder?: boolean;
  setAddToWholesaleOrder?: (value: boolean) => void;
  orderId: number; // Added orderId prop for QR code generation
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  frames,
  mats,
  glassOption,
  artworkWidth,
  artworkHeight,
  primaryMatWidth,
  specialServices,
  onCreateOrder,
  onSaveQuote,
  onCreateWholesaleOrder,
  onProceedToCheckout,
  orderGroupId,
  showCheckoutButton = false,
  useMultipleMats = false,
  useMultipleFrames = false,
  addToWholesaleOrder = false,
  setAddToWholesaleOrder,
  orderId
}) => {
  // Local state for wholesale order checkbox if not provided through props
  const [localAddToWholesaleOrder, setLocalAddToWholesaleOrder] = useState(false);

  // Use either provided props or local state for wholesale order flag
  const effectiveAddToWholesaleOrder = typeof addToWholesaleOrder !== 'undefined' ? addToWholesaleOrder : localAddToWholesaleOrder;
  const effectiveSetAddToWholesaleOrder = (value: boolean) => {
    if (setAddToWholesaleOrder) {
      setAddToWholesaleOrder(value);
    } else {
      setLocalAddToWholesaleOrder(value);
    }
  };

  // Calculate prices for each frame
  const framePrices = frames.map(frameItem => 
    calculateFramePrice(Number(artworkWidth), Number(artworkHeight), Number(frameItem.frame.price))
  );
  const totalFramePrice = framePrices.reduce((total, price) => total + price, 0);

  // Calculate prices for each mat
  const matPrices = mats.map(matItem => 
    calculateMatPrice(Number(artworkWidth), Number(artworkHeight), Number(matItem.width), Number(matItem.matboard.price))
  );
  const totalMatPrice = matPrices.reduce((total, price) => total + price, 0);

  // Other price calculations
  const glassPrice = glassOption ? calculateGlassPrice(Number(artworkWidth), Number(artworkHeight), primaryMatWidth, Number(glassOption.price)) : 0;
  const backingPrice = calculateBackingPrice(Number(artworkWidth), Number(artworkHeight), primaryMatWidth);
  const laborPrice = calculateLaborPrice(Number(artworkWidth), Number(artworkHeight));

  // Calculate special services price
  const specialServicesPrice = specialServices.reduce((total, service) => total + Number(service.price), 0);

  // Calculate total
  const { subtotal, tax, total } = calculateTotalPrice(
    totalFramePrice,
    totalMatPrice,
    glassPrice,
    backingPrice,
    laborPrice,
    specialServicesPrice
  );

  // Generate QR code data
  const qrCodeData = generateQrCode(orderId); // Assumed generateQrCode function exists


  return (
    <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 header-underline">Order Summary</h2>
      <div className="space-y-3">
        {/* Frames */}
        {frames.length > 0 && (
          <div>
            <div className="flex justify-between font-medium">
              <span>Frames</span>
              <span>${totalFramePrice.toFixed(2)}</span>
            </div>
            {frames.map((frameItem, index) => (
              <div key={frameItem.frame.id + '-' + frameItem.position} className="flex justify-between text-sm text-light-textSecondary dark:text-dark-textSecondary pl-3">
                <span>
                  {frameItem.position === 1 ? 'Inner' : 'Outer'} ({frameItem.frame.name})
                </span>
                <span>${framePrices[index].toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Mats */}
        {mats.length > 0 && (
          <div>
            <div className="flex justify-between font-medium">
              <span>Mats</span>
              <span>${totalMatPrice.toFixed(2)}</span>
            </div>
            {mats.map((matItem, index) => (
              <div key={matItem.matboard.id + '-' + matItem.position} className="flex justify-between text-sm text-light-textSecondary dark:text-dark-textSecondary pl-3">
                <span>
                  {matItem.position === 1 ? 'Top' : matItem.position === 2 ? 'Middle' : 'Bottom'} ({matItem.matboard.name}, {matItem.width}")
                </span>
                <span>${matPrices[index].toFixed(2)}</span>
              </div>
            ))}
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

        {/* Add to Wholesale Order Checkbox */}
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="add-to-wholesale" 
            checked={effectiveAddToWholesaleOrder}
            onCheckedChange={(checked) => effectiveSetAddToWholesaleOrder(checked as boolean)}
          />
          <label 
            htmlFor="add-to-wholesale" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Add To Wholesale Order
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        {!showCheckoutButton ? (
          <>
            <button 
              className={`w-full py-3 ${frames.length === 0 || mats.length === 0 || !glassOption ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} text-white rounded-lg font-medium transition-colors flex items-center justify-center`}
              onClick={async () => {
                console.log('Create Order button clicked in OrderSummary');
                console.log('Button disabled state:', (frames.length === 0 || mats.length === 0 || !glassOption));
                console.log('Add to wholesale order:', effectiveAddToWholesaleOrder);

                // First create the actual customer order
                onCreateOrder();

                // Only create wholesale order if requested - this will now handle its own validation
                if (effectiveAddToWholesaleOrder) {
                  // Small delay to make sure the order creation completes first
                  setTimeout(() => {
                    onCreateWholesaleOrder();
                  }, 500);
                }
              }}
              disabled={frames.length === 0 || mats.length === 0 || !glassOption}
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
          </>
        ) : (
          <button 
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            onClick={() => {
              if (orderGroupId && onProceedToCheckout) {
                onProceedToCheckout(orderGroupId);
              }
            }}
            disabled={!orderGroupId}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Proceed to Checkout
          </button>
        )}
      </div>

      {/* Wholesale Order Details */}
      {frames.length > 0 && mats.length > 0 && (
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
            {/* Frame requirements */}
            {frames.map(frameItem => (
              <li key={frameItem.frame.id + '-' + frameItem.position} className="flex justify-between">
                <span>{frameItem.frame.manufacturer || 'Frame'} ({frameItem.frame.id})</span>
                <span>{Math.ceil((2 * (artworkWidth + artworkHeight) / 12) + 1)} ft</span>
              </li>
            ))}

            {/* Glass requirements */}
            {glassOption && (
              <li className="flex justify-between">
                <span>{glassOption.name}</span>
                <span>{artworkWidth + 2 * primaryMatWidth}" × {artworkHeight + 2 * primaryMatWidth}"</span>
              </li>
            )}

            {/* Mat requirements */}
            {mats.map(matItem => (
              <li key={matItem.matboard.id + '-' + matItem.position} className="flex justify-between">
                <span>{matItem.matboard.name} Mat Board</span>
                <span>
                  {artworkWidth + 2 * matItem.width + (matItem.position === 1 ? 4 : 0)}" × 
                  {artworkHeight + 2 * matItem.width + (matItem.position === 1 ? 4 : 0)}"
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center mt-2">
            <Checkbox
              id="wholesale-order-add" 
              checked={effectiveAddToWholesaleOrder}
              onCheckedChange={(checked) => effectiveSetAddToWholesaleOrder(checked as boolean)}
            />
            <label 
              htmlFor="wholesale-order-add" 
              className="text-xs ml-2"
            >
              Add to Wholesale Order
            </label>
          </div>
        </div>
      )}

      {qrCodeData && (
        <div className="mt-4">
          <QRCode value={qrCodeData} size={128} level="H" />
        </div>
      )}
    </div>
  );
};

export default OrderSummary;