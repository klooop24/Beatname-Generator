import { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

interface GenreSelectorProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  availableGenres: string[];
}

export default function GenreSelector({ 
  selectedGenre, 
  onGenreChange, 
  availableGenres 
}: GenreSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLoading = availableGenres.length === 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mb-6">
      <label htmlFor="genre-select" className="block text-sm font-medium text-gray-300 mb-2">
        Select Genre
      </label>
      
      <div className="relative" ref={dropdownRef}>
        <button
          id="genre-button"
          type="button"
          className="w-full flex justify-between items-center bg-[#0F172A] px-4 py-3 rounded-lg border border-gray-700 text-left focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading genres...</span>
            </div>
          ) : (
            <span id="selected-genre">{selectedGenre}</span>
          )}
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </button>
        
        {isOpen && !isLoading && (
          <div className="absolute z-10 mt-1 w-full bg-[#0F172A] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {availableGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                className={`genre-option w-full text-left px-4 py-2 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none transition-colors ${
                  selectedGenre === genre ? "bg-gray-700 font-medium" : ""
                }`}
                onClick={() => {
                  onGenreChange(genre);
                  setIsOpen(false);
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
