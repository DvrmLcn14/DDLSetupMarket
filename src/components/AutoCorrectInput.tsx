import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, Undo2, ChevronDown, Car, Flag, Search, X } from 'lucide-react';
import {
  autoCorrectCarName,
  autoCorrectTrackName,
  getCarSuggestions,
  getTrackSuggestions,
  CorrectionResult,
  OfficialCarEntry,
  OfficialTrackEntry,
} from '../utils/motorsportNomenclature';

interface AutoCorrectInputProps {
  id?: string;
  type: 'track' | 'car';
  value: string;
  onChange: (value: string, result?: CorrectionResult) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  gameId?: string;
  helperText?: string;
  className?: string;
}

export const AutoCorrectInput: React.FC<AutoCorrectInputProps> = ({
  id,
  type,
  value,
  onChange,
  placeholder,
  label,
  required,
  gameId,
  helperText,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState<string>(value || '');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [lastCorrection, setLastCorrection] = useState<CorrectionResult | null>(null);
  const [showUndo, setShowUndo] = useState<boolean>(false);
  const [originalBeforeCorrection, setOriginalBeforeCorrection] = useState<string>('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync with incoming prop value
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live autocomplete suggestions
  const trackSuggestions = type === 'track' ? getTrackSuggestions(inputValue, 6) : [];
  const carSuggestions = type === 'car' ? getCarSuggestions(inputValue, 6) : [];
  const suggestionsCount = type === 'track' ? trackSuggestions.length : carSuggestions.length;

  // Execute Auto-Correction & Normalization
  const triggerAutoCorrection = (rawText: string) => {
    if (!rawText.trim()) return;

    const result =
      type === 'track'
        ? autoCorrectTrackName(rawText, gameId)
        : autoCorrectCarName(rawText, gameId);

    if (result.wasCorrected && result.corrected !== rawText) {
      setOriginalBeforeCorrection(rawText);
      setLastCorrection(result);
      setShowUndo(true);
      setInputValue(result.corrected);
      onChange(result.corrected, result);
    } else {
      onChange(result.corrected || rawText, result);
      setShowUndo(false);
      setLastCorrection(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    onChange(newVal);
    setIsOpen(true);
    setHighlightedIndex(-1);
    setShowUndo(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev < suggestionsCount - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestionsCount - 1));
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0) {
        e.preventDefault();
        if (type === 'track' && trackSuggestions[highlightedIndex]) {
          selectTrack(trackSuggestions[highlightedIndex]);
        } else if (type === 'car' && carSuggestions[highlightedIndex]) {
          selectCar(carSuggestions[highlightedIndex]);
        }
      } else {
        triggerAutoCorrection(inputValue);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleBlur = () => {
    // Delay blur slightly so click on suggestion list works
    setTimeout(() => {
      triggerAutoCorrection(inputValue);
    }, 200);
  };

  const selectTrack = (track: OfficialTrackEntry) => {
    setInputValue(track.officialName);
    const result: CorrectionResult = {
      original: inputValue,
      corrected: track.officialName,
      wasCorrected: inputValue !== track.officialName,
      confidence: 1.0,
      trackId: track.id,
    };
    onChange(track.officialName, result);
    setIsOpen(false);
    setShowUndo(false);
    setLastCorrection(null);
  };

  const selectCar = (car: OfficialCarEntry) => {
    setInputValue(car.officialName);
    const result: CorrectionResult = {
      original: inputValue,
      corrected: car.officialName,
      wasCorrected: inputValue !== car.officialName,
      confidence: 1.0,
      category: car.category,
      manufacturer: car.manufacturer,
    };
    onChange(car.officialName, result);
    setIsOpen(false);
    setShowUndo(false);
    setLastCorrection(null);
  };

  const handleUndo = () => {
    if (originalBeforeCorrection) {
      setInputValue(originalBeforeCorrection);
      onChange(originalBeforeCorrection);
      setShowUndo(false);
      setLastCorrection(null);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setShowUndo(false);
    setLastCorrection(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative space-y-1 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-slate-300 font-medium text-xs flex items-center gap-1.5">
            {type === 'track' ? (
              <Flag className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Car className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{label}</span>
            {required && <span className="text-rose-400 font-bold">*</span>}
          </label>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-sky-400" />
            <span>Smart Auto-Correction</span>
          </span>
        </div>
      )}

      {/* Input Container */}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          required={required}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder || (type === 'track' ? 'Type track name (e.g. Spa, Nordschleife, Silverstone)...' : 'Type car model (e.g. porsceh 991 gtr, 296 GT3)...')}
          className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-lg pl-3 pr-16 py-2 text-slate-100 placeholder-slate-500 text-xs font-semibold focus:outline-none transition-colors shadow-inner"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
              title="Clear text"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title="Toggle suggestions list"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Auto-Correction Feedback Banner */}
      {showUndo && lastCorrection && lastCorrection.wasCorrected && (
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-sky-950/80 border border-sky-500/40 rounded-lg text-[11px] animate-fadeIn">
          <div className="flex items-center gap-1.5 text-sky-200 truncate pr-2">
            <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="truncate">
              Auto-corrected: <span className="line-through text-slate-400 font-mono">"{originalBeforeCorrection}"</span> ➔ <strong className="text-white font-bold">{lastCorrection.corrected}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleUndo}
            className="shrink-0 flex items-center gap-1 text-[10px] text-sky-300 hover:text-white bg-sky-900/60 hover:bg-sky-800 px-2 py-0.5 rounded font-bold transition-colors border border-sky-500/30"
            title="Revert to your typed text"
          >
            <Undo2 className="w-2.5 h-2.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800/80 backdrop-blur-md">
          <div className="p-2 bg-slate-950/90 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800">
            <span className="flex items-center gap-1">
              <Search className="w-3 h-3 text-sky-400" />
              <span>{type === 'track' ? 'Official Circuits' : 'Official Cars & GT3/F1 Models'}</span>
            </span>
            <span>{suggestionsCount} matches</span>
          </div>

          {type === 'track' && (
            <>
              {trackSuggestions.length > 0 ? (
                trackSuggestions.map((track, idx) => (
                  <button
                    key={track.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectTrack(track);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      highlightedIndex === idx
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-200 hover:bg-slate-800/90'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{track.officialName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {track.country} • Short: {track.shortName}
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">
                      {track.id}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  <span>Custom track accepted! Press Enter or click away to save.</span>
                </div>
              )}
            </>
          )}

          {type === 'car' && (
            <>
              {carSuggestions.length > 0 ? (
                carSuggestions.map((car, idx) => (
                  <button
                    key={car.officialName}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectCar(car);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      highlightedIndex === idx
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-200 hover:bg-slate-800/90'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{car.officialName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {car.manufacturer} • Category: {car.category}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                      {car.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  <span>Custom car model accepted! Press Enter or click away to save.</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {helperText && !showUndo && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
};
