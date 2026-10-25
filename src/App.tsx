import React, { useState, useEffect } from 'react';
import { VolumeData, ActiveTab, HighlightItem } from './types/book';
import { DEFAULT_VOLUMES, STORAGE_KEY } from './data/defaultVolumes';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { VolumeCard } from './components/VolumeCard';
import { ReaderModal } from './components/ReaderModal';
import { DownloadsTab } from './components/DownloadsTab';
import { HighlightsTab } from './components/HighlightsTab';
import { BookmarksTab } from './components/BookmarksTab';
import { AboutTab } from './components/AboutTab';
import { PrivacyPolicyTab } from './components/PrivacyPolicyTab';
import { AdminPanel } from './components/AdminPanel';
import { RecentlyOpenedCarousel } from './components/RecentlyOpenedCarousel';
import { BookOpen, Sparkles, Download, Check, Filter } from 'lucide-react';
import { Language, TRANSLATIONS, ENGLISH_VOLUME_DATA } from './i18n/translations';
import { getAllDrawings } from './utils/drawingStorage';
import { getRecentReads, recordRecentRead, RecentReadItem, RECENT_READS_EVENT } from './utils/readingHistory';

const HIGHLIGHTS_STORAGE_KEY = 'ehtisab_highlights_v1';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [volumes, setVolumes] = useState<VolumeData[]>(DEFAULT_VOLUMES);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [recentReads, setRecentReads] = useState<RecentReadItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVolumeForReading, setSelectedVolumeForReading] = useState<VolumeData | null>(null);
  const [volumeFilter, setVolumeFilter] = useState<'all' | '1-4' | '5-8' | '9-12'>('all');
  const [lang, setLang] = useState<Language>('ur');
  const [downloadToast, setDownloadToast] = useState<{ show: boolean; title: string }>({
    show: false,
    title: '',
  });
  const [drawingsCount, setDrawingsCount] = useState<number>(0);

  // Sync drawings count from LocalStorage
  const refreshDrawingsCount = () => {
    try {
      setDrawingsCount(getAllDrawings().length);
    } catch {}
  };

  useEffect(() => {
    refreshDrawingsCount();
  }, [activeTab, selectedVolumeForReading]);

  // Load highlights from LocalStorage on mount
  useEffect(() => {
    try {
      const storedHl = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
      if (storedHl) {
        const parsed = JSON.parse(storedHl);
        if (Array.isArray(parsed)) {
          setHighlights(parsed);
        }
      }
    } catch {}

    // Load initial recent reads
    setRecentReads(getRecentReads());

    const handleRecentReadsChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setRecentReads(e.detail);
      } else {
        setRecentReads(getRecentReads());
      }
    };
    window.addEventListener(RECENT_READS_EVENT, handleRecentReadsChange);
    return () => window.removeEventListener(RECENT_READS_EVENT, handleRecentReadsChange);
  }, []);

  // Load language preference from LocalStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('ehtisab_app_lang') as Language;
      if (savedLang && (savedLang === 'ur' || savedLang === 'en')) {
        setLang(savedLang);
        document.documentElement.dir = savedLang === 'en' ? 'ltr' : 'rtl';
      }
    } catch {}
  }, []);

  const handleToggleLang = () => {
    const nextLang: Language = lang === 'ur' ? 'en' : 'ur';
    setLang(nextLang);
    document.documentElement.dir = nextLang === 'en' ? 'ltr' : 'rtl';
    try {
      localStorage.setItem('ehtisab_app_lang', nextLang);
    } catch {}
  };

  // Load volumes from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVolumes(parsed);
        }
      }
    } catch {
      // Use defaults if error
    }

    // Listen for storage events (e.g. from admin.html)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setVolumes(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save volumes state
  const saveVolumesState = (newVolumes: VolumeData[]) => {
    setVolumes(newVolumes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVolumes));
    } catch {}
  };

  const handleResetVolumes = () => {
    saveVolumesState(DEFAULT_VOLUMES);
  };

  const handleToggleBookmark = (volumeId: number) => {
    const updated = volumes.map((v) =>
      v.id === volumeId ? { ...v, isBookmarked: !v.isBookmarked } : v
    );
    saveVolumesState(updated);
  };

  const handleUpdateProgress = (volumeId: number, page: number) => {
    const updated = volumes.map((v) =>
      v.id === volumeId ? { ...v, lastReadPage: page } : v
    );
    saveVolumesState(updated);
    const target = volumes.find((v) => v.id === volumeId);
    if (target) {
      recordRecentRead(target, page);
    }
    if (selectedVolumeForReading && selectedVolumeForReading.id === volumeId) {
      setSelectedVolumeForReading((prev) => (prev ? { ...prev, lastReadPage: page } : null));
    }
  };

  const handleDownload = (volume: VolumeData) => {
    // Mark as downloaded
    const updated = volumes.map((v) =>
      v.id === volume.id ? { ...v, isDownloaded: true } : v
    );
    saveVolumesState(updated);

    const titleStr = lang === 'en'
      ? `Volume ${volume.volumeNumber}: Download started...`
      : `${volume.volumeTitleUrdu}: ڈاؤن لوڈ شروع ہو چکا ہے...`;

    // Show toast
    setDownloadToast({
      show: true,
      title: titleStr,
    });
    setTimeout(() => {
      setDownloadToast({ show: false, title: '' });
    }, 4000);

    // Trigger download
    const link = document.createElement('a');
    link.href = volume.pdfUrl;
    link.download = `Ihtisab_Nasbiyat_${volume.volumeNumber}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const saveHighlightsState = (newHighlights: HighlightItem[]) => {
    setHighlights(newHighlights);
    try {
      localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(newHighlights));
    } catch {}
  };

  const handleAddHighlight = (highlight: HighlightItem) => {
    const updated = [highlight, ...highlights];
    saveHighlightsState(updated);
  };

  const handleDeleteHighlight = (id: string) => {
    const updated = highlights.filter((h) => h.id !== id);
    saveHighlightsState(updated);
  };

  const handleClearAllHighlights = () => {
    saveHighlightsState([]);
  };

  const handleOpenInReader = (volumeId: number, page: number) => {
    const vol = volumes.find((v) => v.id === volumeId);
    if (vol) {
      const updated = { ...vol, lastReadPage: page };
      setSelectedVolumeForReading(updated);
      try {
        recordRecentRead(vol, page);
      } catch {}
    }
  };

  const t = TRANSLATIONS[lang];
  const isEn = lang === 'en';

  // Filter volumes based on search and range
  const filteredVolumes = volumes.filter((vol) => {
    const query = searchQuery.trim().toLowerCase();
    const enData = ENGLISH_VOLUME_DATA[vol.volumeNumber];

    const matchesSearch =
      !query ||
      vol.volumeTitleUrdu.toLowerCase().includes(query) ||
      vol.topic.toLowerCase().includes(query) ||
      vol.description.toLowerCase().includes(query) ||
      vol.volumeNumber.toString() === query ||
      `جلد ${vol.volumeNumber}`.includes(query) ||
      (enData &&
        (enData.title.toLowerCase().includes(query) ||
          enData.topic.toLowerCase().includes(query) ||
          enData.description.toLowerCase().includes(query)));

    // Group filter
    let matchesGroup = true;
    if (volumeFilter === '1-4') matchesGroup = vol.volumeNumber >= 1 && vol.volumeNumber <= 4;
    else if (volumeFilter === '5-8') matchesGroup = vol.volumeNumber >= 5 && vol.volumeNumber <= 8;
    else if (volumeFilter === '9-12') matchesGroup = vol.volumeNumber >= 9 && vol.volumeNumber <= 12;

    return matchesSearch && matchesGroup;
  });

  const downloadedCount = volumes.filter((v) => v.isDownloaded).length;
  const bookmarkCount = volumes.filter((v) => v.isBookmarked).length;

  return (
    <div
      dir={isEn ? 'ltr' : 'rtl'}
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white"
    >
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen
          onDismiss={() => setShowSplash(false)}
          lang={lang}
          onToggleLang={handleToggleLang}
        />
      )}

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onShowSplash={() => setShowSplash(true)}
        lang={lang}
        onToggleLang={handleToggleLang}
      />

      {/* Download Alert Toast */}
      {downloadToast.show && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 border border-amber-500/50 text-amber-300 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Download className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>{downloadToast.title}</span>
        </div>
      )}

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* HOME TAB: 12 Volumes View */}
        {activeTab === 'home' && (
          <div className="max-w-5xl mx-auto px-4 py-5 pb-24 space-y-6">
            {/* Banner Section */}
            <div className="relative rounded-3xl overflow-hidden border border-amber-900/40 bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950/80 p-5 sm:p-7 shadow-2xl islamic-pattern-bg">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs mb-2 font-sans">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.volumesAvailable}</span>
                </div>
                <h2 className="font-nastaliq text-3xl sm:text-4xl font-bold text-amber-300 leading-tight">
                  {t.appTitle}
                </h2>
                <p className={`text-base sm:text-lg text-emerald-300 mt-1 ${isEn ? 'font-sans font-semibold' : 'font-nastaliq'}`}>
                  {t.appSubtitle}
                </p>
                <p className="text-xs sm:text-sm text-stone-300 mt-2.5 leading-relaxed font-sans">
                  {t.heroDesc}
                </p>
              </div>

              {/* Decorative Seal in Background */}
              <div className={`absolute ${isEn ? 'right-6' : 'left-6'} -bottom-6 w-36 h-36 rounded-full border border-amber-500/20 opacity-40 pointer-events-none hidden sm:block`}></div>
            </div>

            {/* Recently Opened Carousel (Top of Home Tab, 1-Tap Resumption) */}
            <RecentlyOpenedCarousel
              recentReads={recentReads}
              onOpenVolume={handleOpenInReader}
              lang={lang}
            />

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/60 p-2.5 rounded-2xl border border-stone-800">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <span className="text-xs text-stone-400 flex items-center gap-1 font-sans font-medium">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'Filter:' : 'جلدیں:'}</span>
                </span>
                <button
                  onClick={() => setVolumeFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
                    volumeFilter === 'all'
                      ? 'bg-amber-600 text-stone-950 font-bold shadow'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {t.allVolumes}
                </button>
                <button
                  onClick={() => setVolumeFilter('1-4')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
                    volumeFilter === '1-4'
                      ? 'bg-amber-600 text-stone-950 font-bold shadow'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {t.vol1to4}
                </button>
                <button
                  onClick={() => setVolumeFilter('5-8')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
                    volumeFilter === '5-8'
                      ? 'bg-amber-600 text-stone-950 font-bold shadow'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {t.vol5to8}
                </button>
                <button
                  onClick={() => setVolumeFilter('9-12')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
                    volumeFilter === '9-12'
                      ? 'bg-amber-600 text-stone-950 font-bold shadow'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {t.vol9to12}
                </button>
              </div>

              <div className="text-xs text-stone-400 font-sans px-2">
                {t.availableCount} <span className="text-amber-400 font-bold font-mono">{filteredVolumes.length}</span>
              </div>
            </div>

            {/* Grid of 12 Volumes */}
            {filteredVolumes.length === 0 ? (
              <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-12 text-center text-stone-400">
                <BookOpen className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                <h3 className="font-nastaliq text-xl text-amber-300 mb-1">
                  {isEn ? 'No volumes found' : 'کوئی جلد نہیں ملی'}
                </h3>
                <p className="text-xs font-sans">
                  {isEn ? 'Please try searching for another term' : 'برائے مہربانی تلاش کا لفظ تبدیل فرمائیں۔'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {filteredVolumes.map((vol) => (
                  <VolumeCard
                    key={vol.id}
                    volume={vol}
                    onRead={(volume) => handleOpenInReader(volume.id, volume.lastReadPage || 1)}
                    onDownload={(volume) => handleDownload(volume)}
                    onToggleBookmark={handleToggleBookmark}
                    isBookmarked={!!vol.isBookmarked}
                    lang={lang}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DOWNLOADS TAB */}
        {activeTab === 'downloads' && (
          <DownloadsTab
            volumes={volumes}
            onDownload={handleDownload}
            onRead={(volume) => setSelectedVolumeForReading(volume)}
          />
        )}

        {/* HIGHLIGHTS TAB */}
        {activeTab === 'highlights' && (
          <HighlightsTab
            highlights={highlights}
            onDeleteHighlight={handleDeleteHighlight}
            onClearAllHighlights={handleClearAllHighlights}
            onOpenInReader={handleOpenInReader}
            onNavigateHome={() => setActiveTab('home')}
            lang={lang}
          />
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === 'bookmarks' && (
          <BookmarksTab
            volumes={volumes}
            onRead={(volume) => setSelectedVolumeForReading(volume)}
            onDownload={handleDownload}
            onToggleBookmark={handleToggleBookmark}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && <AboutTab volumes={volumes} lang={lang} />}

        {/* PRIVACY POLICY TAB */}
        {activeTab === 'privacy' && <PrivacyPolicyTab />}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && (
          <AdminPanel
            volumes={volumes}
            onSaveVolumes={saveVolumesState}
            onResetVolumes={handleResetVolumes}
          />
        )}
      </main>

      {/* In-App PDF / Archive Reader Modal */}
      {selectedVolumeForReading && (
        <ReaderModal
          volume={selectedVolumeForReading}
          onClose={() => setSelectedVolumeForReading(null)}
          onDownload={handleDownload}
          isBookmarked={!!selectedVolumeForReading.isBookmarked}
          onToggleBookmark={handleToggleBookmark}
          onUpdateProgress={handleUpdateProgress}
          onAddHighlight={handleAddHighlight}
          highlights={highlights}
        />
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        downloadCount={downloadedCount}
        bookmarkCount={bookmarkCount}
        highlightCount={highlights.length + drawingsCount}
        lang={lang}
      />
    </div>
  );
}
