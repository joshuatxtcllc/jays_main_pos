
import React from 'react';

interface MiscCharge {
  id: string;
  description: string;
  amount: number;
}

interface MiscellaneousChargesProps {
  charges: MiscCharge[];
  onChange: (charges: MiscCharge[]) => void;
}

const MiscellaneousCharges: React.FC<MiscellaneousChargesProps> = ({
  charges,
  onChange
}) => {
  const addCharge = () => {
    const newCharge: MiscCharge = {
      id: Date.now().toString(),
      description: '',
      amount: 0
    };
    onChange([...charges, newCharge]);
  };

  const updateCharge = (id: string, field: 'description' | 'amount', value: string | number) => {
    const updatedCharges = charges.map(charge =>
      charge.id === id ? { ...charge, [field]: value } : charge
    );
    onChange(updatedCharges);
  };

  const removeCharge = (id: string) => {
    onChange(charges.filter(charge => charge.id !== id));
  };

  const totalMiscCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);

  return (
    <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold header-underline">Miscellaneous Charges</h2>
        <button
          type="button"
          onClick={addCharge}
          className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Add Charge
        </button>
      </div>

      {charges.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>No miscellaneous charges added.</p>
          <p className="text-sm">Click "Add Charge" to include custom fees or add-ons.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {charges.map((charge) => (
            <div key={charge.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-light-border dark:border-dark-border rounded-md">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
                  placeholder="Enter description (e.g., Rush delivery, Custom hardware)"
                  value={charge.description}
                  onChange={(e) => updateCharge(charge.id, 'description', e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
                    placeholder="0.00"
                    value={charge.amount || ''}
                    onChange={(e) => updateCharge(charge.id, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeCharge(charge.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Remove charge"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 8.142A2 2 0 0116.138 17H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {charges.length > 0 && (
            <div className="border-t border-light-border dark:border-dark-border pt-3">
              <div className="flex justify-between font-medium">
                <span>Total Miscellaneous Charges:</span>
                <span>${totalMiscCharges.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MiscellaneousCharges;
