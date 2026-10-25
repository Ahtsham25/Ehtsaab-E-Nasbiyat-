import React, { useState, useEffect } from 'react';
import {
  Highlighter,
  BookOpen,
  Trash2,
  Copy,
  Check,
  Share2,
  Search,
  Download,
  Sparkles,
  ArrowRight,
  PenTool,
  Calendar,
  Layers
} from 'lucide-react';
import { HighlightItem, DrawingAnnotation } from '../types/book';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { getAllDrawings, deleteDrawingById, clearAllDrawings } from '../utils/drawingStorage';

interface HighlightsTabProps {
  highlights: HighlightItem[];
  onDeleteHighlight: (id: string) => void;
  onClearAllHighlights: () => void;
  onOpenInReader: (volumeId: number, page: number) => void;
  onNavigateHome: () => void;
  lang?: Language;
}

export const HighlightsTab: React.FC<HighlightsTabProps> = ({
  highlights,
  onDeleteHighlight,
  onClearAllHighlights,
  onOpenInReader,
  onNavigateHome,
  lang = 'ur',
}) => {
  const [subTab, setSubTab] = useState<'highlights' | 'drawings'>('highlights');
  const [drawings, setDrawings] = useState<DrawingAnnotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVolFilter, setSelectedVolFilter] = useState<number | 'all'>('all');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isEn = lang === 'en';
  const t = TRANSLATIONS[lang];

  // Refresh drawings when switching subtab or on mount
  useEffect(() => {
    setDrawings(getAllDrawings());
  }, [subTab]);

  const handleDeleteDrawing = (id: string) => {
    deleteDrawingById(id);
    setDrawings(getAllDrawings());
  };

  const handleClearAllDrawings = () => {
    if (confirm(isEn ? 'Are you sure you want to delete all saved drawings?' : 'کیا آپ واقعی تمام قلمی ڈرائنگز ختم کرنا چاہتے ہیں؟')) {
      clearAllDrawings();
      setDrawings([]);
    }
  };

  // Filter highlights
  const filteredHighlights = highlights.filter((h) => {
    const matchesSearch =
      !searchQuery ||
      h.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.note && h.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      h.volumeTitleUrdu.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVol = selectedVolFilter === 'all' || h.volumeNumber === selectedVolFilter;
    const matchesColor = selectedColorFilter === 'all' || h.color === selectedColorFilter;

    return matchesSearch && matchesVol && matchesColor;
  });

  // Filter drawings
  const filteredDrawings = drawings.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.volumeTitleUrdu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `جلد ${d.volumeNumber}`.includes(searchQuery) ||
      `صفحہ ${d.page}`.includes(searchQuery);

    const matchesVol = selectedVolFilter === 'all' || d.volumeNumber === selectedVolFilter;
    return matchesSearch && matchesVol;
  });

  const handleCopy = (h: HighlightItem) => {
    const textToCopy = `"${h.text}"\n— احتساب ناصبیت (${h.volumeTitleUrdu}، صفحہ ${h.page})${h.note ? `\nنوٹ: ${h.note}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (h: HighlightItem) => {
    const shareText = `"${h.text}"\n— احتساب ناصبیت (${h.volumeTitleUrdu}، صفحہ ${h.page})`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `احتساب ناصبیت - اقتباس`,
          text: shareText,
        });
        return;
      } catch {}
    }
    handleCopy(h);
  };

  const handleExportText = () => {
    if (highlights.length === 0) return;
    const content = highlights
      .map(
        (h, idx) =>
          `[${idx + 1}] احتساب ناصبیت - ${h.volumeTitleUrdu} (صفحہ ${h.page})\n"${h.text}"\n${h.note ? `نوٹ: ${h.note}\n` : ''}تاریخ: ${new Date(h.createdAt).toLocaleDateString()}\n----------------------------------------`
      )
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ihtisab_nasbiyat_highlights.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950/80 border border-amber-900/40 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-400">
              {subTab === 'highlights' ? (
                <Highlighter className="w-5 h-5" />
              ) : (
                <PenTool className="w-5 h-5" />
              )}
            </div>
            <h2 className="font-nastaliq text-2xl sm:text-3xl font-bold text-amber-300">
              {subTab === 'highlights'
                ? isEn
                  ? 'Saved Highlights & Quotations'
                  : 'محفوظ شدہ ہائی لائٹس و اہم اقتباسات'
                : isEn
                ? 'Hand-Drawn Page Annotations'
                : 'قلمی یادداشتیں و کتابی حواشی'}
            </h2>
          </div>
          <p className="text-xs text-stone-300 font-sans mt-1">
            {subTab === 'highlights'
              ? isEn
                ? 'All inspiring scholarly excerpts and highlights saved from the 12 volumes'
                : 'کتاب احتساب ناصبیت کی ۱۲ جلدوں سے مطالعے کے دوران منتخب و ہائی لائٹ کیے گئے تمام اقتباسات'
              : isEn
              ? 'Freehand canvas drawings, highlights, and annotations directly drawn on book pages'
              : 'کتاب کے صفحات پر براہ راست قلم سے کھینچے گئے نشانات، لکیریں اور اہم حواشی'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          {subTab === 'highlights' && highlights.length > 0 && (
            <>
              <button
                onClick={handleExportText}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEn ? 'Export All' : 'فائل محفوظ کریں'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(isEn ? 'Are you sure you want to delete all highlights?' : 'کیا آپ واقعی تمام ہائی لائٹس ختم کرنا چاہتے ہیں؟')) {
                    onClearAllHighlights();
                  }
                }}
                className="flex items-center gap-1 px-3 py-2 bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-stone-800 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Clear All' : 'تمام صاف کریں'}</span>
              </button>
            </>
          )}

          {subTab === 'drawings' && drawings.length > 0 && (
            <button
              onClick={handleClearAllDrawings}
              className="flex items-center gap-1 px-3 py-2 bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-stone-800 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Clear All Drawings' : 'تمام ڈرائنگز مٹائیں'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Sub-Tab Switcher */}
      <div className="flex items-center gap-2 bg-stone-900/90 border border-stone-800 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setSubTab('highlights')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            subTab === 'highlights'
              ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
        >
          <Highlighter className="w-4 h-4" />
          <span>{isEn ? `Text Highlights (${highlights.length})` : `تحریری ہائی لائٹس (${highlights.length})`}</span>
        </button>

        <button
          onClick={() => setSubTab('drawings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            subTab === 'drawings'
              ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>{isEn ? `Drawings & Annotations (${drawings.length})` : `قلمی یادداشتیں (${drawings.length})`}</span>
        </button>
      </div>

      {/* Filter and Search Bar for Highlights */}
      {subTab === 'highlights' && highlights.length > 0 && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={`w-4 h-4 text-stone-400 absolute ${isEn ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search through highlighted text or notes...' : 'ہائی لائٹ شدہ تحریر یا نوٹس تلاش کریں...'}
                className={`w-full bg-stone-950 border border-stone-800 rounded-xl ${isEn ? 'pl-9 pr-3' : 'pr-9 pl-3'} py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500`}
              />
            </div>

            {/* Color Filter */}
            <div className="flex items-center gap-1.5 self-center">
              <span className="text-[11px] text-stone-400 font-sans">{isEn ? 'Color:' : 'رنگ:'}</span>
              <button
                onClick={() => setSelectedColorFilter('all')}
                className={`px-2 py-1 rounded-lg text-xs cursor-pointer ${
                  selectedColorFilter === 'all'
                    ? 'bg-stone-700 text-white font-bold'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                {isEn ? 'All' : 'تمام'}
              </button>
              {['#f59e0b', '#10b981', '#f43f5e', '#0ea5e9'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColorFilter(c)}
                  className={`w-5 h-5 rounded-full border cursor-pointer transition-transform ${
                    selectedColorFilter === c ? 'scale-125 border-white shadow-md' : 'border-stone-800 opacity-60'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HIGHLIGHTS SUB-TAB VIEW */}
      {subTab === 'highlights' && (
        <>
          {highlights.length === 0 ? (
            /* Empty State */
            <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-stone-800/80 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
                <Highlighter className="w-8 h-8" />
              </div>
              <h3 className="font-nastaliq text-xl text-amber-300 font-bold mb-2">
                {isEn ? 'No Highlights Saved Yet' : 'کوئی ہائی لائٹ محفوظ نہیں کی گئی'}
              </h3>
              <p className="text-xs text-stone-400 max-w-md mb-6 leading-relaxed font-sans">
                {isEn
                  ? 'Open any volume in the Reader, select any text or hadith, and click the highlight button to save it here for quick reference.'
                  : 'کسی بھی جلد کے مطالعے کے دوران کسی بھی عبارت، آیت یا حدیث کو ماؤس یا انگلی سے سلیکٹ کریں اور ظاہر ہونے والے ہائی لائٹ بٹن پر کلک کر کے اسے یہاں محفوظ فرمائیں۔'}
              </p>
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg"
              >
                <span>{isEn ? 'Browse Volumes' : 'کتب خانہ ملاحظہ فرمائیں'}</span>
                <ArrowRight className={`w-4 h-4 ${isEn ? '' : 'rotate-180'}`} />
              </button>
            </div>
          ) : filteredHighlights.length === 0 ? (
            <div className="text-center py-10 bg-stone-900/40 rounded-2xl border border-stone-800 text-stone-400 text-xs">
              {isEn ? 'No highlights match your search filter' : 'تلاش کے مطابق کوئی ہائی لائٹ نہیں ملی'}
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredHighlights.map((h) => (
                <div
                  key={h.id}
                  className="bg-stone-900 border border-stone-800 hover:border-amber-700/50 rounded-2xl p-4 sm:p-5 transition-all shadow-lg flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Meta Header: Volume, Page & Delete */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: h.color }}
                        />
                        <span className="font-nastaliq text-amber-300 font-bold text-sm px-2.5 py-0.5 rounded-lg bg-amber-950/40 border border-amber-600/30">
                          {h.volumeTitleUrdu}
                        </span>
                        <span className="text-xs text-stone-400 bg-stone-800 px-2 py-0.5 rounded-md font-sans">
                          {isEn ? `Page ${h.page}` : `صفحہ ${h.page}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(h)}
                          title={isEn ? 'Copy' : 'کاپی کریں'}
                          className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg cursor-pointer"
                        >
                          {copiedId === h.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleShare(h)}
                          title={isEn ? 'Share' : 'شیئر کریں'}
                          className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteHighlight(h.id)}
                          title={isEn ? 'Delete highlight' : 'حذف کریں'}
                          className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Highlighted Quote Text with Color Accent */}
                    <div
                      className="rounded-xl p-3.5 border-r-4 my-2 text-stone-100 text-sm sm:text-base font-nastaliq leading-relaxed"
                      style={{
                        backgroundColor: `${h.color}15`,
                        borderColor: h.color,
                      }}
                    >
                      <p className="leading-loose">"{h.text}"</p>
                    </div>

                    {/* Optional User Note */}
                    {h.note && (
                      <div className="mt-2 p-2.5 bg-stone-950/80 rounded-xl border border-stone-800 text-xs text-stone-300 font-sans">
                        <strong className="text-amber-400 ml-1">{isEn ? 'Note:' : 'نوٹ:'}</strong>
                        {h.note}
                      </div>
                    )}
                  </div>

                  {/* Bottom Jump-to-Reader Button */}
                  <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                    <span className="text-[11px] font-sans">
                      {new Date(h.createdAt).toLocaleDateString(isEn ? 'en-US' : 'ur-PK')}
                    </span>

                    <button
                      onClick={() => onOpenInReader(h.volumeId, h.page)}
                      className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold cursor-pointer py-1 px-3 bg-stone-800/80 hover:bg-stone-700 rounded-xl border border-stone-700 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? `Open in Reader (p. ${h.page})` : `ریڈر میں کھولیں (صفحہ ${h.page})`}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* DRAWINGS SUB-TAB VIEW */}
      {subTab === 'drawings' && (
        <>
          {drawings.length === 0 ? (
            /* Empty State for Drawings */
            <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-stone-800/80 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
                <PenTool className="w-8 h-8" />
              </div>
              <h3 className="font-nastaliq text-xl text-amber-300 font-bold mb-2">
                {isEn ? 'No Drawings or Annotations Saved Yet' : 'کوئی قلمی یادداشت محفوظ نہیں کی گئی'}
              </h3>
              <p className="text-xs text-stone-400 max-w-md mb-6 leading-relaxed font-sans">
                {isEn
                  ? 'Open any volume in the Reader, activate the Draw mode with the Pen icon, and draw freehand annotations or margin notes on the pages.'
                  : 'کسی بھی جلد کو ریڈر میں کھولیں، ٹول بار میں موجود "قلم / ڈرا" بٹن دبائیں اور کتاب کے صفحے پر آزادانہ لکیریں، دائرے یا قلمی نوٹس کھینچ کر محفوظ فرمائیں۔'}
              </p>
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg"
              >
                <span>{isEn ? 'Browse Volumes' : 'کتب خانہ ملاحظہ فرمائیں'}</span>
                <ArrowRight className={`w-4 h-4 ${isEn ? '' : 'rotate-180'}`} />
              </button>
            </div>
          ) : filteredDrawings.length === 0 ? (
            <div className="text-center py-10 bg-stone-900/40 rounded-2xl border border-stone-800 text-stone-400 text-xs">
              {isEn ? 'No drawings match your search filter' : 'تلاش کے مطابق کوئی قلمی ڈرائنگ نہیں ملی'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDrawings.map((d) => (
                <div
                  key={d.id}
                  className="bg-stone-900 border border-stone-800 hover:border-amber-700/50 rounded-2xl p-4 transition-all shadow-lg flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Title, Page, and Delete */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-nastaliq text-amber-300 font-bold text-sm px-2.5 py-0.5 rounded-lg bg-amber-950/40 border border-amber-600/30">
                          {d.volumeTitleUrdu}
                        </span>
                        <span className="text-xs text-stone-400 bg-stone-800 px-2 py-0.5 rounded-md font-sans">
                          {isEn ? `Page ${d.page}` : `صفحہ ${d.page}`}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteDrawing(d.id)}
                        title={isEn ? 'Delete annotation' : 'حذف کریں'}
                        className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Canvas Thumbnail Preview */}
                    <div className="w-full h-44 rounded-xl bg-stone-950 border border-stone-800/80 p-2 flex items-center justify-center overflow-hidden relative shadow-inner">
                      <img
                        src={d.dataUrl}
                        alt={`جلد ${d.volumeNumber} صفحہ ${d.page}`}
                        className="max-w-full max-h-full object-contain filter drop-shadow"
                      />
                      <div className="absolute bottom-2 left-2 bg-stone-900/90 border border-stone-800 text-[10px] text-amber-300 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        ص {d.page}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                    <span className="text-[11px] font-sans">
                      {new Date(d.updatedAt).toLocaleDateString(isEn ? 'en-US' : 'ur-PK')}
                    </span>

                    <button
                      onClick={() => onOpenInReader(d.volumeId, d.page)}
                      className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold cursor-pointer py-1 px-3 bg-stone-800/80 hover:bg-stone-700 rounded-xl border border-stone-700 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? `Open in Reader (p. ${d.page})` : `ریڈر میں کھولیں (صفحہ ${d.page})`}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
