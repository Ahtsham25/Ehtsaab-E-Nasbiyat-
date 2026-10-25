import React from 'react';
import { History, BookOpen, ArrowLeft, ArrowRight, Bookmark, Sparkles } from 'lucide-react';
import { RecentReadItem } from '../utils/readingHistory';
import { getReadingProgress } from '../types/book';

interface RecentlyOpenedCarouselProps {
  recentReads: RecentReadItem[];
  onOpenVolume: (volumeId: number, page: number) => void;
  lang?: 'ur' | 'en';
}

export const RecentlyOpenedCarousel: React.FC<RecentlyOpenedCarouselProps> = ({
  recentReads,
  onOpenVolume,
  lang = 'ur',
}) => {
  if (!recentReads || recentReads.length === 0) {
    return null;
  }

  const isEn = lang === 'en';

  const formatTimeAgo = (isoDate: string): string => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return isEn ? 'Just now' : 'ابھی ابھی';
      if (diffMins < 60) return isEn ? `${diffMins}m ago` : `${diffMins} منٹ قبل`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return isEn ? `${diffHours}h ago` : `${diffHours} گھنٹے قبل`;
      const diffDays = Math.floor(diffHours / 24);
      return isEn ? `${diffDays}d ago` : `${diffDays} دن قبل`;
    } catch {
      return '';
    }
  };

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-nastaliq text-lg sm:text-xl font-bold text-amber-300 leading-tight">
              {isEn ? 'Recently Opened Volumes' : 'سابقہ مطالعہ جاری رکھیں (حال ہی میں کھولی گئی جلدیں)'}
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-400 font-sans">
              {isEn
                ? 'Resume your last 3 read volumes with one tap'
                : 'آخری 3 مطالعہ شدہ جلدیں — ایک کلک پر وہیں سے دوبارہ مطالعہ شروع فرمائیں'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-[11px] text-stone-400">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{isEn ? '3 Recent' : '۳ جلدیں'}</span>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
        {recentReads.map((item) => {
          const progress = getReadingProgress(item.page, item.pageCount);
          const timeAgo = formatTimeAgo(item.lastReadAt);

          return (
            <div
              key={item.volumeId}
              onClick={() => onOpenVolume(item.volumeId, item.page)}
              className="group relative flex-none w-[280px] sm:w-[310px] snap-start bg-gradient-to-b from-stone-900/90 to-stone-950/90 hover:to-stone-900 border border-amber-900/40 hover:border-amber-500/60 rounded-2xl p-3.5 shadow-xl transition-all duration-300 hover:shadow-amber-950/40 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
            >
              {/* Top Row: Thumbnail + Info */}
              <div className="flex items-start gap-3">
                {/* Book Thumbnail */}
                <div className="relative w-16 h-22 flex-none rounded-xl overflow-hidden shadow-md border border-stone-800 bg-stone-950">
                  <img
                    src={item.coverImageUrl}
                    alt={item.volumeTitleUrdu}
                    loading="lazy"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-1 right-1 font-nastaliq text-[10px] bg-amber-500/90 text-stone-950 px-1 py-0.5 rounded font-bold shadow">
                    جلد {item.volumeNumber}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                    <span className="text-amber-400/90 font-medium">
                      {isEn ? `Volume ${item.volumeNumber}` : item.volumeTitleUrdu}
                    </span>
                    {timeAgo && <span className="font-sans text-[10px] text-stone-500">{timeAgo}</span>}
                  </div>

                  <h4 className="font-nastaliq text-base sm:text-lg font-bold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1 leading-snug">
                    {item.topic}
                  </h4>

                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-stone-800/80 border border-stone-700/60 text-[11px] text-amber-300">
                    <BookOpen className="w-3 h-3 text-amber-400" />
                    <span className="font-mono font-semibold">صفحہ {item.page}</span>
                    <span className="text-stone-500 text-[10px]">/ {item.pageCount}</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Progress Bar + Action CTA */}
              <div className="mt-3.5 pt-2.5 border-t border-stone-800/80 space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-sans">
                    <span>{isEn ? 'Progress' : 'پیش رفت'}</span>
                    <span className="font-mono text-amber-400 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, progress)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-400 font-sans font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isEn ? 'Tap to resume' : 'مطالعہ جاری رکھیں'}</span>
                  </span>

                  <button
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-stone-950 text-xs font-bold font-sans shadow transition-all duration-200"
                  >
                    <span>{isEn ? 'Read' : 'کھولیں'}</span>
                    {isEn ? <ArrowRight className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
