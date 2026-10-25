import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Highlighter,
  Type,
  Download,
  Save,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Share2,
  FileText,
  Palette,
  Columns2,
  Info
} from 'lucide-react';
import { VolumeData } from '../types/book';
import { BOOK_VOLUMES_CONTENT, ChapterItem } from '../data/bookContent';

interface DualPageEditorModalProps {
  volume: VolumeData;
  currentPage: number;
  onClose: () => void;
  onPageChange?: (page: number) => void;
}

export interface PageNote {
  id: string;
  text: string;
  theme: 'gold' | 'emerald' | 'amber' | 'slate';
  createdAt: string;
}

interface StoredPageEdits {
  canvasData?: string;
  notes: PageNote[];
}

const HIGHLIGHT_COLORS = [
  { label: 'سنہری زرد', value: '#eab308' },
  { label: 'امبر نارنجی', value: '#f97316' },
  { label: 'زمردی سبز', value: '#10b981' },
  { label: 'گلابی سرخ', value: '#f43f5e' },
  { label: 'فیروزی نیلا', value: '#06b6d4' },
];

export const DualPageEditorModal: React.FC<DualPageEditorModalProps> = ({
  volume,
  currentPage: initialPage,
  onClose,
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [titleViewMode, setTitleViewMode] = useState<'cover' | 'page1'>('cover');

  // Tool states: 'read' | 'highlight' | 'text'
  const [activeTool, setActiveTool] = useState<'read' | 'highlight' | 'text'>('highlight');
  const [highlightColor, setHighlightColor] = useState<string>('#eab308');
  const [brushSize, setBrushSize] = useState<number>(24);

  // Notes state
  const [notes, setNotes] = useState<PageNote[]>([]);
  const [newNoteInput, setNewNoteInput] = useState<string>('');
  const [newNoteTheme, setNewNoteTheme] = useState<'gold' | 'emerald' | 'amber' | 'slate'>('gold');

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const [historySteps, setHistorySteps] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const storageKey = `ehtisab_dual_editor_${volume.id}_p_${currentPage}`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Content for volume
  const volumeContent = BOOK_VOLUMES_CONTENT[volume.volumeNumber] || BOOK_VOLUMES_CONTENT[1];
  const chapters: ChapterItem[] = volumeContent.chapters || [];
  const foundChapter = [...chapters].reverse().find((c: ChapterItem) => c.page <= currentPage) || chapters[0];
  const totalPages = volume.pageCount > 0 ? volume.pageCount : 560;

  // Load saved edits for current page
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: StoredPageEdits = JSON.parse(raw);
        setNotes(parsed.notes || []);
        if (parsed.canvasData && canvasRef.current) {
          const img = new Image();
          img.onload = () => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.drawImage(img, 0, 0);
              setHistorySteps([parsed.canvasData!]);
            }
          };
          img.src = parsed.canvasData;
        } else {
          clearCanvas();
        }
      } else {
        setNotes([]);
        clearCanvas();
      }
    } catch {
      setNotes([]);
      clearCanvas();
    }
  }, [currentPage, volume.id]);

  // Resize canvas to match container
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      // Save current content before resize
      const prevData = canvas.toDataURL();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (prevData && prevData.length > 100) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
        };
        img.src = prevData;
      }
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [currentPage]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHistorySteps([]);
    }
  };

  // Canvas drawing handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'highlight') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save previous snapshot for undo
    setHistorySteps((prev) => [...prev.slice(-10), canvas.toDataURL()]);

    const coords = getCanvasCoords(e);
    isDrawingRef.current = true;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.4;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || activeTool !== 'highlight') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.closePath();
    }
    // Auto-save
    saveEdits();
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || historySteps.length === 0) return;
    const previous = historySteps[historySteps.length - 1];
    setHistorySteps((prev) => prev.slice(0, -1));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (previous) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = previous;
    }
    saveEdits();
  };

  // Add note
  const handleAddNote = () => {
    if (!newNoteInput.trim()) return;
    const noteItem: PageNote = {
      id: 'note_' + Date.now(),
      text: newNoteInput.trim(),
      theme: newNoteTheme,
      createdAt: new Date().toLocaleTimeString('ur-PK'),
    };
    const updated = [noteItem, ...notes];
    setNotes(updated);
    setNewNoteInput('');
    saveEdits(updated);
    showToast('حاشیہ شامل کر دیا گیا ہے');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveEdits(updated);
    showToast('حاشیہ خارج کر دیا گیا');
  };

  // Insert standard scholarly citation template
  const handleInsertCitation = () => {
    const citation = `[سند و حوالہ: کتاب احتساب ناصبیت، جلد ${volume.volumeNumber} (${volume.volumeTitleUrdu})، صفحہ نمبر ${currentPage}]`;
    setNewNoteInput((prev) => (prev ? `${prev}\n${citation}` : citation));
  };

  // Save edits to localStorage
  const saveEdits = (notesToSave?: PageNote[]) => {
    try {
      const canvas = canvasRef.current;
      const canvasData = canvas ? canvas.toDataURL() : undefined;
      const data: StoredPageEdits = {
        canvasData,
        notes: notesToSave || notes,
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save page edits', e);
    }
  };

  const handleExplicitSave = () => {
    saveEdits();
    showToast('صفحہ کی تمام ہائی لائٹس اور حواشی محفوظ ہو چکے ہیں!');
  };

  const handleNavigatePage = (newPage: number) => {
    const clamped = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(clamped);
    if (onPageChange) {
      onPageChange(clamped);
    }
  };

  // Generate and export high-resolution citation reference card (PNG)
  const handleExportCitationCard = async () => {
    setIsExporting(true);
    showToast('سند کارڈ تیار ہو رہا ہے...');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // 1600 x 950 px high-res card
      canvas.width = 1600;
      canvas.height = 950;

      // 1. Background: Deep luxury Islamic stone
      ctx.fillStyle = '#0c0a09';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle gradient vignette
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer gold border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Inner thin gold border
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

      // 2. Top Header Ribbon
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(30, 30, canvas.width - 60, 90);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(30, 118, canvas.width - 60, 2);

      // Header Text
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('سند و حوالہ برائے علمی مباحثہ و مناظرہ — احتساب ناصبیت', canvas.width / 2, 75);

      ctx.fillStyle = '#a8a29e';
      ctx.font = '16px sans-serif';
      ctx.fillText(`جلد ${volume.volumeNumber}: ${volume.volumeTitleUrdu} — ${volume.topic} | صفحہ نمبر ${currentPage}`, canvas.width / 2, 105);

      // 3. Left Section: Title Page & Sanad metadata (Width: 620px)
      const leftX = 50;
      const contentY = 140;
      const contentH = 720;

      ctx.fillStyle = '#171513';
      ctx.fillRect(leftX, contentY, 620, contentH);
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2;
      ctx.strokeRect(leftX, contentY, 620, contentH);

      // Title Page Badge
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(leftX + 20, contentY + 20, 220, 36);
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('کتاب کا ٹائٹل پیج (سندِ ثبوت)', leftX + 130, contentY + 44);

      // Draw Cover image
      const coverImg = new Image();
      coverImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        coverImg.onload = () => resolve();
        coverImg.onerror = () => resolve(); // continue if fails
        coverImg.src = volume.coverImageUrl;
      });

      if (coverImg.naturalWidth) {
        ctx.drawImage(coverImg, leftX + 40, contentY + 75, 260, 370);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(leftX + 40, contentY + 75, 260, 370);
      }

      // Metadata info beside / below cover
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`کتاب: احتساب ناصبیت (۱۲ جلدیں)`, leftX + 590, contentY + 110);

      ctx.fillStyle = '#e7e5e4';
      ctx.font = '16px sans-serif';
      ctx.fillText(`جلد: ${volume.volumeTitleUrdu} (جلد ${volume.volumeNumber})`, leftX + 590, contentY + 150);
      ctx.fillText(`موضوع: ${volume.topic.substring(0, 30)}...`, leftX + 590, contentY + 185);
      ctx.fillText(`صفحات کی کل تعداد: ${totalPages}`, leftX + 590, contentY + 220);
      ctx.fillText(`آرکائیو کوڈ: ${volume.archiveItemId}`, leftX + 590, contentY + 255);

      // Official Sanad Stamp Box
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(leftX + 30, contentY + 475, 560, 180);
      ctx.strokeStyle = '#451a03';
      ctx.strokeRect(leftX + 30, contentY + 475, 560, 180);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('تصدیق نامہ و سند حوالہ', leftX + 560, contentY + 510);

      ctx.fillStyle = '#a8a29e';
      ctx.font = '14px sans-serif';
      ctx.fillText('یہ حوالہ احتساب ناصبیت کے مستند ایڈیشن کے سرورق اور اصل متن پر مبنی ہے۔', leftX + 560, contentY + 540);
      ctx.fillText('مناظرے و علمی تحقیق میں بلا خوف و تردد پیش کیا جا سکتا ہے۔', leftX + 560, contentY + 570);
      ctx.fillText(`تاریخِ تصدیق: ${new Date().toLocaleDateString('ur-PK')}`, leftX + 560, contentY + 600);

      // 4. Right Section: Target Page with Text & Notes (Width: 840px)
      const rightX = 710;
      ctx.fillStyle = '#171513';
      ctx.fillRect(rightX, contentY, 840, contentH);
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2;
      ctx.strokeRect(rightX, contentY, 840, contentH);

      // Page Badge
      ctx.fillStyle = '#78350f';
      ctx.fillRect(rightX + 600, contentY + 20, 210, 36);
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`اصل صفحہ نمبر: ${currentPage}`, rightX + 705, contentY + 44);

      // Bismillah
      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', rightX + 420, contentY + 50);

      // Chapter title
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(foundChapter.title, rightX + 420, contentY + 95);

      // Quran / Hadith quote
      if (foundChapter.arabicVerse) {
        ctx.fillStyle = '#fef08a';
        ctx.font = 'italic 18px sans-serif';
        ctx.fillText(`"${foundChapter.arabicVerse}"`, rightX + 420, contentY + 140);
      }

      // Paragraph lines
      ctx.textAlign = 'right';
      ctx.fillStyle = '#e7e5e4';
      ctx.font = '16px sans-serif';
      let textY = contentY + 190;
      const paragraphs = foundChapter.content || [];
      for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
        const line = paragraphs[i].substring(0, 85);
        ctx.fillText(line, rightX + 800, textY);
        textY += 32;
        const line2 = paragraphs[i].substring(85, 170);
        if (line2) {
          ctx.fillText(line2, rightX + 800, textY);
          textY += 32;
        }
      }

      // Draw drawn highlights on top if present
      const currentCanvas = canvasRef.current;
      if (currentCanvas) {
        ctx.globalAlpha = 0.55;
        ctx.drawImage(currentCanvas, rightX + 20, contentY + 60, 800, 380);
        ctx.globalAlpha = 1.0;
      }

      // Scholar Notes / Hawaashi Section at bottom of page
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(rightX + 30, contentY + 450, 780, 230);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rightX + 30, contentY + 450, 780, 230);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 17px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('تحقیقی حواشی و تبصرہ محقق (Scholarly Notes):', rightX + 780, contentY + 485);

      if (notes.length === 0) {
        ctx.fillStyle = '#78716c';
        ctx.font = '14px sans-serif';
        ctx.fillText('اس صفحے پر براہ راست کوئی اضافی حاشیہ درج نہیں ہے۔', rightX + 780, contentY + 520);
      } else {
        let noteY = contentY + 520;
        notes.slice(0, 3).forEach((n, idx) => {
          ctx.fillStyle = '#fef3c7';
          ctx.font = '14px sans-serif';
          ctx.fillText(`• ${n.text.substring(0, 80)}`, rightX + 780, noteY);
          noteY += 28;
          if (n.text.length > 80) {
            ctx.fillText(`  ${n.text.substring(80, 160)}`, rightX + 780, noteY);
            noteY += 28;
          }
        });
      }

      // Footer bar
      ctx.fillStyle = '#a8a29e';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('تیار کردہ بذریعہ احتساب ناصبیت ڈیجیٹل لائبریری ایپ — جملہ حقوق محفوظ ہیں', canvas.width / 2, canvas.height - 35);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `Sanad_Ihtisab_Jild_${volume.volumeNumber}_Page_${currentPage}.png`;
      downloadLink.click();

      showToast('سند کارڈ کامیابی سے ڈاؤن لوڈ ہو گیا!');
    } catch (err) {
      console.error('Export error', err);
      showToast('تصویر بنانے میں رکاوٹ پیش آئی۔');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col font-sans select-none overflow-hidden"
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-60 bg-stone-900 border border-amber-500/80 text-amber-300 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="flex-none bg-stone-900/95 border-b border-stone-800 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-xl z-30">
        {/* Title & Volume info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Columns2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-nastaliq text-lg sm:text-xl font-bold text-amber-300 leading-tight">
                لینڈسکیپ سند ساز و صفحہ ایڈیٹر
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px]">
                سند + مطلوبہ صفحہ
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 font-sans">
              {volume.volumeTitleUrdu} (جلد {volume.volumeNumber}) • مطلوبہ صفحہ{' '}
              <span className="font-mono text-amber-400 font-bold">{currentPage}</span>
            </p>
          </div>
        </div>

        {/* Toolbar: Tools, Highlighter Palette, Save & Export */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tool Switcher */}
          <div className="flex items-center bg-stone-950 rounded-xl p-1 border border-stone-800">
            <button
              onClick={() => setActiveTool('highlight')}
              title="ہائی لائٹر موڈ"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTool === 'highlight'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ہائی لائٹر</span>
            </button>

            <button
              onClick={() => setActiveTool('text')}
              title="حواشی و ٹیکسٹ ایڈیٹر موڈ"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTool === 'text'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ٹیکسٹ ایڈیٹر</span>
            </button>
          </div>

          {/* Highlighter Color Picker (when highlight tool active) */}
          {activeTool === 'highlight' && (
            <div className="hidden sm:flex items-center gap-1 bg-stone-950/90 rounded-xl px-2 py-1 border border-stone-800">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setHighlightColor(c.value)}
                  title={c.label}
                  className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                    highlightColor === c.value ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}

              <div className="h-4 w-px bg-stone-800 mx-1" />

              {/* Undo Button */}
              <button
                onClick={handleUndo}
                title="پچھلا ہائی لائٹ ختم کریں (Undo)"
                className="p-1 text-stone-400 hover:text-amber-400 rounded cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Citation Button */}
          <button
            onClick={handleInsertCitation}
            title="خودکار سند و حوالہ کا فقرہ شامل کریں"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs font-semibold border border-stone-700 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>حوالہ درج کریں</span>
          </button>

          {/* Export Reference Card as PNG */}
          <button
            onClick={handleExportCitationCard}
            disabled={isExporting}
            title="سند کارڈ (تصویر) ڈاؤن لوڈ کریں"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 cursor-pointer transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">سند کارڈ محفوظ کریں</span>
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            title="ایڈیٹر بند کریں"
            className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-xl border border-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Dual-Page Workspace */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="max-w-[1700px] mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* ======================================================== */}
          {/* PANE 1: TITLE PAGE / COVER (سند و ثبوت - پہلا صفحہ) */}
          {/* ======================================================== */}
          <div className="bg-stone-900/90 border border-amber-900/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Top Badge & Switcher */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    کتاب کا ٹائٹل پیج (سند و ثبوت)
                  </span>
                  <span className="text-xs text-stone-400 font-sans">
                    جلد {volume.volumeNumber} کا باضابطہ سرورق
                  </span>
                </div>

                <div className="flex items-center bg-stone-950 rounded-xl p-0.5 border border-stone-800 text-xs">
                  <button
                    onClick={() => setTitleViewMode('cover')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      titleViewMode === 'cover'
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    سرورق (Cover)
                  </button>
                  <button
                    onClick={() => setTitleViewMode('page1')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      titleViewMode === 'page1'
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    مقدمہ (Page 1)
                  </button>
                </div>
              </div>

              {/* View 1: Cover Image & Scholarly Metadata */}
              {titleViewMode === 'cover' ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-5 bg-stone-950/70 p-4 rounded-2xl border border-stone-800">
                    {/* Cover Image in ornate frame */}
                    <div className="relative w-44 sm:w-52 h-64 sm:h-76 flex-none rounded-xl overflow-hidden shadow-2xl border-2 border-amber-600/50 bg-stone-950">
                      <img
                        src={volume.coverImageUrl}
                        alt={volume.volumeTitleUrdu}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/20 pointer-events-none" />
                    </div>

                    {/* Book Metadata Sheet */}
                    <div className="flex-1 space-y-2.5 text-right w-full">
                      <div>
                        <span className="text-[11px] text-amber-500/80 font-sans block">کتاب کا مکمل نام:</span>
                        <h3 className="font-nastaliq text-2xl font-bold text-amber-300">
                          احتساب ناصبیت (۱۲ جلدیں)
                        </h3>
                      </div>

                      <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5 text-xs font-sans">
                        <div className="flex justify-between">
                          <span className="text-stone-400">جلد نمبر:</span>
                          <span className="font-bold text-amber-300">{volume.volumeTitleUrdu} ({volume.volumeNumber})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">موضوع:</span>
                          <span className="text-stone-200 line-clamp-1">{volume.topic}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">کل صفحات:</span>
                          <span className="font-mono text-emerald-400 font-bold">{totalPages} صفحات</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">سند درجہ:</span>
                          <span className="text-emerald-300 font-semibold">مستند تاریخی و کلامی ایڈیشن</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">آرکائیو شناختی کوڈ:</span>
                          <span className="font-mono text-stone-300 text-[10px]">{volume.archiveItemId}</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-400 font-sans leading-relaxed">
                        نوٹ: جب آپ لینڈسکیپ موڈ میں سند کارڈ برآمد کرتے ہیں تو یہ ٹائٹل پیج اور حوالہ جات ایک ساتھ ثبوت کے طور پر ایک ہی تصویر میں محفوظ ہو جاتے ہیں۔
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* View 2: Foreword / Page 1 Text */
                <div className="bg-stone-950/70 p-5 rounded-2xl border border-stone-800 space-y-3 font-nastaliq text-stone-200 text-sm leading-loose">
                  <div className="text-center font-arabic text-amber-400 text-lg mb-2">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                  <h4 className="text-center text-lg font-bold text-amber-300">
                    مقدمۃ التحقیق — {volume.volumeTitleUrdu}
                  </h4>
                  <p className="text-justify indent-4 text-stone-300">
                    {volumeContent.foreword ||
                      'الحمد لله رب العالمين والصلاة والسلام على سيد الأنبياء والمرسلين وعلى آله الطيبين الطاهرين۔ زیر نظر جلد ناصبیت کے فکری و تاریخی انحرافات کے تحقیقی و تجزیاتی مطالعے پر مشتمل ہے۔'}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Proof Assurance Stamp */}
            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400 font-sans">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>سند اور ٹائٹل منسلک ہے</span>
              </span>
              <span className="text-stone-500">
                مطلوبہ صفحہ کے ساتھ ایک ہی فریم میں
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PANE 2: TARGET PAGE BEING EDITED & ANNOTATED */}
          {/* ======================================================== */}
          <div className="bg-stone-900/90 border border-amber-900/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div>
              {/* Target Page Header & Page Jump */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold">
                    مطلوبہ زیرِ مطالعہ صفحہ: {currentPage}
                  </span>
                  <span className="text-xs text-stone-400 font-sans">
                    (ہائی لائٹنگ و حواشی فعال ہیں)
                  </span>
                </div>

                {/* Page Jump buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleNavigatePage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    title="پچھلا صفحہ"
                    className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:text-amber-400 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-xs text-amber-300 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => handleNavigatePage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    title="اگلا صفحہ"
                    className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:text-amber-400 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Target Page Content with Canvas Overlay for Freehand Highlighting */}
              <div className="relative rounded-2xl border border-stone-800 bg-[#161412] p-5 sm:p-7 min-h-[360px] shadow-inner select-text">
                {/* Canvas Overlay for Highlighter */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className={`absolute inset-0 z-20 w-full h-full rounded-2xl ${
                    activeTool === 'highlight' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
                  }`}
                />

                {/* Actual Page Text Content */}
                <div className="relative z-10 space-y-4">
                  {/* Bismillah Header */}
                  <div className="text-center font-arabic text-amber-400/90 text-sm">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>

                  {/* Chapter Title */}
                  <h3 className="font-nastaliq text-xl font-bold text-amber-300 text-center leading-snug">
                    {foundChapter.title}
                  </h3>

                  {/* Arabic Quote */}
                  {foundChapter.arabicVerse && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/30 text-center">
                      <p className="font-arabic text-lg text-amber-300 leading-relaxed font-bold">
                        "{foundChapter.arabicVerse}"
                      </p>
                      {foundChapter.translation && (
                        <p className="text-xs text-stone-400 font-sans mt-1">
                          ترجمہ: {foundChapter.translation}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Page Text Paragraphs */}
                  <div className="font-nastaliq text-stone-200 text-base leading-loose space-y-3">
                    {foundChapter.content.map((p: string, idx: number) => (
                      <p key={idx} className="indent-4 text-justify">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scholarly Notes & Marginalia Editor (حواشی و تعلیقات) */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Type className="w-4 h-4 text-amber-400" />
                    <span>تحقیقی حواشی و تعلیقات ({notes.length})</span>
                  </div>

                  <button
                    onClick={handleInsertCitation}
                    className="text-[11px] text-amber-400 hover:underline font-sans cursor-pointer"
                  >
                    + سند کا فقرہ شامل کریں
                  </button>
                </div>

                {/* New Note Input Box */}
                <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 space-y-2">
                  <textarea
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="اس صفحے کے متعلق اپنا علمی نوٹ، حوالہ، یا تشریح تحریر فرمائیں..."
                    rows={2}
                    className="w-full bg-stone-900/90 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 font-nastaliq resize-none"
                  />

                  <div className="flex items-center justify-between gap-2">
                    {/* Theme selector for note badge */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-stone-400 font-sans">رنگ:</span>
                      <button
                        onClick={() => setNewNoteTheme('gold')}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                          newNoteTheme === 'gold' ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        سنہری
                      </button>
                      <button
                        onClick={() => setNewNoteTheme('emerald')}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                          newNoteTheme === 'emerald' ? 'bg-emerald-600 text-white font-bold' : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        زمردی
                      </button>
                      <button
                        onClick={() => setNewNoteTheme('slate')}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                          newNoteTheme === 'slate' ? 'bg-stone-700 text-white font-bold' : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        سادہ
                      </button>
                    </div>

                    <button
                      onClick={handleAddNote}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold font-sans cursor-pointer shadow transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>حاشیہ جوڑیں</span>
                    </button>
                  </div>
                </div>

                {/* Display Existing Notes */}
                {notes.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2 transition-all ${
                          note.theme === 'gold'
                            ? 'bg-amber-950/40 border-amber-600/40 text-amber-200'
                            : note.theme === 'emerald'
                            ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
                            : 'bg-stone-900 border-stone-700 text-stone-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-nastaliq leading-relaxed">{note.text}</p>
                          <span className="text-[10px] opacity-70 font-sans block">{note.createdAt}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-stone-400 hover:text-rose-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Save & Status Bar */}
            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">
                تبدیلیاں خودکار طور پر براؤزر میں محفوظ ہوتی ہیں
              </span>
              <button
                onClick={handleExplicitSave}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 font-semibold cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>محفوظ کریں</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
