import React from 'react';
import { BeatMetadata } from '@/lib/types';
import { KEYS, SCALES, DEFAULT_METADATA } from '@shared/schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Music, Hash, User } from 'lucide-react';

interface BeatMetadataSettingsProps {
  metadata: BeatMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<BeatMetadata>>;
}

export default function BeatMetadataSettings({ metadata, setMetadata }: BeatMetadataSettingsProps) {
  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bpm = parseInt(e.target.value) || 0;
    setMetadata(prev => ({ ...prev, bpm }));
  };
  
  const handleCollaboratorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadata(prev => ({ ...prev, collaborator: e.target.value }));
  };
  
  const handleKeyChange = (value: string) => {
    setMetadata(prev => ({ ...prev, key: value }));
  };
  
  const handleScaleChange = (value: string) => {
    setMetadata(prev => ({ ...prev, scale: value }));
  };
  
  return (
    <div className="mt-6 border border-gray-700 rounded-lg p-4 bg-[#0F172A]">
      <h3 className="text-sm font-medium text-white mb-3 flex items-center">
        <Music className="h-4 w-4 mr-1 text-purple-400" />
        Metadaten für Beats
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tonart (Key) */}
        <div className="space-y-1.5">
          <Label htmlFor="key" className="text-xs">Tonart</Label>
          <Select value={metadata.key} onValueChange={handleKeyChange}>
            <SelectTrigger id="key" className="bg-[#1E293B] border-gray-700">
              <SelectValue placeholder={DEFAULT_METADATA.key} />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-gray-700">
              {KEYS.map(key => (
                <SelectItem key={key} value={key}>{key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Skala (Scale) */}
        <div className="space-y-1.5">
          <Label htmlFor="scale" className="text-xs">Skala</Label>
          <Select value={metadata.scale} onValueChange={handleScaleChange}>
            <SelectTrigger id="scale" className="bg-[#1E293B] border-gray-700">
              <SelectValue placeholder={DEFAULT_METADATA.scale} />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-gray-700">
              {SCALES.map(scale => (
                <SelectItem key={scale} value={scale}>{scale}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* BPM */}
        <div className="space-y-1.5">
          <Label htmlFor="bpm" className="text-xs flex items-center">
            <Hash className="h-3 w-3 mr-1" />
            BPM
          </Label>
          <Input
            id="bpm"
            type="number"
            min="1"
            max="999"
            value={metadata.bpm || ''}
            onChange={handleBpmChange}
            className="bg-[#1E293B] border-gray-700"
          />
        </div>
        
        {/* Collaborator */}
        <div className="space-y-1.5">
          <Label htmlFor="collaborator" className="text-xs flex items-center">
            <User className="h-3 w-3 mr-1" />
            Collaborator
          </Label>
          <Input
            id="collaborator"
            placeholder="z.B. feat. Artist Name"
            value={metadata.collaborator || ''}
            onChange={handleCollaboratorChange}
            className="bg-[#1E293B] border-gray-700"
          />
        </div>
      </div>
    </div>
  );
}