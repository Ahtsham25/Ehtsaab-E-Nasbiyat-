import { VolumeData } from '../types/book';

export interface RecentReadItem {
  volumeId: number;
  volumeNumber: number;
  volumeTitleUrdu: string;
  topic: string;
  coverImageUrl: string;
  page: number;
  pageCount: number;
  lastReadAt: string;
}

export const RECENT_READS_STORAGE_KEY = 'ehtisab_recent_reads_v2';
export const RECENT_READS_EVENT = 'ehtisab_recent_reads_changed';

/**
 * Default fallback recent reads if user hasn't opened any books yet.
 */
const DEFAULT_INITIAL_RECENTS: RecentReadItem[] = [
  {
    volumeId: 1,
    volumeNumber: 1,
    volumeTitleUrdu: 'جلد اول',
    topic: 'مقدمہ، تعریفِ ناصبیت اور تاریخی پس منظر',
    coverImageUrl: 'https://archive.org/services/img/Ihtisab-e-Nasbiyat-jild-1',
    page: 15,
    pageCount: 520,
    lastReadAt: new Date().toISOString(),
  },
  {
    volumeId: 2,
    volumeNumber: 2,
    volumeTitleUrdu: 'جلد دوم',
    topic: 'امیر معاویہ اور تاریخی حقائق کا جائزہ',
    coverImageUrl: 'https://archive.org/services/img/Ihtisab-e-Nasbiyat-jild-2',
    page: 42,
    pageCount: 544,
    lastReadAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    volumeId: 3,
    volumeNumber: 3,
    volumeTitleUrdu: 'جلد سوم',
    topic: 'واقعہ کربلا، یزیدیت اور ناصبی تاویلات کا رد',
    coverImageUrl: 'https://archive.org/services/img/Ihtisab-e-Nasbiyat-jild-3',
    page: 88,
    pageCount: 512,
    lastReadAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export function getRecentReads(): RecentReadItem[] {
  try {
    const raw = localStorage.getItem(RECENT_READS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_INITIAL_RECENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3);
    }
    return DEFAULT_INITIAL_RECENTS;
  } catch (e) {
    console.error('Failed to parse recent reads', e);
    return DEFAULT_INITIAL_RECENTS;
  }
}

export function recordRecentRead(
  volume: {
    id: number;
    volumeNumber: number;
    volumeTitleUrdu: string;
    topic: string;
    coverImageUrl: string;
    pageCount: number;
  },
  page: number
): RecentReadItem[] {
  try {
    const currentList = getRecentReads().filter((item) => item.volumeId !== volume.id);
    const newItem: RecentReadItem = {
      volumeId: volume.id,
      volumeNumber: volume.volumeNumber,
      volumeTitleUrdu: volume.volumeTitleUrdu,
      topic: volume.topic,
      coverImageUrl: volume.coverImageUrl,
      page: Math.max(1, page),
      pageCount: volume.pageCount,
      lastReadAt: new Date().toISOString(),
    };

    const updatedList = [newItem, ...currentList].slice(0, 3);
    localStorage.setItem(RECENT_READS_STORAGE_KEY, JSON.stringify(updatedList));

    // Dispatch event to inform listeners across tabs/components
    window.dispatchEvent(new CustomEvent(RECENT_READS_EVENT, { detail: updatedList }));

    return updatedList;
  } catch (e) {
    console.error('Failed to save recent read', e);
    return getRecentReads();
  }
}

export function clearRecentReads(): void {
  try {
    localStorage.removeItem(RECENT_READS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(RECENT_READS_EVENT, { detail: [] }));
  } catch (e) {
    console.error('Failed to clear recent reads', e);
  }
}
