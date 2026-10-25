import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Clock,
  X,
  Trash2,
  ArrowUpLeft,
  Globe
} from 'lucide-react';
import { ActiveTab } from '../types/book';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onShowSplash: () => void;
  lang: Language;
  onToggleLang: () => void;
}

const SEARCH_HISTORY_STORAGE_KEY = 'ehtisab_search_history_v1';
const MAX_HISTORY_ITEMS = 5;

const DEFAULT_INITIAL_HISTORY_UR = ['جلد اول', 'کربلا', 'حدیث غدیر', 'اہل بیت', 'جلد ہفتم'];
const DEFAULT_INITIAL_HISTORY_EN = ['Volume 1', 'Karbala', 'Ghadir', 'Ahl al-Bayt', 'Volume 7'];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onShowSplash,
  lang,
  onToggleLang,
}) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];
  const isEn = lang === 'en';

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSearchHistory(parsed.slice(0, MAX_HISTORY_ITEMS));
          return;
        }
      }
      const initial = isEn ? DEFAULT_INITIAL_HISTORY_EN : DEFAULT_INITIAL_HISTORY_UR;
      setSearchHistory(initial);
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(initial));
    } catch {
      setSearchHistory(isEn ? DEFAULT_INITIAL_HISTORY_EN : DEFAULT_INITIAL_HISTORY_UR);
    }
  }, [isEn]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveQueryToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        saveQueryToHistory(searchQuery);
      }
      setIsDropdownOpen(false);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleSelectHistoryItem = (item: string) => {
    setSearchQuery(item);
    saveQueryToHistory(item);
    setIsDropdownOpen(false);
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, itemToDelete: string) => {
    e.stopPropagation();
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item !== itemToDelete);
      try {
        localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur-md border-b border-amber-900/30 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-900 via-stone-900 to-amber-900/80 border border-amber-500/40 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-nastaliq text-2xl font-bold text-amber-300 leading-tight">
                  {t.appTitle}
                </h1>
                <span className="text-[10px] font-sans bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 px-1.5 py-0.5 rounded-md font-semibold">
                  {isEn ? '12 Vols' : '۱۲ جلدیں'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-sans">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Top Actions: Language Switcher, Splash Replay, Admin */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher Toggle */}
            <button
              onClick={onToggleLang}
              title={isEn ? 'اردو زبان میں تبدیل کریں' : 'Switch to English language'}
              className="px-2.5 py-1.5 text-stone-200 hover:text-amber-300 bg-stone-900 hover:bg-stone-800 border border-amber-600/30 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 font-sans font-semibold shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'اردو' : 'English'}</span>
            </button>

            {/* Replay Splash Screen */}
            <button
              onClick={onShowSplash}
              title={isEn ? 'View Splash Screen' : 'سپلیش سکرین دیکھیں'}
              className="p-2 text-stone-300 hover:text-amber-300 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-xs">{t.splashReplay}</span>
            </button>
          </div>
        </div>

        {/* Search Bar with Local Storage-backed Search History Dropdown */}
        {(activeTab === 'home' || activeTab === 'downloads') && (
          <div ref={searchContainerRef} className="mt-2.5 relative">
            <Search className={`w-4 h-4 text-stone-400 absolute ${isEn ? 'left-3.5' : 'right-3.5'} top-1/2 -translate-y-1/2 pointer-events-none`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onClick={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={t.searchPlaceholder}
              className={`w-full bg-stone-900/90 border border-stone-800 focus:border-amber-500/70 rounded-xl ${
                isEn ? 'pl-10 pr-16' : 'pr-10 pl-16'
              } py-2 text-sm text-stone-200 placeholder-stone-500 focus:outline-none transition-all shadow-inner font-sans`}
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute ${isEn ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-200 bg-stone-800 px-2 py-0.5 rounded cursor-pointer`}
              >
                {t.clear}
              </button>
            )}

            {/* Recent Searches Dropdown Menu */}
            {isDropdownOpen && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-stone-900/95 backdrop-blur-xl border border-stone-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-stone-800/80 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Dropdown Header */}
                <div className="px-3.5 py-2 flex items-center justify-between text-xs text-stone-400 bg-stone-950/60 font-sans">
                  <div className="flex items-center gap-1.5 font-medium text-amber-300/90">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.recentSearches}</span>
                  </div>
                  <button
                    onClick={handleClearAllHistory}
                    className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t.clearHistory}</span>
                  </button>
                </div>

                {/* List of Recent Search Queries */}
                <div className="py-1">
                  {searchHistory.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="px-3.5 py-2.5 flex items-center justify-between hover:bg-stone-800/80 cursor-pointer text-xs text-stone-200 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                        <span className="font-nastaliq text-stone-200 group-hover:text-amber-300 text-sm truncate">
                          {item}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-stone-500 hidden sm:inline flex items-center gap-0.5 font-sans">
                          {isEn ? 'Search' : 'تلاش'}
                          <ArrowUpLeft className="w-3 h-3" />
                        </span>
                        <button
                          onClick={(e) => handleDeleteHistoryItem(e, item)}
                          title="اس تلاش کو ہٹائیں"
                          className="p-1 text-stone-500 hover:text-rose-400 rounded-md hover:bg-stone-700/60 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dropdown Footer Tip */}
                <div className="px-3 py-1.5 bg-stone-950/40 text-[10px] text-stone-500 flex justify-between items-center font-sans">
                  <span>{isEn ? 'Click any item to search immediately' : 'کسی بھی لفظ پر کلک کر کے فوری تلاش فرمائیں'}</span>
                  <span>{isEn ? 'Press Enter to save search' : 'Enter دبانے سے نئی تلاش محفوظ ہوتی ہے'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
