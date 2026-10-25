export interface VolumeData {
  id: number;
  volumeNumber: number;
  volumeTitleUrdu: string;
  topic: string;
  archiveItemId: string;
  coverImageUrl: string;
  pdfUrl: string;
  pageCount: number;
  fileSize: string;
  description: string;
  year?: string;
  isDownloaded?: boolean;
  downloadProgress?: number;
  lastReadPage?: number;
  isBookmarked?: boolean;
}

export function getReadingProgress(lastReadPage?: number, pageCount?: number): number {
  if (!lastReadPage || !pageCount || pageCount <= 0) return 0;
  const pct = Math.round((lastReadPage / pageCount) * 100);
  return Math.min(100, Math.max(0, pct));
}

export interface HighlightItem {
  id: string;
  volumeId: number;
  volumeNumber: number;
  volumeTitleUrdu: string;
  page: number;
  text: string;
  color: string; // e.g. '#f59e0b', '#10b981', '#f43f5e', '#0ea5e9'
  note?: string;
  createdAt: string;
}

export interface DrawingAnnotation {
  id: string;
  volumeId: number;
  volumeNumber: number;
  volumeTitleUrdu: string;
  page: number;
  dataUrl: string; // PNG base64
  updatedAt: string;
}

export type ActiveTab = 'home' | 'downloads' | 'highlights' | 'bookmarks' | 'about' | 'privacy' | 'admin';


