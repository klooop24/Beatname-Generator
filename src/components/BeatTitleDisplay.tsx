import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Heart, Loader2 } from "lucide-react";

interface BeatTitleDisplayProps {
  title: string;
  setTitle: (title: string) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onCopy: () => void;
  onRephrase: () => void;
  onFavorite: () => void;
  isRephrasing?: boolean;
}

export default function BeatTitleDisplay({
  title,
  setTitle,
  isEditing,
  setIsEditing,
  onCopy,
  onRephrase,
  onFavorite,
  isRephrasing = false
}: BeatTitleDisplayProps) {
  return (
    <div className="mb-6">
      <label htmlFor="beat-title" className="block text-sm font-medium text-gray-300 mb-2">
        Your Beat Title
      </label>
      <div className="relative">
        <Input
          id="beat-title"
          className="w-full bg-[#0F172A] px-4 py-3 rounded-lg border border-gray-700 text-white focus:outline-none transition-all font-mono text-lg"
          placeholder="Your beat title will appear here"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          disabled={isRephrasing}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isRephrasing ? (
            <Loader2 className="h-4 w-4 text-[#FB7185] animate-spin" />
          ) : (
            <span id="edit-indicator" className={`text-xs text-[#FB7185] ${isEditing ? '' : 'hidden'}`}>
              editing
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4">
        <Button
          onClick={onCopy}
          variant="outline"
          className="flex-1 bg-[#0F172A] border border-gray-700 hover:bg-gray-700 text-white font-medium transition-colors"
          disabled={!title || isRephrasing}
        >
          <Copy className="mr-1 h-4 w-4" />
          Copy
        </Button>
        <Button
          onClick={onRephrase}
          variant="outline"
          className="flex-1 bg-[#0F172A] border border-gray-700 hover:bg-gray-700 text-white font-medium transition-colors"
          disabled={!title || isRephrasing}
        >
          {isRephrasing ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-4 w-4" />
          )}
          AI Rephrase
        </Button>
        <Button
          onClick={onFavorite}
          variant="outline"
          className="flex-1 bg-[#0F172A] border border-gray-700 hover:bg-gray-700 text-white font-medium transition-colors"
          disabled={!title || isRephrasing}
        >
          <Heart className="mr-1 h-4 w-4" />
          Favorite
        </Button>
      </div>
    </div>
  );
}
