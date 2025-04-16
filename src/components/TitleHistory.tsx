import { BeatTitle } from "@/lib/types";
import { ArrowUpLeft } from "lucide-react";

interface TitleHistoryProps {
  history: BeatTitle[];
  onSelectHistoryItem: (item: BeatTitle) => void;
}

export default function TitleHistory({ history, onSelectHistoryItem }: TitleHistoryProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
        <span className="material-icons text-sm mr-1">history</span>
        Recently Generated
      </h3>
      <div className="bg-[#0F172A] rounded-lg border border-gray-700 p-3">
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">No history yet</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="history-item group flex justify-between items-center py-1 px-2 rounded hover:bg-gray-700">
                <p className="text-sm text-gray-300 truncate">{item.title || ""}</p>
                <button 
                  className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onSelectHistoryItem(item)}
                  title="Use this title"
                >
                  <ArrowUpLeft className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
