import React from 'react';
import { Bookmark, BookOpen, Download, Trash2, ArrowRight } from 'lucide-react';
import { VolumeData } from '../types/book';

interface BookmarksTabProps {
  volumes: VolumeData[];
  onRead: (volume: VolumeData) => void;
  onDownload: (volume: VolumeData) => void;
  onToggleBookmark: (volumeId: number) => void;
  onNavigateHome: () => void;
}

export const BookmarksTab: React.FC<BookmarksTabProps> = ({
  volumes,
  onRead,
  onDownload,
  onToggleBookmark,
  onNavigateHome,
}) => {
  const bookmarkedVolumes = volumes.filter((v) => v.isBookmarked);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h2 className="font-nastaliq text-2xl font-bold text-amber-300">
              محفوظ شدہ کتب و نشانات
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            جن جلدوں کو آپ نے بعد میں مطالعہ کے لیے محفوظ فرمایا ہے:
          </p>
        </div>
      </div>

      {bookmarkedVolumes.length === 0 ? (
        <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-nastaliq text-xl text-stone-300 font-bold mb-2">
            کوئی جلد محفوظ نہیں کی گئی
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mb-6 leading-relaxed">
            کسی بھی جلد پر دیے گئے بُک مارک آئیکن پر کلک کر کے آپ اسے اپنی اس ذاتی پسندیدہ فہرست میں شامل کر سکتے ہیں۔
          </p>
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <span>کتب خانہ ملاحظہ فرمائیں</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarkedVolumes.map((vol) => (
            <div
              key={vol.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-700/50 transition-colors shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-nastaliq text-amber-300 font-bold text-base px-2.5 py-0.5 rounded-lg bg-amber-950/40 border border-amber-600/30">
                    {vol.volumeTitleUrdu}
                  </span>
                  <button
                    onClick={() => onToggleBookmark(vol.id)}
                    title="فہرست سے خارج کریں"
                    className="text-stone-400 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-nastaliq text-base text-stone-100 font-semibold mb-1">
                  {vol.topic}
                </h4>
                <p className="text-xs text-stone-400 line-clamp-2">{vol.description}</p>
                
                {/* Reading Progress */}
                <div className="mt-2.5 pt-2 border-t border-stone-800/80">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-stone-400">
                      {vol.lastReadPage && vol.lastReadPage > 0
                        ? `صفحہ ${vol.lastReadPage} / ${vol.pageCount}`
                        : 'ابھی شروع نہیں کیا'}
                    </span>
                    <span className="font-bold text-amber-400 font-mono text-[11px]">
                      {vol.lastReadPage && vol.pageCount
                        ? `${Math.round((vol.lastReadPage / vol.pageCount) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-stone-950 rounded-full h-1 overflow-hidden border border-stone-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                      style={{
                        width: `${
                          vol.lastReadPage && vol.pageCount
                            ? Math.min(100, Math.round((vol.lastReadPage / vol.pageCount) * 100))
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-800">
                <button
                  onClick={() => onRead(vol)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-50 text-xs font-semibold cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>مطالعہ جاری رکھیں</span>
                </button>
                <button
                  onClick={() => onDownload(vol)}
                  className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ڈاؤن لوڈ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
