import { DrawingAnnotation } from '../types/book';

export const DRAWINGS_CATALOG_KEY = 'ehtisab_drawings_catalog_v1';

export function getDrawingStorageKey(volumeId: number, page: number): string {
  return `ehtisab_draw_${volumeId}_p_${page}`;
}

export function getDrawingForPage(volumeId: number, page: number): string | null {
  try {
    return localStorage.getItem(getDrawingStorageKey(volumeId, page));
  } catch (e) {
    console.error('Failed to get drawing from localStorage', e);
    return null;
  }
}

export function getAllDrawings(): DrawingAnnotation[] {
  try {
    const raw = localStorage.getItem(DRAWINGS_CATALOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse drawings catalog', e);
    return [];
  }
}

export function saveDrawingForPage(
  volumeId: number,
  volumeNumber: number,
  volumeTitleUrdu: string,
  page: number,
  dataUrl: string
): DrawingAnnotation | null {
  try {
    const key = getDrawingStorageKey(volumeId, page);
    localStorage.setItem(key, dataUrl);

    const catalog = getAllDrawings();
    const existingIndex = catalog.findIndex(
      (item) => item.volumeId === volumeId && item.page === page
    );

    const annotationItem: DrawingAnnotation = {
      id: existingIndex >= 0 ? catalog[existingIndex].id : `draw_${volumeId}_${page}_${Date.now()}`,
      volumeId,
      volumeNumber,
      volumeTitleUrdu,
      page,
      dataUrl,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      catalog[existingIndex] = annotationItem;
    } else {
      catalog.unshift(annotationItem);
    }

    localStorage.setItem(DRAWINGS_CATALOG_KEY, JSON.stringify(catalog));
    return annotationItem;
  } catch (e) {
    console.error('Failed to save drawing', e);
    return null;
  }
}

export function deleteDrawingForPage(volumeId: number, page: number): void {
  try {
    localStorage.removeItem(getDrawingStorageKey(volumeId, page));
    const catalog = getAllDrawings().filter(
      (item) => !(item.volumeId === volumeId && item.page === page)
    );
    localStorage.setItem(DRAWINGS_CATALOG_KEY, JSON.stringify(catalog));
  } catch (e) {
    console.error('Failed to delete drawing for page', e);
  }
}

export function deleteDrawingById(id: string): void {
  try {
    const catalog = getAllDrawings();
    const target = catalog.find((item) => item.id === id);
    if (target) {
      localStorage.removeItem(getDrawingStorageKey(target.volumeId, target.page));
    }
    const updated = catalog.filter((item) => item.id !== id);
    localStorage.setItem(DRAWINGS_CATALOG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete drawing by ID', e);
  }
}

export function clearAllDrawings(): void {
  try {
    const catalog = getAllDrawings();
    catalog.forEach((item) => {
      localStorage.removeItem(getDrawingStorageKey(item.volumeId, item.page));
    });
    localStorage.removeItem(DRAWINGS_CATALOG_KEY);
  } catch (e) {
    console.error('Failed to clear all drawings', e);
  }
}
