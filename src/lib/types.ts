export interface BeatTitle {
  title: string;
  genre: string;
  timestamp: string;
  key?: string;
  scale?: string;
  bpm?: number;
  collaborator?: string;
}

export interface Favorite {
  id: string | number;
  title: string;
  genre: string;
  date?: string;
  userId?: string;
  createdAt?: Date;
  key: string | null;
  scale: string | null;
  bpm: number | null;
  collaborator: string | null;
}

export interface BeatMetadata {
  key: string;
  scale: string;
  bpm: number;
  collaborator: string;
}

export function formatTitleWithMetadata(title: string, metadata: BeatMetadata, useLowerCase: boolean = true): string {
  // Format exakt wie in den Anforderungen: [beat-titel]_[key + Tonart]_[BPM]bpm @fgybeats
  // Beispiel: coole beats_dMin_130bpm @fgybeats
  
  // Wandle Key in Kleinbuchstaben um (z.B. F# -> f#)
  const keyLowerCase = metadata.key.toLowerCase();
  
  // Formatiere Beat-Titel (optional in Kleinbuchstaben)
  const formattedTitle = useLowerCase ? title.toLowerCase() : title;
  
  // Finale Formatierung
  return `${formattedTitle}_${keyLowerCase}${metadata.scale}_${metadata.bpm}bpm ${metadata.collaborator}`;
}
