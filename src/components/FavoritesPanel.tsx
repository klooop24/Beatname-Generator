import { Favorite, formatTitleWithMetadata } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Heart, Download, Trash2, Copy, Edit, X, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { DEFAULT_METADATA } from "@shared/schema";

interface FavoritesPanelProps {
  favorites: Favorite[];
  onRemove: (id: string) => void;
  onExport: () => void;
  onClear: () => void;
  onCopy: (text: string) => void;
}

export default function FavoritesPanel({ 
  favorites,
  onRemove,
  onExport,
  onClear,
  onCopy
}: FavoritesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = (favorite: Favorite) => {
    setEditingId(typeof favorite.id === 'number' ? String(favorite.id) : favorite.id);
    setEditValue(favorite.title);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="lg:col-span-2">
      <Card className="bg-[#1E293B] rounded-xl p-6 shadow-lg h-full border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-['Poppins'] font-semibold flex items-center">
            <Heart className="text-[#FB7185] mr-2 h-5 w-5" />
            Favorites
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="text-sm bg-[#0F172A] hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center"
              title="Export favorites"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-sm bg-[#0F172A] hover:bg-gray-700 text-white px-2 py-1.5 rounded-lg transition-colors"
              title="Clear all favorites"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Favorites list */}
        <div className="favorites-container overflow-y-auto pr-1" style={{ maxHeight: "430px" }}>
          {/* Empty state */}
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-600 mx-auto" />
              <p className="text-gray-400 mt-2">No favorites yet</p>
              <p className="text-gray-500 text-sm mt-1">Generate and save some beat titles!</p>
            </div>
          ) : (
            favorites.map((favorite) => (
              <div 
                key={favorite.id} 
                className="favorite-item group bg-[#0F172A] rounded-lg mb-3 p-3 border border-gray-700 transition-all hover:border-[#7C3AED]"
              >
                <div className="flex justify-between items-start">
                  {editingId === favorite.id ? (
                    <Input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        setEditingId(null);
                        // You would normally update the favorite here
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingId(null);
                          // You would normally update the favorite here
                        } else if (e.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                      className="font-mono bg-[#1E293B] border-gray-600"
                    />
                  ) : (
                    <p className="font-mono text-white">{favorite.title}</p>
                  )}
                  <div className="flex space-x-1">
                    <button 
                      className="p-1 text-gray-400 hover:text-white" 
                      title="Copy to clipboard with metadata"
                      onClick={() => {
                        // Formatierter Titel mit Metadaten
                        const formattedTitle = formatTitleWithMetadata(
                          favorite.title,
                          {
                            key: favorite.key || DEFAULT_METADATA.key,
                            scale: favorite.scale || DEFAULT_METADATA.scale,
                            bpm: favorite.bpm || DEFAULT_METADATA.bpm,
                            collaborator: favorite.collaborator || DEFAULT_METADATA.collaborator
                          }
                        );
                        onCopy(formattedTitle);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-white" 
                      title="Edit title"
                      onClick={() => startEditing(favorite)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-[#FB7185]" 
                      title="Remove from favorites"
                      onClick={() => onRemove(typeof favorite.id === 'number' ? String(favorite.id) : favorite.id)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Genre */}
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <span className="material-icons text-xs mr-1">category</span>
                  {favorite.genre}
                </div>
                
                {/* Metadata information */}
                <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-x-3">
                  <div className="flex items-center">
                    <Music className="h-3 w-3 mr-1" />
                    {favorite.key || DEFAULT_METADATA.key}{favorite.scale || DEFAULT_METADATA.scale}
                  </div>
                  <div>
                    {favorite.bpm || DEFAULT_METADATA.bpm}bpm
                  </div>
                  <div className="text-purple-400">
                    {favorite.collaborator || DEFAULT_METADATA.collaborator}
                  </div>
                </div>
                
                {/* Formatted title preview */}
                <div className="text-xs text-gray-500 mt-2 font-mono overflow-hidden text-ellipsis">
                  {formatTitleWithMetadata(
                    favorite.title,
                    {
                      key: favorite.key || DEFAULT_METADATA.key,
                      scale: favorite.scale || DEFAULT_METADATA.scale,
                      bpm: favorite.bpm || DEFAULT_METADATA.bpm,
                      collaborator: favorite.collaborator || DEFAULT_METADATA.collaborator
                    }
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
