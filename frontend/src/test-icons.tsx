import React from 'react';
import { 
  XMarkIcon, 
  TrashIcon,
  PencilIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export const TestIcons = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white' }}>
      <h2>Testing Heroicons v2</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div>
          <p>ArrowPathIcon (works):</p>
          <ArrowPathIcon className="h-6 w-6" style={{ stroke: 'black' }} />
        </div>
        
        <div>
          <p>PencilIcon (works):</p>
          <PencilIcon className="h-6 w-6" style={{ stroke: 'black' }} />
        </div>
        
        <div>
          <p>XMarkIcon (invisible?):</p>
          <div style={{ border: '1px solid red', display: 'inline-block' }}>
            <XMarkIcon className="h-6 w-6" style={{ stroke: 'black' }} />
          </div>
        </div>
        
        <div>
          <p>TrashIcon (does it exist?):</p>
          <div style={{ border: '1px solid red', display: 'inline-block' }}>
            <TrashIcon className="h-6 w-6" style={{ stroke: 'black' }} />
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p>XMarkIcon on red background:</p>
        <button style={{ backgroundColor: 'red', padding: '10px', border: 'none' }}>
          <XMarkIcon className="h-6 w-6" style={{ stroke: 'white', color: 'white' }} />
        </button>
      </div>
    </div>
  );
};