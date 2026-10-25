import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Sun,
  Moon,
  Coffee,
  Sparkles,
  Eye,
  EyeOff,
  Type,
  List,
  Layers,
  ArrowRight,
  Share2,
  ZoomIn,
  ZoomOut,
  Highlighter,
  MessageSquare,
  Copy,
  Check,
  PenTool,
  Columns2
} from 'lucide-react';
import { VolumeData, getReadingProgress, HighlightItem } from '../types/book';
import { BOOK_VOLUMES_CONTENT, ChapterItem } from '../data/bookContent';
import { extractArchiveId } from '../utils/archiveUtils';
import { CanvasDrawer } from './CanvasDrawer';
import { DualPageEditorModal } from './DualPageEditorModal';
import { recordRecentRead } from '../utils/readingHistory';

interface ReaderModalProps {
  volume: VolumeData | null;
  onClose: () => void;
  onDownload: (volume: VolumeData) => void;
  isBookmarked: boolean;
  onToggleBookmark: (volumeId: number) => void;
  onUpdateProgress: (volumeId: number, page: number) => void;
  onAddHighlight?: (highlight: HighlightItem) => void;
  highlights?: HighlightItem[];
}

export type ReaderTheme = 'sepia' | 'night' | 'emerald' | 'day';

export const ReaderModal: React.FC<ReaderModalProps> = ({
  volume,
  onClose,
  onDownload,
  isBookmarked,
  onToggleBookmark,
  onUpdateProgress,
  onAddHighlight,
  highlights = [],
}) => {
  // Reading mode: default to the beautiful internal reader so it NEVER shows external website errors!
  const [activeMode, setActiveMode] = useState<'internal' | 'pdf'>('internal');
  const [theme, setTheme] = useState<ReaderTheme>('sepia');
  const [focusMode, setFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'nastaliq' | 'sans'>('nastaliq');
  const [showToc, setShowToc] = useState(false);
  const [showVolumeHighlights, setShowVolumeHighlights] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState<boolean>(false);
  const [showDualEditor, setShowDualEditor] = useState<boolean>(false);

  // Text selection & Highlight popup state
  const [selectedText, setSelectedText] = useState<string>('');
  const [highlightCoords, setHighlightCoords] = useState<{ x: number; y: number } | null>(null);
  const [highlightColor, setHighlightColor] = useState<string>('#f59e0b');
  const [highlightNote, setHighlightNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [highlightToast, setHighlightToast] = useState(false);

  // Page tracking
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [sliderValue, setSliderValue] = useState<number>(1);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // PDF Viewer Manual Zoom state
  const [pdfZoom, setPdfZoom] = useState<number>(100);

  const handleZoomIn = () => {
    setPdfZoom((prev) => Math.min(250, prev + 15));
  };

  const handleZoomOut = () => {
    setPdfZoom((prev) => Math.max(50, prev - 15));
  };

  const handleResetZoom = () => {
    setPdfZoom(100);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setHighlightCoords(null);
      setSelectedText('');
      return;
    }

    const text = selection.toString().trim();
    if (text.length >= 3) {
      setSelectedText(text);
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setHighlightCoords({
          x: Math.max(16, Math.min(window.innerWidth - 270, rect.left + rect.width / 2 - 135)),
          y: Math.max(16, rect.top - 55),
        });
      } catch {
        setHighlightCoords({ x: window.innerWidth / 2 - 135, y: 120 });
      }
    } else {
      setHighlightCoords(null);
      setSelectedText('');
    }
  };

  const handleSaveHighlight = (colorToUse?: string) => {
    if (!selectedText.trim() || !volume) return;
    const finalColor = colorToUse || highlightColor;
    const newHighlight: HighlightItem = {
      id: 'hl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      volumeId: volume.id,
      volumeNumber: volume.volumeNumber,
      volumeTitleUrdu: volume.volumeTitleUrdu,
      page: currentPage,
      text: selectedText.trim(),
      color: finalColor,
      note: highlightNote.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    if (onAddHighlight) {
      onAddHighlight(newHighlight);
    }
    setHighlightCoords(null);
    setSelectedText('');
    setHighlightNote('');
    setShowNoteInput(false);
    window.getSelection()?.removeAllRanges();
    setHighlightToast(true);
    setTimeout(() => setHighlightToast(false), 2500);
  };

  useEffect(() => {
    if (volume) {
      const initialPage = volume.lastReadPage && volume.lastReadPage > 0 ? volume.lastReadPage : 1;
      setCurrentPage(initialPage);
      setPageInput(initialPage.toString());
      setSliderValue(initialPage);
      try {
        recordRecentRead(volume, initialPage);
      } catch {}
    }
  }, [volume]);

  // Load saved theme preference from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('ehtisab_reader_theme') as ReaderTheme;
    if (savedTheme && ['sepia', 'night', 'emerald', 'day'].includes(savedTheme)) {
      setTheme(savedTheme);
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch {}
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
    }
  };

  if (!volume) return null;

  const totalPages = volume.pageCount > 0 ? volume.pageCount : 560;
  const progressPct = getReadingProgress(currentPage, totalPages);
  const volumeContent = BOOK_VOLUMES_CONTENT[volume.volumeNumber] || BOOK_VOLUMES_CONTENT[1];
  const chapters = volumeContent.chapters || [];
  const currentChapter: ChapterItem | undefined = chapters[activeChapterIndex] || chapters[0];

  const handleThemeChange = (newTheme: ReaderTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('ehtisab_reader_theme', newTheme);
    } catch {}
  };

  const handlePageChange = (newPage: number) => {
    const clampedPage = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(clampedPage);
    setPageInput(clampedPage.toString());
    setSliderValue(clampedPage);
    onUpdateProgress(volume.id, clampedPage);
    try {
      recordRecentRead(volume, clampedPage);
    } catch {}
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 1800);

    // Auto-update chapter index based on page if matched
    const matchedIdx = chapters.findIndex((ch, idx) => {
      const nextCh = chapters[idx + 1];
      if (nextCh) {
        return clampedPage >= ch.page && clampedPage < nextCh.page;
      }
      return clampedPage >= ch.page;
    });
    if (matchedIdx !== -1) {
      setActiveChapterIndex(matchedIdx);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed)) {
      handlePageChange(parsed);
    }
  };

  const handleSelectChapter = (idx: number, chPage: number) => {
    setActiveChapterIndex(idx);
    handlePageChange(chPage);
    setShowToc(false);
  };

  // Theme styling definitions
  const themeStyles = {
    sepia: {
      bg: 'bg-[#211a14]',
      cardBg: 'bg-[#2b221a]',
      sidebarBg: 'bg-[#1b1510]',
      text: 'text-[#fbf0d9]',
      textMuted: 'text-[#d4af84]',
      border: 'border-[#4a3b2c]',
      headerBg: 'bg-[#19130f]',
      accent: 'text-[#f59e0b]',
      highlight: 'bg-[#3d2e20]',
      progressBg: 'bg-[#1b1510]',
      progressBar: 'bg-gradient-to-r from-amber-600 to-amber-400',
    },
    night: {
      bg: 'bg-[#09090b]',
      cardBg: 'bg-[#121215]',
      sidebarBg: 'bg-[#0e0e11]',
      text: 'text-[#e4e4e7]',
      textMuted: 'text-[#a1a1aa]',
      border: 'border-[#27272a]',
      headerBg: 'bg-[#040405]',
      accent: 'text-[#fbbf24]',
      highlight: 'bg-[#1c1c22]',
      progressBg: 'bg-[#18181b]',
      progressBar: 'bg-gradient-to-r from-amber-500 to-emerald-400',
    },
    emerald: {
      bg: 'bg-[#051c14]',
      cardBg: 'bg-[#0b291e]',
      sidebarBg: 'bg-[#03140e]',
      text: 'text-[#d1fae5]',
      textMuted: 'text-[#6ee7b7]',
      border: 'border-[#065f46]',
      headerBg: 'bg-[#02100b]',
      accent: 'text-[#34d399]',
      highlight: 'bg-[#0e3b2b]',
      progressBg: 'bg-[#03140e]',
      progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-300',
    },
    day: {
      bg: 'bg-[#fcfbf9]',
      cardBg: 'bg-[#ffffff]',
      sidebarBg: 'bg-[#f5f3ef]',
      text: 'text-[#1c1917]',
      textMuted: 'text-[#57534e]',
      border: 'border-[#e7e5e4]',
      headerBg: 'bg-[#f0ece5]',
      accent: 'text-[#b45309]',
      highlight: 'bg-[#f5f0e6]',
      progressBg: 'bg-[#e7e5e4]',
      progressBar: 'bg-gradient-to-r from-amber-600 to-emerald-600',
    },
  }[theme];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md ${
        isFullscreen ? 'p-0 w-screen h-screen' : 'p-0 sm:p-2'
      }`}
    >
      <div
        className={`w-full h-full flex flex-col shadow-2xl transition-all duration-300 overflow-hidden ${
          isFullscreen
            ? 'w-screen h-screen max-w-none max-h-none rounded-none border-none'
            : 'sm:rounded-2xl border max-w-6xl max-h-[96vh]'
        } ${themeStyles.border} ${themeStyles.bg}`}
      >
        {/* TOP TOOLBAR - Hidden in Focus Mode unless hovered */}
        {!focusMode && (
          <header className={`px-4 py-2.5 border-b ${themeStyles.border} ${themeStyles.headerBg} flex items-center justify-between gap-3 flex-wrap transition-all`}>
            {/* Title & Volume Info */}
            <div className="flex items-center gap-2">
              <span className={`font-nastaliq text-lg sm:text-xl font-bold ${themeStyles.accent}`}>
                احتساب ناصبیت
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-stone-800/80 text-amber-300 font-nastaliq">
                {volume.volumeTitleUrdu}
              </span>
              <span className={`text-xs truncate max-w-[200px] hidden md:inline ${themeStyles.textMuted}`}>
                | {volume.topic}
              </span>
            </div>

            {/* Reading Mode Switcher (Internal Reader vs Raw PDF) */}
            <div className="flex items-center bg-stone-900/80 rounded-xl p-1 border border-stone-800 text-xs">
              <button
                onClick={() => setActiveMode('internal')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-sans ${
                  activeMode === 'internal'
                    ? 'bg-amber-600 text-stone-950 font-bold shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>انٹرنل کتاب ریڈر</span>
              </button>
              <button
                onClick={() => setActiveMode('pdf')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-sans ${
                  activeMode === 'pdf'
                    ? 'bg-amber-600 text-stone-950 font-bold shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>پی ڈی ایف ویور</span>
              </button>
            </div>

            {/* Theme & Night Mode Toggle Palette */}
            <div className="flex items-center gap-1.5">
              {/* Theme Selector Buttons */}
              <div className="flex items-center bg-stone-900/90 rounded-xl p-0.5 border border-stone-800">
                <button
                  onClick={() => handleThemeChange('sepia')}
                  title="سیپیا موڈ (نرم کاغذ)"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    theme === 'sepia'
                      ? 'bg-amber-900/70 text-amber-300 shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleThemeChange('night')}
                  title="نائٹ موڈ (سیاہ - زیرو آئی اسٹرین)"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    theme === 'night'
                      ? 'bg-stone-800 text-amber-400 shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleThemeChange('emerald')}
                  title="ایمرلڈ نائٹ (زمردی سبز)"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    theme === 'emerald'
                      ? 'bg-emerald-950 text-emerald-300 shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleThemeChange('day')}
                  title="ڈے موڈ (دن کا مطالعہ)"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    theme === 'day'
                      ? 'bg-stone-200 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </button>
              </div>

              {/* Focus Mode Toggle */}
              <button
                onClick={() => setFocusMode(true)}
                title="فوکس موڈ فعال کریں (مکمل یکسوئی)"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-stone-800 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">فوکس موڈ</span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={() => onToggleBookmark(volume.id)}
                title={isBookmarked ? 'محفوظ فہرست سے خارج کریں' : 'بُک مارک کریں'}
                className={`p-2 rounded-xl border border-stone-800 transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'text-amber-400 bg-amber-950/60'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              </button>

              {/* Download */}
              <button
                onClick={() => onDownload(volume)}
                title="پی ڈی ایف ڈاؤن لوڈ کریں"
                className="p-2 text-stone-300 hover:text-amber-400 hover:bg-stone-800 rounded-xl border border-stone-800 cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Draw Mode Button */}
              <button
                onClick={() => setIsDrawMode(!isDrawMode)}
                title={isDrawMode ? 'ڈرائنگ موڈ بند کریں' : 'قلمی یادداشت و ڈرائنگ موڈ فعال کریں'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                  isDrawMode
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : 'text-stone-300 hover:text-amber-300 bg-stone-900 hover:bg-stone-800 border-stone-800'
                }`}
              >
                <PenTool className="w-4 h-4 text-amber-400" />
                <span className="hidden xs:inline sm:inline text-xs font-sans">
                  {isDrawMode ? 'قلم موڈ فعال' : 'قلم / ڈرا'}
                </span>
              </button>

              {/* Dual-Page Landscape Reference & Annotation Editor */}
              <button
                onClick={() => setShowDualEditor(true)}
                title="لینڈسکیپ سند ساز و صفحہ ایڈیٹر کھولیں (ٹائٹل پیج + مطلوبہ صفحہ مع ہائی لائٹر و ٹیکسٹ ایڈیٹر)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm text-stone-200 hover:text-amber-300 bg-stone-900 hover:bg-stone-800 border-stone-800 hover:border-amber-500/50"
              >
                <Columns2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden xs:inline sm:inline text-xs font-sans">
                  صفحہ ایڈیٹر
                </span>
              </button>

              {/* Full Screen Toggle Button */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'عام ونڈو میں واپس آئیں (Exit Full Screen)' : 'پوری سکرین پر پھیلائیں (Full Screen View)'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                  isFullscreen
                    ? 'bg-amber-600 text-stone-950 font-bold border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : 'text-stone-300 hover:text-amber-300 bg-stone-900 hover:bg-stone-800 border-stone-800'
                }`}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
                <span className="hidden xs:inline sm:inline text-xs font-sans">
                  {isFullscreen ? 'عام ونڈو' : 'فل سکرین'}
                </span>
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                title="بند کریں"
                className="p-2 text-stone-300 hover:text-rose-400 hover:bg-stone-800 rounded-xl border border-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>
        )}

        {/* FOCUS MODE FLOATING EXIT BUTTON */}
        {focusMode && (
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
            <button
              onClick={() => setFocusMode(false)}
              className="flex items-center gap-1.5 bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-600/40 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md cursor-pointer animate-in fade-in"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>فوکس موڈ سے باہر نکلیں</span>
            </button>

            {/* Quick theme cycle */}
            <button
              onClick={() => {
                const nextTheme: Record<ReaderTheme, ReaderTheme> = {
                  sepia: 'night',
                  night: 'emerald',
                  emerald: 'day',
                  day: 'sepia',
                };
                handleThemeChange(nextTheme[theme]);
              }}
              title="تھیم تبدیل کریں"
              className="p-1.5 bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-700 rounded-full cursor-pointer shadow-lg"
            >
              {theme === 'night' && <Moon className="w-4 h-4 text-amber-400" />}
              {theme === 'sepia' && <Coffee className="w-4 h-4 text-amber-300" />}
              {theme === 'emerald' && <Sparkles className="w-4 h-4 text-emerald-400" />}
              {theme === 'day' && <Sun className="w-4 h-4 text-stone-900" />}
            </button>

            {/* Fullscreen toggle inside focus mode */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'فل سکرین بند کریں' : 'فل سکرین کریں'}
              className="p-1.5 bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-stone-700 rounded-full cursor-pointer shadow-lg"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* READING PROGRESS & INTERACTION CONTROLS BAR */}
        {!focusMode && (
          <div className={`px-4 py-2 border-b ${themeStyles.border} ${themeStyles.cardBg} flex flex-wrap items-center justify-between gap-3 text-xs`}>
            {/* Table of Contents and Font / Zoom Controls */}
            <div className="flex items-center gap-2">
              {activeMode === 'internal' ? (
                <>
                  <button
                    onClick={() => setShowToc(!showToc)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      showToc
                        ? 'bg-amber-600 text-stone-950 font-bold border-amber-500'
                        : `${themeStyles.border} ${themeStyles.textMuted} hover:${themeStyles.text}`
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>فہرست مضامین</span>
                  </button>

                  {/* Font Sizing */}
                  <div className="flex items-center gap-1 border border-stone-800 rounded-lg p-0.5 bg-stone-900/60">
                    <button
                      onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                      className="px-2 py-0.5 text-stone-300 hover:text-white rounded cursor-pointer text-xs"
                    >
                      A-
                    </button>
                    <span className="text-[10px] text-stone-400 font-mono px-1">{fontSize}px</span>
                    <button
                      onClick={() => setFontSize(Math.min(26, fontSize + 2))}
                      className="px-2 py-0.5 text-stone-300 hover:text-white rounded cursor-pointer text-xs"
                    >
                      A+
                    </button>
                  </div>

                  {/* Font Family */}
                  <button
                    onClick={() => setFontFamily(fontFamily === 'nastaliq' ? 'sans' : 'nastaliq')}
                    className="px-2 py-1 text-stone-400 hover:text-stone-200 border border-stone-800 rounded-lg text-[11px] cursor-pointer"
                  >
                    {fontFamily === 'nastaliq' ? 'خط: نستعلیق' : 'خط: سادہ'}
                  </button>

                  {/* Volume Highlights Drawer Button */}
                  <button
                    onClick={() => {
                      setShowVolumeHighlights(!showVolumeHighlights);
                      setShowToc(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      showVolumeHighlights
                        ? 'bg-amber-600 text-stone-950 font-bold border-amber-500'
                        : `${themeStyles.border} ${themeStyles.textMuted} hover:${themeStyles.text}`
                    }`}
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                    <span>ہائی لائٹس ({highlights.filter((h) => h.volumeId === volume?.id).length})</span>
                  </button>
                </>
              ) : (
                /* PDF Manual Zoom Controls in Toolbar */
                <div className="flex items-center gap-1 border border-stone-800 rounded-xl p-0.5 bg-stone-900/90 shadow-sm">
                  <span className="text-[11px] text-stone-400 px-1.5 font-sans">پی ڈی ایف زوم:</span>
                  <button
                    onClick={handleZoomOut}
                    disabled={pdfZoom <= 50}
                    title="زوم کم کریں (-)"
                    className="p-1 text-stone-300 hover:text-amber-400 hover:bg-stone-800 disabled:opacity-30 rounded-lg cursor-pointer transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleResetZoom}
                    title="۱۰۰٪ پر ری سیٹ کریں"
                    className="px-2 py-0.5 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 rounded cursor-pointer"
                  >
                    {pdfZoom}%
                  </button>

                  <button
                    onClick={handleZoomIn}
                    disabled={pdfZoom >= 250}
                    title="زوم بڑھائیں (+)"
                    className="p-1 text-stone-300 hover:text-amber-400 hover:bg-stone-800 disabled:opacity-30 rounded-lg cursor-pointer transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleResetZoom}
                    title="ری سیٹ"
                    className="text-[10px] px-1.5 py-0.5 text-stone-400 hover:text-stone-200 bg-stone-800 rounded cursor-pointer"
                  >
                    100%
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Page Slider Component */}
            <div className="flex items-center gap-2 flex-1 min-w-[210px] max-w-xs sm:max-w-sm bg-stone-900/80 border border-stone-800 rounded-xl px-2.5 py-1">
              <span className="text-[10px] text-stone-400 font-mono">۱</span>
              <input
                type="range"
                min="1"
                max={totalPages}
                value={sliderValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSliderValue(val);
                  setPageInput(val.toString());
                }}
                onMouseUp={() => handlePageChange(sliderValue)}
                onTouchEnd={() => handlePageChange(sliderValue)}
                className="w-full h-1.5 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                title={`صفحہ سلائیڈر: ص ${sliderValue} / ${totalPages}`}
              />
              <span className="text-[11px] text-amber-400 font-mono font-bold whitespace-nowrap min-w-[46px] text-center">
                ص {sliderValue}
              </span>
            </div>

            {/* Page Stepper & Jumper */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 10)}
                title="10 صفحات پیچھے"
                className="px-2 py-1 bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px] cursor-pointer"
              >
                -۱۰
              </button>

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1 bg-stone-800/80 hover:bg-stone-700 disabled:opacity-30 text-stone-200 rounded-lg cursor-pointer"
                title="پچھلا صفحہ"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dedicated Page Jump Input Field */}
              <form onSubmit={handleInputSubmit} className="flex items-center gap-1 bg-stone-950/90 border border-stone-800 rounded-xl px-2 py-0.5 shadow-inner">
                <span className={`text-[11px] font-sans ${themeStyles.textMuted}`}>صفحہ:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={() => {
                    const parsed = parseInt(pageInput, 10);
                    if (!isNaN(parsed) && parsed !== currentPage) handlePageChange(parsed);
                  }}
                  className={`w-12 text-center rounded-md py-0.5 text-xs font-mono font-bold border ${themeStyles.border} bg-stone-900 text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                />
                <span className={`text-[11px] font-mono ${themeStyles.textMuted}`}>/ {totalPages}</span>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-md text-[10px] cursor-pointer transition-colors"
                >
                  جائیں
                </button>
              </form>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1 bg-stone-800/80 hover:bg-stone-700 disabled:opacity-30 text-stone-200 rounded-lg cursor-pointer"
                title="اگلا صفحہ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlePageChange(currentPage + 10)}
                title="10 صفحات آگے"
                className="px-2 py-1 bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px] cursor-pointer"
              >
                +۱۰
              </button>
            </div>

            {/* Reading Progress Indicator */}
            <div className="flex items-center gap-2 min-w-[140px]">
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${themeStyles.progressBg} border ${themeStyles.border}`}>
                <div
                  className={`h-full rounded-full ${themeStyles.progressBar} transition-all duration-300`}
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
              <span className="font-bold text-amber-400 font-mono text-xs">{progressPct}%</span>
            </div>

            {/* Progress Saved Toast */}
            {showSavedToast && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 rounded-md animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>صفحہ محفوظ!</span>
              </div>
            )}
          </div>
        )}

        {/* MAIN READER BODY */}
        <div className="flex-1 relative flex overflow-hidden">
          {/* Table of Contents Drawer */}
          {showToc && (
            <aside className={`w-72 sm:w-80 border-l ${themeStyles.border} ${themeStyles.sidebarBg} p-4 overflow-y-auto z-20 shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
                  <span className={`font-nastaliq text-base font-bold ${themeStyles.accent}`}>
                    فہرستِ ابواب و فصول
                  </span>
                  <button
                    onClick={() => setShowToc(false)}
                    className="p-1 text-stone-400 hover:text-white rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {chapters.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChapter(idx, ch.page)}
                      className={`w-full text-right p-2.5 rounded-xl text-xs transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                        activeChapterIndex === idx
                          ? `${themeStyles.highlight} ${themeStyles.accent} font-bold border ${themeStyles.border}`
                          : `${themeStyles.textMuted} hover:${themeStyles.text} hover:bg-stone-800/40`
                      }`}
                    >
                      <span className="font-nastaliq leading-snug">{ch.title}</span>
                      <span className="text-[10px] bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800 whitespace-nowrap">
                        ص {ch.page}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500 text-center font-sans">
                کل ابواب: {chapters.length} • کل صفحات: {totalPages}
              </div>
            </aside>
          )}

          {/* Volume Highlights Drawer */}
          {showVolumeHighlights && (
            <aside className={`w-72 sm:w-80 border-l ${themeStyles.border} ${themeStyles.sidebarBg} p-4 overflow-y-auto z-20 shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Highlighter className="w-4 h-4 text-amber-400" />
                    <span className={`font-nastaliq text-base ${themeStyles.accent}`}>
                      اس جلد کے ہائی لائٹس ({highlights.filter((h) => h.volumeId === volume.id).length})
                    </span>
                  </div>
                  <button
                    onClick={() => setShowVolumeHighlights(false)}
                    className="p-1 text-stone-400 hover:text-white rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {highlights.filter((h) => h.volumeId === volume.id).length === 0 ? (
                    <div className="text-center py-8 text-xs text-stone-500 font-sans">
                      اس جلد میں ابھی کوئی ہائی لائٹ محفوظ نہیں ہے۔ متن کو سلیکٹ کر کے ہائی لائٹ کریں۔
                    </div>
                  ) : (
                    highlights
                      .filter((h) => h.volumeId === volume.id)
                      .map((h) => (
                        <div
                          key={h.id}
                          onClick={() => handlePageChange(h.page)}
                          className="p-2.5 rounded-xl border border-stone-800 bg-stone-900/60 hover:bg-stone-800 cursor-pointer transition-colors text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-stone-400">
                            <span className="font-mono text-amber-400">صفحہ {h.page}</span>
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                          </div>
                          <p className="font-nastaliq text-stone-200 line-clamp-2 leading-relaxed">
                            "{h.text}"
                          </p>
                          {h.note && (
                            <p className="text-[10px] text-stone-400 font-sans">نوٹ: {h.note}</p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500 text-center font-sans">
                کلک کر کے براہ راست اس صفحے پر جائیں
              </div>
            </aside>
          )}

          {/* Reader Content Screen */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
            {activeMode === 'internal' ? (
              /* NATIVE URDU BOOK READER CANVAS */
              <article
                onMouseUp={handleTextSelection}
                onTouchEnd={handleTextSelection}
                className={`w-full max-w-3xl ${themeStyles.cardBg} border ${themeStyles.border} rounded-2xl p-6 sm:p-10 shadow-2xl transition-all duration-300 relative my-auto select-text`}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: fontFamily === 'nastaliq' ? '2.4' : '2.0',
                }}
              >
                {/* Book Header Seal */}
                <div className="text-center pb-4 mb-6 border-b border-stone-800/60">
                  <div className="text-sm font-arabic tracking-wide text-amber-400/90 mb-1">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                  <h2 className={`font-nastaliq text-2xl sm:text-3xl font-bold ${themeStyles.accent}`}>
                    احتساب ناصبیت
                  </h2>
                  <p className={`text-xs ${themeStyles.textMuted} mt-0.5 font-sans`}>
                    {volume.volumeTitleUrdu}: {volume.topic}
                  </p>
                </div>

                {/* Chapter Title Badge */}
                {currentChapter && (
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-600/30 text-amber-300 text-xs mb-3 font-nastaliq">
                      <span>{currentChapter.title}</span>
                    </div>

                    {/* Arabic Quranic Verse or Hadith Quote if present */}
                    {currentChapter.arabicVerse && (
                      <div className={`p-4 rounded-xl border ${themeStyles.border} ${themeStyles.highlight} my-4 text-center`}>
                        <p className="font-arabic text-xl sm:text-2xl text-amber-300 leading-relaxed font-bold">
                          "{currentChapter.arabicVerse}"
                        </p>
                        {currentChapter.translation && (
                          <p className={`mt-2 text-xs sm:text-sm ${themeStyles.textMuted} font-sans leading-relaxed`}>
                            ترجمہ: {currentChapter.translation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Scholarly Content Paragraphs */}
                    <div className={`space-y-4 ${themeStyles.text} ${fontFamily === 'nastaliq' ? 'font-nastaliq text-justify' : 'font-body-ur text-justify'}`}>
                      {currentChapter.content.map((p, pIdx) => (
                        <p key={pIdx} className="indent-4 leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Volume Foreword */}
                {currentPage <= 5 && volumeContent.foreword && (
                  <div className={`mt-6 p-4 rounded-xl border border-dashed ${themeStyles.border} text-xs ${themeStyles.textMuted} leading-relaxed`}>
                    <strong className="text-amber-400 block mb-1">مقدمۃ التحقیق:</strong>
                    {volumeContent.foreword}
                  </div>
                )}

                {/* Bottom Page Navigation inside Book Canvas */}
                <div className="mt-10 pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 hover:text-amber-300 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>پچھلا صفحہ</span>
                  </button>

                  <div className="text-center">
                    <span className="font-mono font-bold text-amber-400">ص {currentPage}</span>
                    <span className="text-stone-500 text-[11px] block">از {totalPages}</span>
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 hover:text-amber-300 disabled:opacity-30 cursor-pointer"
                  >
                    <span>اگلا صفحہ</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Freehand Canvas Overlay for Internal Reader */}
                <CanvasDrawer
                  volumeId={volume.id}
                  volumeNumber={volume.volumeNumber}
                  volumeTitleUrdu={volume.volumeTitleUrdu}
                  currentPage={currentPage}
                  isDrawMode={isDrawMode}
                  onCloseDrawMode={() => setIsDrawMode(false)}
                />
              </article>
            ) : (
              /* RAW DIRECT PDF VIEW WITH MANUAL ZOOM CONTROLS */
              <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden">
                {/* Fallback Notice & Helper */}
                <div className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 mb-2 flex items-center justify-between text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>
                      پی ڈی ایف فائل ویور: زوم کنٹرولز (+ / -) سے صفحہ بڑا یا چھوٹا کر کے آسانی سے پڑھیں۔
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveMode('internal')}
                    className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-3 py-1 rounded-lg cursor-pointer whitespace-nowrap text-xs"
                  >
                    انٹرنل ریڈر میں پڑھیں
                  </button>
                </div>

                {/* PDF Container with Zoom Viewport and Floating Controls */}
                <div className="w-full flex-1 rounded-2xl overflow-auto border border-stone-800 bg-stone-950 relative flex justify-center">
                  {/* Floating Manual Zoom and Page Navigation Bar */}
                  <div className="sticky top-3 z-30 flex items-center gap-2 bg-stone-900/95 backdrop-blur-md border border-stone-700/80 rounded-2xl p-1.5 shadow-2xl h-fit self-start mx-auto mb-2 flex-wrap justify-center max-w-full">
                    {/* Zoom Buttons */}
                    <div className="flex items-center gap-0.5 border-r border-stone-800 pr-1.5">
                      <button
                        onClick={handleZoomOut}
                        disabled={pdfZoom <= 50}
                        title="زوم کم کریں (-)"
                        className="p-1.5 text-stone-200 hover:text-amber-400 hover:bg-stone-800 disabled:opacity-30 rounded-xl cursor-pointer transition-colors"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleResetZoom}
                        title="اصل سائز ۱۰۰٪ پر واپس لائیں"
                        className="px-2 py-0.5 text-xs font-mono font-bold text-amber-400 hover:bg-stone-800 rounded-lg cursor-pointer"
                      >
                        {pdfZoom}%
                      </button>

                      <button
                        onClick={handleZoomIn}
                        disabled={pdfZoom >= 250}
                        title="زوم بڑھائیں (+)"
                        className="p-1.5 text-stone-200 hover:text-amber-400 hover:bg-stone-800 disabled:opacity-30 rounded-xl cursor-pointer transition-colors"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleResetZoom}
                        title="۱۰۰٪ پر ری سیٹ"
                        className="text-[10px] px-1.5 py-0.5 text-stone-400 hover:text-stone-200 bg-stone-800 rounded cursor-pointer ml-1"
                      >
                        100%
                      </button>
                    </div>

                    {/* PDF Floating Stepper & Slider */}
                    <div className="flex items-center gap-1.5 border-r border-stone-800 pr-1.5">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-200 rounded-lg cursor-pointer"
                        title="پچھلا صفحہ"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 w-24 sm:w-32">
                        <input
                          type="range"
                          min="1"
                          max={totalPages}
                          value={sliderValue}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setSliderValue(val);
                            setPageInput(val.toString());
                          }}
                          onMouseUp={() => handlePageChange(sliderValue)}
                          onTouchEnd={() => handlePageChange(sliderValue)}
                          className="w-full h-1.5 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          title={`صفحہ: ${sliderValue} / ${totalPages}`}
                        />
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="p-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-200 rounded-lg cursor-pointer"
                        title="اگلا صفحہ"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    {/* PDF Quick Jump Box */}
                    <form onSubmit={handleInputSubmit} className="flex items-center gap-1 bg-stone-950 px-2 py-0.5 rounded-lg border border-stone-800">
                      <span className="text-[10px] text-stone-400 font-sans">صفحہ:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        className="w-12 text-center text-xs font-mono font-bold text-amber-300 bg-stone-900 border border-stone-700 rounded px-1 py-0.5 focus:outline-none"
                      />
                      <span className="text-[10px] text-stone-500 font-mono">/ {totalPages}</span>
                      <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-1.5 py-0.5 rounded text-[10px] cursor-pointer"
                      >
                        جائیں
                      </button>
                    </form>

                    {/* Quick Draw Mode Toggle in Floating Bar */}
                    <button
                      type="button"
                      onClick={() => setIsDrawMode(!isDrawMode)}
                      title={isDrawMode ? 'ڈرائنگ موڈ بند کریں' : 'قلمی یادداشت و ڈرائنگ موڈ'}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isDrawMode
                          ? 'bg-amber-600 text-stone-950 font-bold border-amber-400 shadow-md ring-1 ring-amber-400'
                          : 'bg-stone-800/90 text-stone-300 hover:text-amber-400 hover:bg-stone-700 border-stone-700'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span className="font-sans text-[11px]">
                        {isDrawMode ? 'ڈرائنگ فعال' : 'قلم'}
                      </span>
                    </button>
                  </div>

                  {/* Scaled PDF Frame Wrapper with Freehand Drawing Overlay */}
                  <div
                    className="absolute inset-0 transition-transform duration-150 origin-top flex items-center justify-center p-1 relative"
                    style={{
                      transform: `scale(${pdfZoom / 100})`,
                      transformOrigin: 'top center',
                      width: `${Math.max(100, (100 * 100) / pdfZoom)}%`,
                      height: `${Math.max(100, (100 * 100) / pdfZoom)}%`,
                    }}
                  >
                    <iframe
                      key={`pdf-${volume.id}-${currentPage}-${pdfZoom}`}
                      src={`${volume.pdfUrl}#page=${currentPage}&zoom=${pdfZoom}`}
                      title={`احتساب ناصبیت ${volume.volumeTitleUrdu}`}
                      className="w-full h-full border-none bg-stone-900 rounded-xl"
                    />

                    {/* Canvas Overlay directly on top of the PDF! */}
                    <CanvasDrawer
                      volumeId={volume.id}
                      volumeNumber={volume.volumeNumber}
                      volumeTitleUrdu={volume.volumeTitleUrdu}
                      currentPage={currentPage}
                      isDrawMode={isDrawMode}
                      onCloseDrawMode={() => setIsDrawMode(false)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM STATUS BAR */}
        {!focusMode && (
          <footer className={`px-4 py-2 border-t ${themeStyles.border} ${themeStyles.headerBg} flex flex-wrap items-center justify-between text-xs ${themeStyles.textMuted} gap-2`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                موجودہ پیش رفت: <strong>صفحہ {currentPage}</strong> از {totalPages} (
                <strong>{progressPct}%</strong> مطالعہ مکمل)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(1)}
                className="hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>شروع سے مطالعہ</span>
              </button>
              <span>|</span>
              <span>تھیم: {theme === 'sepia' ? 'سیپیا نرم کاغذ' : theme === 'night' ? 'نائٹ موڈ' : theme === 'emerald' ? 'زمردی نائٹ' : 'ڈے پیپر'}</span>
            </div>
          </footer>
        )}
      </div>

      {/* FLOATING TEXT SELECTION HIGHLIGHT POPUP */}
      {highlightCoords && selectedText && (
        <div
          style={{
            position: 'fixed',
            top: `${highlightCoords.y}px`,
            left: `${highlightCoords.x}px`,
            zIndex: 100,
          }}
          className="bg-stone-900/95 backdrop-blur-md border border-amber-500/60 rounded-2xl p-2 shadow-2xl flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150 max-w-xs"
        >
          {/* Top row: colors & save */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-stone-300 font-sans ml-1">ہائی لائٹ:</span>
            {[
              { name: 'سنہری', color: '#f59e0b' },
              { name: 'سبز', color: '#10b981' },
              { name: 'گلابی', color: '#f43f5e' },
              { name: 'نیلا', color: '#0ea5e9' },
            ].map((c) => (
              <button
                key={c.color}
                onClick={() => handleSaveHighlight(c.color)}
                title={c.name}
                className="w-5 h-5 rounded-full border border-stone-600 hover:scale-125 transition-transform cursor-pointer shadow-sm"
                style={{ backgroundColor: c.color }}
              />
            ))}

            <div className="h-4 w-px bg-stone-700 mx-1" />

            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              title="نوٹ شامل کریں"
              className={`p-1 rounded-lg border text-xs cursor-pointer ${
                showNoteInput
                  ? 'bg-amber-600 text-stone-950 border-amber-400'
                  : 'text-stone-300 hover:text-white border-stone-700 hover:bg-stone-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedText);
                setHighlightCoords(null);
                setSelectedText('');
              }}
              title="کاپی کریں"
              className="p-1 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg border border-stone-700 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setHighlightCoords(null);
                setSelectedText('');
              }}
              className="p-1 text-stone-400 hover:text-rose-400 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Note input if clicked */}
          {showNoteInput && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-stone-800">
              <input
                type="text"
                value={highlightNote}
                onChange={(e) => setHighlightNote(e.target.value)}
                placeholder="اس اقتباس پر مختصر نوٹ لکھیں..."
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-sans"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveHighlight();
                }}
              />
              <button
                onClick={() => handleSaveHighlight()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded-lg text-xs cursor-pointer whitespace-nowrap"
              >
                محفوظ
              </button>
            </div>
          )}
        </div>
      )}

      {/* HIGHLIGHT SAVED TOAST */}
      {highlightToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-emerald-400">
          <Check className="w-4 h-4" />
          <span>اقتباس ہائی لائٹس ٹیب میں کامیابی سے محفوظ ہو گیا!</span>
        </div>
      )}

      {/* DUAL PAGE LANDSCAPE REFERENCE & ANNOTATION EDITOR MODAL */}
      {showDualEditor && volume && (
        <DualPageEditorModal
          volume={volume}
          currentPage={currentPage}
          onClose={() => setShowDualEditor(false)}
          onPageChange={(p) => handlePageChange(p)}
        />
      )}
    </div>
  );
};
