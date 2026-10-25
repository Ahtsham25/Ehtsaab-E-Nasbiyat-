import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  Highlighter,
  Eraser,
  RotateCcw,
  Trash2,
  Save,
  Check,
  X,
  Eye,
  EyeOff,
  Palette,
  Minus,
  Maximize2
} from 'lucide-react';
import {
  getDrawingForPage,
  saveDrawingForPage,
  deleteDrawingForPage,
} from '../utils/drawingStorage';
import { DrawingAnnotation } from '../types/book';

interface CanvasDrawerProps {
  volumeId: number;
  volumeNumber: number;
  volumeTitleUrdu: string;
  currentPage: number;
  isDrawMode: boolean;
  onCloseDrawMode: () => void;
  onSaved?: (annotation: DrawingAnnotation) => void;
}

type DrawTool = 'pen' | 'highlighter' | 'eraser';

const COLOR_PALETTE = [
  { name: 'سونہری (Gold)', color: '#f59e0b' },
  { name: 'زمردی (Emerald)', color: '#10b981' },
  { name: 'سرخ (Ruby)', color: '#ef4444' },
  { name: 'نیلا (Sky)', color: '#06b6d4' },
  { name: 'سفید (White)', color: '#ffffff' },
  { name: 'سیاہ (Black)', color: '#18181b' },
];

