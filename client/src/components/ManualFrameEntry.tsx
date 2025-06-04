
import React from 'react';

interface ManualFrameEntryProps {
  useManualFrame: boolean;
  onToggleManualFrame: (enabled: boolean) => void;
  frameName: string;
  onFrameNameChange: (name: string) => void;
  frameCost: number;
  onFrameCostChange: (cost: number) => void;
}

const ManualFrameEntry: React.FC<ManualFrameEntryProps> = ({
  useManualFrame,
  onToggleManualFrame,
  frameName,
  onFrameNameChange,
  frameCost,
  onFrameCostChange
}) => {
  return (
    <div className="bg-white dark:bg-dark-cardBg rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold header-underline">Manual Frame Entry</h2>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="useManualFrame"
            checked={useManualFrame}
            onChange={(e) => onToggleManualFrame(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="useManualFrame" className="text-sm">Use Manual Frame</label>
        </div>
      </div>

      {useManualFrame && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
              Frame Name/Description
            </label>
            <input
              type="text"
              className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
              placeholder="Enter frame description"
              value={frameName}
              onChange={(e) => onFrameNameChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1">
              Frame Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg"
              placeholder="0.00"
              value={frameCost || ''}
              onChange={(e) => onFrameCostChange(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      {useManualFrame && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <strong>Note:</strong> Manual frame entry bypasses the catalog system. Ensure pricing and specifications are accurate.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManualFrameEntry;
