import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5, can be fractional like 4.5
  maxRating?: number;
  totalRatings?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  totalRatings,
  size = 'md',
  interactive = false,
  onRate,
  showValue = true,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5" id="star-rating-container">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = activeRating >= starValue;
          const isHalf = activeRating >= index + 0.3 && activeRating < starValue;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`p-0 bg-transparent border-0 transition-transform ${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              }`}
              title={`${starValue} Stars`}
            >
              <div className="relative">
                <Star
                  className={`${starSizes[size]} ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-700/60 text-slate-600'
                  }`}
                />
                {isHalf && !isFilled && (
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className={`${starSizes[size]} fill-amber-400 text-amber-400`} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-semibold text-amber-400 tracking-tight ml-0.5">
          {totalRatings === 0 || rating === 0 ? (
            <span className="text-slate-400 font-normal">
              No ratings yet
            </span>
          ) : (
            <>
              {rating.toFixed(1)}/5 stars
              {totalRatings !== undefined && (
                <span className="text-slate-400 font-normal ml-1">
                  ({totalRatings.toLocaleString()})
                </span>
              )}
            </>
          )}
        </span>
      )}
    </div>
  );
};
