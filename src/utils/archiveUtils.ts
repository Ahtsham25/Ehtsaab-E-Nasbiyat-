/**
 * Utilities for parsing and generating Archive.org links and previews
 */

export function extractArchiveId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If it's already a clean identifier (no slashes or protocols)
  if (!trimmed.includes('/') && !trimmed.includes(':') && trimmed.length > 2) {
    return trimmed;
  }

  // Matches archive.org/details/ID or archive.org/download/ID or archive.org/embed/ID or archive.org/services/img/ID
  const match = trimmed.match(/archive\.org\/(?:details|download|embed|services\/img)\/([^\/\?#]+)/i);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

export function generateArchiveThumbnail(urlOrId: string): string {
  const archiveId = extractArchiveId(urlOrId);
  if (archiveId) {
    return `https://archive.org/services/img/${archiveId}`;
  }
  return urlOrId;
}

export function generateArchiveEmbed(urlOrId: string): string {
  const archiveId = extractArchiveId(urlOrId);
  if (archiveId) {
    return `https://archive.org/embed/${archiveId}`;
  }
  return urlOrId;
}

export function generateArchiveDownload(urlOrId: string): string {
  const archiveId = extractArchiveId(urlOrId);
  if (archiveId) {
    return `https://archive.org/download/${archiveId}/${archiveId}.pdf`;
  }
  return urlOrId;
}
