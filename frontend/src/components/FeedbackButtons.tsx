import React from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';

interface FeedbackButtonsProps {
  rating: boolean | null;
  onRating: (rating: boolean) => void;
  disabled?: boolean;
}

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  rating,
  onRating,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onRating(true)}
        disabled={disabled}
        className={`p-1.5 rounded transition-colors ${
          rating === true
            ? 'bg-green-100 text-green-700'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title="This insight was helpful"
      >
        <HandThumbUpIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => onRating(false)}
        disabled={disabled}
        className={`p-1.5 rounded transition-colors ${
          rating === false
            ? 'bg-red-100 text-red-700'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title="This insight was not helpful"
      >
        <HandThumbDownIcon className="w-4 h-4" />
      </button>
    </div>
  );
};