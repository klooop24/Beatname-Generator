import { Card } from "@/components/ui/card";
import { Brush, Loader2, Copy, MoonIcon, InfoIcon } from "lucide-react";
import GenreSelector from "@/components/GenreSelector";
import BeatTitleDisplay from "@/components/BeatTitleDisplay";
import TitleHistory from "@/components/TitleHistory";
import FavoritesPanel from "@/components/FavoritesPanel";
import BeatMetadataSettings from "@/components/BeatMetadataSettings";
import { useLocalStorage } from "@/lib/hooks";
import { useState, useEffect } from "react";
import { BeatTitle, Favorite, BeatMetadata, formatTitleWithMetadata } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getGenres, generateRandomTitleForGenre, rephraseBeatTitle } from "@/lib/beat-titles";
import { DEFAULT_METADATA } from "@shared/schema";

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState("Hip-Hop");
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [favorites, setFavorites] = useLocalStorage<Favorite[]>("beatFavorites", []);
  const [history, setHistory] = useState<BeatTitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [metadata, setMetadata] = useState<BeatMetadata>({...DEFAULT_METADATA});
  const { toast } = useToast();

  // Fetch available genres when component mounts
  useEffect(() => {
    async function fetchGenres() {
      try {
        const genres = await getGenres();
        setAvailableGenres(genres);
        
        // Set default selected genre if it exists in the fetched genres
        if (genres.length > 0 && !genres.includes(selectedGenre)) {
          setSelectedGenre(genres[0]);
        }
      } catch (error) {
        console.error("Failed to fetch genres:", error);
        toast({
          title: "Failed to fetch genres",
          description: "Using default genres instead",
          variant: "destructive"
        });
      }
    }
    
    fetchGenres();
  }, []);

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const generateTitle = async () => {
    setIsLoading(true);
    
    try {
      const title = await generateRandomTitleForGenre(selectedGenre);
      setCurrentTitle(title);
      
      // Add to history
      const newHistoryItem: BeatTitle = {
        title,
        genre: selectedGenre,
        timestamp: new Date().toISOString()
      };
      
      setHistory(prevHistory => {
        // Keep only latest 5 items
        const updatedHistory = [newHistoryItem, ...prevHistory];
        return updatedHistory.slice(0, 5);
      });
    } catch (error) {
      console.error("Failed to generate title:", error);
      toast({
        title: "Failed to generate title",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rephraseTitle = async () => {
    if (!currentTitle) {
      toast({
        title: "No title to rephrase",
        description: "Generate a title first",
        variant: "destructive"
      });
      return;
    }

    setIsRephrasing(true);
    
    try {
      const rephrasedTitle = await rephraseBeatTitle(currentTitle, selectedGenre);
      setCurrentTitle(rephrasedTitle);
      
      toast({
        title: "Title rephrased using AI",
        variant: "default"
      });
    } catch (error) {
      console.error("Failed to rephrase title:", error);
      toast({
        title: "Failed to rephrase title",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsRephrasing(false);
    }
  };

  const addToFavorites = () => {
    if (!currentTitle) {
      toast({
        title: "No title to save",
        description: "Generate a title first",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicates
    const isDuplicate = favorites.some(
      fav => fav.title.toLowerCase() === currentTitle.toLowerCase() && fav.genre === selectedGenre
    );

    if (isDuplicate) {
      toast({
        title: "Already in favorites",
        description: "This title is already saved",
        variant: "destructive"
      });
      return;
    }

    const newFavorite: Favorite = {
      id: Date.now().toString(),
      title: currentTitle,
      genre: selectedGenre,
      date: new Date().toISOString(),
      key: metadata.key,
      scale: metadata.scale,
      bpm: metadata.bpm,
      collaborator: metadata.collaborator
    };

    setFavorites([...favorites, newFavorite]);
    
    toast({
      title: "Added to favorites",
      variant: "default"
    });
  };

  const getFormattedTitle = (baseTitle = currentTitle) => {
    if (!baseTitle) return "";
    return formatTitleWithMetadata(baseTitle, metadata);
  };

  const copyToClipboard = (text?: string) => {
    // Wenn kein Text übergeben wurde, formatieren wir den aktuellen Titel mit Metadaten
    const titleToCopy = text || getFormattedTitle();
    
    if (!titleToCopy) {
      toast({
        title: "Nothing to copy",
        description: "Generate a title first",
        variant: "destructive"
      });
      return;
    }

    navigator.clipboard.writeText(titleToCopy)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          variant: "default"
        });
      })
      .catch(err => {
        console.error("Copy failed:", err);
        toast({
          title: "Failed to copy",
          description: "Could not access clipboard",
          variant: "destructive"
        });
      });
  };

  const useHistoryItem = (item: BeatTitle) => {
    setCurrentTitle(item.title);
    setSelectedGenre(item.genre);
  };

  const removeFavorite = (id: string) => {
    // Die ID kann entweder ein String oder eine Zahl sein, also prüfen wir beide
    setFavorites(favorites.filter(fav => {
      if (typeof fav.id === 'number') {
        return String(fav.id) !== id;
      }
      return fav.id !== id;
    }));
    
    toast({
      title: "Removed from favorites",
      variant: "default"
    });
  };

  const clearFavorites = () => {
    setFavorites([]);
    toast({
      title: "Favorites cleared",
      variant: "default"
    });
  };

  const exportFavorites = () => {
    if (favorites.length === 0) {
      toast({
        title: "No favorites to export",
        description: "Save some titles first",
        variant: "destructive"
      });
      return;
    }

    const text = favorites.map(fav => {
      const formattedTitle = formatTitleWithMetadata(
        fav.title, 
        {
          key: fav.key || DEFAULT_METADATA.key,
          scale: fav.scale || DEFAULT_METADATA.scale,
          bpm: fav.bpm || DEFAULT_METADATA.bpm,
          collaborator: fav.collaborator || DEFAULT_METADATA.collaborator
        }
      );
      return `${formattedTitle} [${fav.genre}]`;
    }).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beat-titles-favorites.txt';
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    toast({
      title: "Favorites exported",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen pb-20 pt-10 px-4 sm:px-6 bg-[#0F172A] text-[#F1F5F9]">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-6 sm:mb-0">
            <h1 className="font-['Poppins'] text-3xl md:text-4xl font-bold text-white flex items-center">
              <Brush className="text-[#FB7185] mr-2" />
              BeatName Generator
            </h1>
            <p className="text-gray-400 mt-1">Create perfect titles for your next track</p>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full bg-[#1E293B] hover:bg-gray-700 transition-all"
            >
              <MoonIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full bg-[#1E293B] hover:bg-gray-700 transition-all"
            >
              <InfoIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Generator Panel */}
        <Card className="lg:col-span-3 bg-[#1E293B] rounded-xl p-6 shadow-lg border-gray-700">
          <GenreSelector 
            selectedGenre={selectedGenre} 
            onGenreChange={handleGenreChange}
            availableGenres={availableGenres}
          />
          
          <div className="mb-6">
            <Button 
              onClick={generateTitle}
              disabled={isLoading}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <span className="material-icons mr-2">auto_awesome</span>
              )}
              Generate Beat Title
            </Button>
          </div>
          
          <BeatTitleDisplay 
            title={currentTitle}
            setTitle={setCurrentTitle}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onCopy={copyToClipboard}
            onRephrase={rephraseTitle}
            onFavorite={addToFavorites}
            isRephrasing={isRephrasing}
          />
          
          {/* Metadaten-Einstellungen */}
          <BeatMetadataSettings 
            metadata={metadata}
            setMetadata={setMetadata}
          />
          
          {/* Vorschau des finalen Titels - immer eingeblendet */}
          <div className="mt-4 p-3 bg-[#0F172A] border border-gray-700 rounded-lg">
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
              <div>Finaler Titel:</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="font-mono text-white break-all flex-1 mr-2">
                {currentTitle ? getFormattedTitle() : "Generiere einen Beat-Titel..."}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => currentTitle && copyToClipboard(getFormattedTitle())}
                disabled={!currentTitle}
                className="text-white bg-[#2D3748] hover:bg-gray-700 border-gray-600"
                title="In die Zwischenablage kopieren"
              >
                <Copy className="h-4 w-4 mr-1" />
                <span className="text-xs">Kopieren</span>
              </Button>
            </div>
          </div>
          
          <TitleHistory 
            history={history}
            onSelectHistoryItem={useHistoryItem}
          />
        </Card>

        {/* Favorites Panel */}
        <FavoritesPanel 
          favorites={favorites}
          onRemove={removeFavorite}
          onExport={exportFavorites}
          onClear={clearFavorites}
          onCopy={copyToClipboard}
        />
      </main>
    </div>
  );
}
