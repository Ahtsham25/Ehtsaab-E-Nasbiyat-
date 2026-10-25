import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowLeft, ShieldCheck, Globe } from 'lucide-react';
import { Language } from '../i18n/translations';

interface SplashScreenProps {
  onDismiss: () => void;
  lang?: Language;
  onToggleLang?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onDismiss,
  lang = 'ur',
  onToggleLang,
}) => {
  const [progress, setProgress] = useState(0);
  const isEn = lang === 'en';

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onDismiss, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 85);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div
      dir={isEn ? 'ltr' : 'rtl'}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-stone-950 via-emerald-950 to-stone-950 text-amber-50 p-6 select-none overflow-hidden islamic-pattern-bg"
    >
      {/* Decorative Golden Islamic Corner Arcs */}
      <div className="absolute top-0 right-0 w-40 h-40 border-t-2 border-r-2 border-amber-500/40 rounded-tr-3xl pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-40 h-40 border-t-2 border-l-2 border-amber-500/40 rounded-tl-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 border-b-2 border-r-2 border-amber-500/40 rounded-br-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 border-b-2 border-l-2 border-amber-500/40 rounded-bl-3xl pointer-events-none"></div>

      {/* Top Bar: Language & Skip Button */}
      <div className="w-full flex justify-between items-center z-10 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs tracking-widest text-emerald-400 font-sans border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-950/60 backdrop-blur-sm">
            {isEn ? '12-Volume Scholarly Encyclopedia' : 'علمی و تحقیقی انسائیکلوپیڈیا'}
          </span>
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 text-xs text-amber-300 hover:text-white bg-stone-900/80 border border-amber-500/30 px-2.5 py-1 rounded-full cursor-pointer transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isEn ? 'اردو' : 'English'}</span>
            </button>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-100 bg-stone-900/80 hover:bg-stone-800 border border-amber-500/30 px-3.5 py-1.5 rounded-full transition-all shadow-md cursor-pointer"
        >
          <span>{isEn ? 'Enter Directly' : 'براہِ راست داخل ہوں'}</span>
          <ArrowLeft className={`w-3.5 h-3.5 ${isEn ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Main Content with Medallion */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-md w-full">
        {/* Bismillah */}
        <div className="mb-4 text-emerald-300/90 font-arabic text-xl sm:text-2xl tracking-wide">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>

        {/* Central Ornate Book Medallion */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Animated Glow Halo */}
          <div className="absolute w-36 h-36 bg-amber-500/20 rounded-full blur-2xl animate-pulse"></div>

          {/* Golden Geometric Ring */}
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-amber-400/60 p-2 flex items-center justify-center bg-stone-900/80 shadow-2xl backdrop-blur-md">
            <div className="w-full h-full rounded-full border border-emerald-500/40 bg-gradient-to-tr from-emerald-900 via-stone-900 to-amber-950/90 flex flex-col items-center justify-center p-3 text-center">
              <BookOpen className="w-9 h-9 text-amber-400 mb-1" />
              <span className="text-[10px] text-amber-200/90 font-sans uppercase tracking-widest">
                {isEn ? '12 Volumes' : '۱۲ جلدیں'}
              </span>
            </div>
          </div>
        </div>

        {/* Book Title in Nastaliq / Typography */}
        <div className="mt-3">
          <span className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold block mb-1 font-sans">
            {isEn ? 'Classical Scholarly Edition' : 'کتابِ مستطاب'}
          </span>
          <h1 className="text-4xl sm:text-5xl font-nastaliq font-bold text-amber-300 drop-shadow-[0_4px_12px_rgba(217,119,6,0.5)]">
            احتساب ناصبیت
          </h1>
          {isEn && (
            <div className="text-sm tracking-wider font-serif text-amber-200 mt-1 uppercase">
              Ihtisab-e-Nasbiyat
            </div>
          )}
          <p className="text-emerald-300 font-nastaliq text-lg sm:text-xl mt-1 text-balance">
            {isEn ? 'A Monumental 12-Volume Research Encyclopedia' : 'مکمل بارہ جلدوں کا تحقیقی مجموعہ'}
          </p>
        </div>

        {/* Badge & Info */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-stone-300 bg-stone-900/60 border border-stone-800 px-4 py-2 rounded-xl backdrop-blur-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {isEn
              ? 'Comprehensive Defense of Ahl al-Bayt and the Prophet’s Companions'
              : 'اہل بیتِ اطہارؑ و صحابہ کرامؓ کے دفاع پر جامع انسائیکلوپیڈیا'}
          </span>
        </div>

        {/* Subtitle (Archive line removed as requested!) */}
        <div className="mt-2 text-[11px] text-stone-400 font-sans">
          {isEn
            ? 'Authentic Quranic Proofs, Classical Traditions & Historical Documents'
            : 'قرآن و سنت، کتبِ احادیث اور اسماء الرجال کے معتبر اسناد کا مستند ذخیرہ'}
        </div>
      </div>

      {/* Bottom Loading Progress Indicator */}
      <div className="w-full max-w-sm flex flex-col items-center gap-2 z-10 pb-4">
        <div className="w-full bg-stone-800/80 rounded-full h-2 p-0.5 border border-stone-700/60 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-150 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between w-full text-[11px] text-stone-400 px-1 font-sans">
          <span>{isEn ? 'Preparing library...' : 'کتب خانے کی تیاری...'}</span>
          <span className="text-amber-400 font-mono">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
