import React from 'react';
import { Home, Download, Highlighter, Bookmark, BookOpen, Shield, Settings } from 'lucide-react';
import { ActiveTab } from '../types/book';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  downloadCount: number;
  bookmarkCount: number;
  highlightCount?: number;
  lang?: Language;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  downloadCount,
  bookmarkCount,
  highlightCount = 0,
  lang = 'ur',
}) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    {
      id: 'home' as ActiveTab,
      label: t.home,
      icon: Home,
    },
    {
      id: 'downloads' as ActiveTab,
      label: t.downloads,
      icon: Download,
      badge: downloadCount > 0 ? downloadCount : undefined,
    },
    {
      id: 'highlights' as ActiveTab,
      label: t.highlights,
      icon: Highlighter,
      badge: highlightCount > 0 ? highlightCount : undefined,
    },
    {
      id: 'bookmarks' as ActiveTab,
      label: t.bookmarks,
      icon: Bookmark,
      badge: bookmarkCount > 0 ? bookmarkCount : undefined,
    },
    {
      id: 'about' as ActiveTab,
      label: t.about,
      icon: BookOpen,
    },
    {
      id: 'privacy' as ActiveTab,
      label: t.privacy,
      icon: Shield,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-amber-900/40 px-1 sm:px-2 py-1 shadow-[0_-8px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-2xl mx-auto flex items-center justify-around gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xl transition-all duration-200 cursor-pointer min-w-[42px] sm:min-w-[52px] ${
                isActive
                  ? 'text-amber-400 font-bold bg-amber-950/40 border border-amber-600/30 shadow-inner'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
              }`}
            >
              {/* Badge for counts */}
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-0.5 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {item.badge}
                </span>
              )}

              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                  isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[9.5px] sm:text-[11px] mt-0.5 tracking-tight font-sans truncate ${
                  isActive ? 'text-amber-300 font-semibold' : 'text-stone-400'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span className="absolute -bottom-0.5 w-4 sm:w-5 h-0.5 bg-amber-400 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