const BRUSH_SIZES = [
  { label: 'باریک', size: 2 },
  { label: 'درمیانہ', size: 5 },
  { label: 'موٹا', size: 10 },
  { label: 'مارکر', size: 18 },
];

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const CanvasDrawer: React.FC<CanvasDrawerProps> = ({
  volumeId,
  volumeNumber,
  volumeTitleUrdu,
  currentPage,
  isDrawMode,
  onCloseDrawMode,
  onSaved,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTool, setActiveTool] = useState<DrawTool>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#f59e0b');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [hasContent, setHasContent] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Keep a ref to avoid stale closures in event listeners
  const stateRef = useRef({
    activeTool,
    selectedColor,
    brushSize,
    isDrawing: false,
    lastPoint: null as { x: number; y: number } | null,
    volumeId,
    volumeNumber,
    volumeTitleUrdu,
    currentPage,
  });

  useEffect(() => {
    stateRef.current = {
      activeTool,
      selectedColor,
      brushSize,
      isDrawing,
      lastPoint,
      volumeId,
      volumeNumber,
      volumeTitleUrdu,
      currentPage,
    };
  }, [activeTool, selectedColor, brushSize, isDrawing, lastPoint, volumeId, volumeNumber, volumeTitleUrdu, currentPage]);

  // Load drawing for current page
  const loadPageDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const savedData = getDrawingForPage(volumeId, currentPage);
    if (savedData) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasContent(true);
        setUndoStack([savedData]);
      };
      img.src = savedData;
    } else {
      setHasContent(false);
      setUndoStack([]);
    }
  }, [volumeId, currentPage]);

  // Handle canvas sizing with high DPI
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const newWidth = Math.floor(rect.width * dpr);
    const newHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      // Preserve existing content during resize
      let prevData: string | null = null;
      try {
        prevData = canvas.toDataURL('image/png');
      } catch {}

      canvas.width = newWidth;
      canvas.height = newHeight;

      if (prevData && prevData.length > 100) {
        const img = new Image();
        const ctx = canvas.getContext('2d');
        img.onload = () => {
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        };
        img.src = prevData;
      } else {
        loadPageDrawing();
      }
    }
  }, [loadPageDrawing]);

  // Initial resize and listener
  useEffect(() => {
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  // Re-load on volume/page change
  useEffect(() => {
    loadPageDrawing();
  }, [volumeId, currentPage, loadPageDrawing]);

  // Coordinates calculation
  const getCoordinates = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    } else {
      return null;
    }

    return {
      x: (clientX - rect.left) * dpr,
      y: (clientY - rect.top) * dpr,
    };
  };

  // Push current canvas state to undo stack
  const pushStateToUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setUndoStack((prev) => [...prev.slice(-14), dataUrl]);
      setHasContent(true);

      // Auto-save to localStorage
      const savedItem = saveDrawingForPage(
        volumeId,
        volumeNumber,
        volumeTitleUrdu,
        currentPage,
        dataUrl
      );
      if (savedItem && onSaved) {
        onSaved(savedItem);
      }
    } catch (e) {
      console.error('Error saving canvas state', e);
    }
  };

  // Start Drawing
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawMode || !isVisible) return;
    if ('touches' in e) {
      // Touch event: stop propagation and prevent default scroll
      e.stopPropagation();
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setLastPoint(coords);

    // Single click dot
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    const dpr = window.devicePixelRatio || 1;
    const effectiveSize = brushSize * dpr;

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, effectiveSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = hexToRgba(selectedColor, 0.35);
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, effectiveSize * 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = selectedColor;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, effectiveSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // Drawing in progress
  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawMode || !isVisible) return;
    if ('touches' in e) {
      e.stopPropagation();
    }

    const coords = getCoordinates(e);
    if (!coords || !lastPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const effectiveSize = brushSize * dpr;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = effectiveSize * 3;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = hexToRgba(selectedColor, 0.35);
      ctx.lineWidth = effectiveSize * 3.2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = effectiveSize;
    }

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    ctx.restore();

    setLastPoint(coords);
  };

  // End Drawing
  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPoint(null);
    pushStateToUndo();
  };

  // Undo Action
  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStack.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newStack = [...undoStack];
    newStack.pop(); // remove current

    if (newStack.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setUndoStack([]);
      setHasContent(false);
      deleteDrawingForPage(volumeId, currentPage);
    } else {
      const prevState = newStack[newStack.length - 1];
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setUndoStack(newStack);
        saveDrawingForPage(volumeId, volumeNumber, volumeTitleUrdu, currentPage, prevState);
      };
      img.src = prevState;
    }
  };

  // Clear Canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (confirm('کیا آپ اس صفحے کی تمام قلمی تحریر و ڈرائنگ مٹانا چاہتے ہیں؟')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setUndoStack([]);
      setHasContent(false);
      deleteDrawingForPage(volumeId, currentPage);
    }
  };

  // Explicit Save Button
  const handleManualSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const savedItem = saveDrawingForPage(
        volumeId,
        volumeNumber,
        volumeTitleUrdu,
        currentPage,
        dataUrl
      );
      if (savedItem && onSaved) {
        onSaved(savedItem);
      }
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (e) {
      console.error('Error saving drawing', e);
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
    >
      {/* HTML5 Overlay Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleStartDraw}
        onMouseMove={handleDraw}
        onMouseUp={handleEndDraw}
        onMouseLeave={handleEndDraw}
        onTouchStart={handleStartDraw}
        onTouchMove={handleDraw}
        onTouchEnd={handleEndDraw}
        onTouchCancel={handleEndDraw}
        className={`w-full h-full block ${
          isDrawMode && isVisible
            ? 'pointer-events-auto cursor-crosshair touch-none'
            : isVisible
            ? 'pointer-events-none opacity-90'
            : 'hidden'
        }`}
        style={{
          touchAction: isDrawMode && isVisible ? 'none' : 'auto',
        }}
      />

      {/* FLOATING DRAWING TOOLBAR (VISIBLE WHEN DRAW MODE IS ACTIVE) */}
      {isDrawMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex flex-col items-center gap-1.5 max-w-[96vw]">
          {/* Main Controls Card */}
          <div className="bg-stone-900/95 backdrop-blur-md border border-amber-600/40 rounded-2xl p-2 sm:p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex items-center gap-2 sm:gap-3 flex-wrap justify-center text-xs">
            {/* Tool Selection: Pen / Highlighter / Eraser */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                title="قلم (Pen)"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTool === 'pen'
                    ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                    : 'text-stone-300 hover:text-amber-300 hover:bg-stone-800'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">قلم</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('highlighter')}
                title="ہائی لائٹر (Translucent Marker)"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTool === 'highlighter'
                    ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                    : 'text-stone-300 hover:text-amber-300 hover:bg-stone-800'
                }`}
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">ہائی لائٹر</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('eraser')}
                title="مٹائیں (Eraser)"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTool === 'eraser'
                    ? 'bg-rose-600 text-white shadow-md font-bold'
                    : 'text-stone-300 hover:text-rose-400 hover:bg-stone-800'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">مٹائیں</span>
              </button>
            </div>

            {/* Color Palette (Active if not eraser) */}
            {activeTool !== 'eraser' && (
              <div className="flex items-center gap-1.5 bg-stone-950 px-2 py-1 rounded-xl border border-stone-800">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setSelectedColor(c.color)}
                    title={c.name}
                    className={`w-5 h-5 rounded-full border cursor-pointer transition-transform ${
                      selectedColor === c.color
                        ? 'scale-125 border-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                        : 'border-stone-700 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
            )}

            {/* Brush Thickness Selector */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
              {BRUSH_SIZES.map((b) => (
                <button
                  key={b.size}
                  type="button"
                  onClick={() => setBrushSize(b.size)}
                  title={b.label}
                  className={`px-2 py-1 rounded-lg text-[11px] font-sans cursor-pointer transition-colors ${
                    brushSize === b.size
                      ? 'bg-amber-600 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Utility Actions: Undo, Clear, Save, Done */}
            <div className="flex items-center gap-1 border-r border-stone-800 pr-1.5">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title="پچھلا عمل واپس کریں (Undo)"
                className="p-1.5 text-stone-300 hover:text-amber-400 hover:bg-stone-800 disabled:opacity-30 rounded-lg cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={!hasContent && undoStack.length === 0}
                title="صفحہ کی ڈرائنگ صاف کریں (Clear Page)"
                className="p-1.5 text-stone-300 hover:text-rose-400 hover:bg-stone-800 disabled:opacity-30 rounded-lg cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleManualSave}
                title="محفوظ کریں (Save Drawing)"
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">محفوظ کریں</span>
              </button>

              <button
                type="button"
                onClick={onCloseDrawMode}
                title="ڈرائنگ مکمل، بند کریں"
                className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-lg cursor-pointer text-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>مکمل</span>
              </button>
            </div>
          </div>

          {/* Quick Info Badge & Toast */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-stone-950/80 border border-stone-800 text-stone-300 px-3 py-0.5 rounded-full backdrop-blur-sm shadow-md font-sans">
              قلم موڈ فعال ہے — صفحہ {currentPage} پر آزادانہ نوٹس یا لکیریں کھینچیں
            </span>

            {savedToast && (
              <span className="text-[11px] bg-emerald-950 border border-emerald-500 text-emerald-300 px-3 py-0.5 rounded-full font-bold shadow-lg animate-fade-in flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                محفوظ ہو گیا!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Toggle Visibility Pill when Draw mode is OFF but page has drawings */}
      {!isDrawMode && hasContent && (
        <div className="absolute top-3 left-3 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            title={isVisible ? 'قلمی نوٹس چھپائیں' : 'قلمی نوٹس دکھائیں'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-600/40 text-xs shadow-lg backdrop-blur-md cursor-pointer transition-colors"
          >
            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-sans">
              {isVisible ? 'قلمی نوٹس چھپائیں' : 'قلمی نوٹس دکھائیں'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
