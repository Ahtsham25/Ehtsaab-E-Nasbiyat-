import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Bookmark,
  Check,
  Eye,
  FileText,
  Share2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { VolumeData, getReadingProgress } from '../types/book';
import { Language, TRANSLATIONS, ENGLISH_VOLUME_DATA } from '../i18n/translations';

interface VolumeCardProps {
  volume: VolumeData;
  onRead: (volume: VolumeData) => void;
  onDownload: (volume: VolumeData) => void;
  onToggleBookmark: (volumeId: number) => void;
  isBookmarked: boolean;
  lang?: Language;
}

export const VolumeCard: React.FC<VolumeCardProps> = ({
  volume,
  onRead,
  onDownload,
  onToggleBookmark,
  isBookmarked,
  lang = 'ur',
}) => {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = TRANSLATIONS[lang];
  const isEn = lang === 'en';
  const enData = ENGLISH_VOLUME_DATA[volume.volumeNumber] || {
    title: `Volume ${volume.volumeNumber}`,
    topic: volume.topic,
    description: volume.description,
  };

  const displayTitle = isEn ? enData.title : volume.volumeTitleUrdu;
  const displayTopic = isEn ? enData.topic : volume.topic;
  const displayDescription = isEn ? enData.description : volume.description;

  const currentPage = volume.lastReadPage || 0;
  const progressPct = getReadingProgress(currentPage, volume.pageCount);
  const hasStarted = currentPage > 0;
  const isCompleted = progressPct >= 100;

  const handleShare = async () => {
    const appUrl = window.location.origin;
    const shareText = isEn
      ? `Ihtisab-e-Nasbiyat - ${displayTitle}: ${displayTopic}\nRead online in the official app: ${appUrl}`
      : `کتابِ مستطاب "احتسابِ ناصبیت" - ${displayTitle}: ${displayTopic}\nمکمل ۱۲ جلدوں کی خصوصی ایپ میں آن لائن مطالعہ فرمائیں: ${appUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `احتساب ناصبیت - ${displayTitle}`,
          text: shareText,
          url: appUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      dir={isEn ? 'ltr' : 'rtl'}
      className="bg-gradient-to-b from-stone-900/90 to-stone-950/90 rounded-2xl border border-stone-800/90 hover:border-amber-600/40 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between group"
    >
      {/* Top Banner with Volume Badge and Bookmark */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-amber-300 font-bold text-lg px-3 py-0.5 rounded-lg bg-amber-950/40 border border-amber-600/30 ${isEn ? 'font-sans' : 'font-nastaliq'}`}>
              {displayTitle}
            </span>
            <span className="text-xs text-stone-400 bg-stone-800/80 px-2 py-1 rounded-md font-sans">
              {isEn ? `Vol ${volume.volumeNumber}` : `جلد ${volume.volumeNumber}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Reading Status Pill */}
            {hasStarted && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border font-sans ${
                  isCompleted
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600/40'
                    : 'bg-amber-950/80 text-amber-300 border-amber-600/40'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{t.completeReading}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{progressPct}% {t.readingProgress}</span>
                  </>
                )}
              </span>
            )}

            <button
              onClick={handleShare}
              title={t.share}
              className="p-1.5 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onToggleBookmark(volume.id)}
              title={isBookmarked ? t.removeBookmark : t.bookmark}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isBookmarked
                  ? 'text-amber-400 bg-amber-950/50'
                  : 'text-stone-400 hover:text-amber-300 hover:bg-stone-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Cover Image & Topic Details */}
        <div className="grid grid-cols-12 gap-3.5 items-center">
          {/* Book Cover Image with Fallback */}
          <div className="col-span-4 relative aspect-[3/4.2] rounded-xl overflow-hidden shadow-lg border border-stone-700/60 bg-stone-950 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
            {!imageError && volume.coverImageUrl ? (
              <img
                src={volume.coverImageUrl}
                alt={`Ihtisab-e-Nasbiyat ${displayTitle}`}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              /* Ornate Calligraphy Book Cover Fallback */
              <div className="w-full h-full bg-gradient-to-tr from-emerald-950 via-stone-900 to-amber-950 p-2.5 flex flex-col justify-between items-center text-center border border-amber-600/40">
                <div className="text-[10px] text-amber-400/80 font-arabic border-b border-amber-500/20 pb-0.5 w-full">
                  کتاب مستطاب
                </div>
                <div>
                  <h3 className="font-nastaliq text-xs font-bold text-amber-200">
                    احتساب ناصبیت
                  </h3>
                  <p className="text-[10px] text-emerald-300 font-sans mt-0.5">
                    {displayTitle}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full border border-amber-400/30 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
            )}

            {/* Quick Read Overlay Icon on Hover */}
            <div
              onClick={() => onRead(volume)}
              className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer backdrop-blur-[1px]"
            >
              <span className="bg-amber-500 text-stone-950 font-bold p-2 rounded-full shadow-lg">
                <Eye className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Volume Details */}
          <div className="col-span-8 flex flex-col justify-between h-full">
            <div>
              <h4 className={`text-base font-semibold text-stone-100 leading-snug line-clamp-2 ${isEn ? 'font-sans font-bold' : 'font-nastaliq'}`}>
                {displayTopic}
              </h4>
              <p className="text-xs text-stone-400 mt-1.5 line-clamp-2 font-sans leading-relaxed">
                {displayDescription}
              </p>
            </div>

            {/* Reading Progress Indicator Bar */}
            <div className="mt-2.5 pt-2 border-t border-stone-800/80">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-stone-400 font-sans flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  {hasStarted ? (
                    <span>
                      {t.pageOf} <strong className="text-stone-200">{currentPage}</strong> {t.of} {volume.pageCount}
                    </span>
                  ) : (
                    <span>{t.notStarted}</span>
                  )}
                </span>
                <span className="font-bold text-amber-400 font-mono text-[11px]">
                  {progressPct}%
                </span>
              </div>
              <div className="w-full bg-stone-950 rounded-full h-1.5 overflow-hidden border border-stone-800/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>

            {/* Meta Tags: Pages & File Size */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-stone-400 font-sans">
              <span className="flex items-center gap-1 bg-stone-800/80 px-2 py-0.5 rounded-md">
                <FileText className="w-3 h-3 text-emerald-400" />
                <span>{volume.pageCount} {t.pages}</span>
              </span>
              <span className="flex items-center gap-1 bg-stone-800/80 px-2 py-0.5 rounded-md">
                <Download className="w-3 h-3 text-amber-400" />
                <span>{volume.fileSize}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-3 pt-2 bg-stone-950/60 border-t border-stone-800/80 flex items-center justify-between gap-2 mt-2">
        {/* Read Online Button */}
        <button
          onClick={() => onRead(volume)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-emerald-50 text-xs font-semibold shadow-md transition-all cursor-pointer font-sans"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>
            {hasStarted && !isCompleted
              ? `${t.continueReading}${currentPage})`
              : isCompleted
              ? t.readAgain
              : t.readOnline}
          </span>
        </button>

        {/* Download Button */}
        <button
          onClick={() => onDownload(volume)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer font-sans"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.downloadPdf}</span>
        </button>
      </div>
    </div>
  );
};
