import React, { useState } from 'react';
import { Layers } from 'lucide-react';

const MatOptionPage: React.FC = () => {
  const [showBottomMat, setShowBottomMat] = useState<boolean>(false);
  
  const handleToggleChange = () => {
    setShowBottomMat(!showBottomMat);
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>Mat Options Test Page</h1>
      
      <div style={{ 
        backgroundColor: '#f0f4ff', 
        padding: '20px', 
        borderRadius: '8px',
        border: '2px solid #3b82f6',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Bottom Mat Option</h2>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '6px',
          border: '1px solid #ddd'
        }}>
          <input 
            type="checkbox" 
            id="bottomMatToggle" 
            checked={showBottomMat}
            onChange={handleToggleChange}
            style={{ 
              width: '24px', 
              height: '24px', 
              marginRight: '12px',
              cursor: 'pointer'
            }}
          />
          <label 
            htmlFor="bottomMatToggle" 
            style={{ 
              fontWeight: 'bold', 
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Layers style={{ marginRight: '8px' }} />
            Add Bottom Mat (Double Matting)
          </label>
        </div>
        
        {showBottomMat && (
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'white', borderRadius: '6px' }}>
            <p>Bottom mat settings would appear here</p>
          </div>
        )}
      </div>
      
      <div>
        <p>Status: Bottom mat is {showBottomMat ? 'enabled' : 'disabled'}</p>
      </div>
    </div>
  );
};

export default MatOptionPage;