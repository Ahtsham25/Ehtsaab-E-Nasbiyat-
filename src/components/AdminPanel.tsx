import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Download, Upload, ExternalLink, Image as ImageIcon, FileText, Check, AlertCircle, Sparkles, Eye } from 'lucide-react';
import { VolumeData } from '../types/book';
import { DEFAULT_VOLUMES, STORAGE_KEY } from '../data/defaultVolumes';
import { extractArchiveId, generateArchiveThumbnail, generateArchiveDownload } from '../utils/archiveUtils';

interface AdminPanelProps {
  volumes: VolumeData[];
  onSaveVolumes: (updatedVolumes: VolumeData[]) => void;
  onResetVolumes: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  volumes,
  onSaveVolumes,
  onResetVolumes,
}) => {
  const [editableVolumes, setEditableVolumes] = useState<VolumeData[]>(volumes);
  const [selectedVolId, setSelectedVolId] = useState<number>(1);
  const [saveToast, setSaveToast] = useState(false);
  const [quickArchiveUrl, setQuickArchiveUrl] = useState('');

  const currentVol = editableVolumes.find((v) => v.id === selectedVolId) || editableVolumes[0];

  const handleFieldChange = (field: keyof VolumeData, value: any) => {
    setEditableVolumes((prev) =>
      prev.map((v) => (v.id === selectedVolId ? { ...v, [field]: value } : v))
    );
  };

  // Helper when user pastes an archive link into the quick helper for current volume
  const handleApplyQuickArchive = () => {
    if (!quickArchiveUrl) return;
    const archiveId = extractArchiveId(quickArchiveUrl);
    if (archiveId) {
      const thumb = generateArchiveThumbnail(archiveId);
      const pdf = generateArchiveDownload(archiveId);
      setEditableVolumes((prev) =>
        prev.map((v) =>
          v.id === selectedVolId
            ? {
                ...v,
                archiveItemId: archiveId,
                coverImageUrl: thumb,
                pdfUrl: pdf,
              }
            : v
        )
      );
      setQuickArchiveUrl('');
    }
  };

  const handleSave = () => {
    onSaveVolumes(editableVolumes);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(editableVolumes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ihtisab_nasbiyat_12_volumes.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length === 12) {
          setEditableVolumes(parsed);
          onSaveVolumes(parsed);
          alert('کامیابی: ۱۲ جلدوں کا ڈیٹا کامیابی سے درآمد اور محفوظ کر دیا گیا ہے!');
        } else {
          alert('خرابی: منتخب کردہ فائل میں مکمل ۱۲ جلدوں کا درست ڈیٹا موجود نہیں ہے۔');
        }
      } catch (err) {
        alert('خرابی: JSON فائل پڑھنے میں نقص واقع ہوا۔');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce border border-emerald-400">
          <Check className="w-4 h-4" />
          <span>تمام ۱۲ جلدوں کے لنکس اور ترامیم ایپ میں کامیابی سے محفوظ ہو گئی ہیں!</span>
        </div>
      )}

      {/* Admin Panel Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/60 to-stone-900 border border-amber-800/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            <h2 className="font-nastaliq text-2xl sm:text-3xl font-bold text-amber-300">
              ایڈمن پینل برائے کتب و آرکائیو لنکس
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            یہاں آپ تمام ۱۲ جلدوں کے آرکائیو امیج لنکس، پی ڈی ایف لنکس اور عناوین براہ راست پیسٹ کر کے اپڈیٹ کر سکتے ہیں۔
          </p>
        </div>

        {/* Global Save and Reset Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>محفوظ کریں (Save)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('کیا آپ تمام ۱۲ جلدوں کے لنکس اصل بنیادی حالت پر بحال کرنا چاہتے ہیں؟')) {
                onResetVolumes();
                setEditableVolumes(DEFAULT_VOLUMES);
              }
            }}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-2.5 rounded-xl text-xs transition-colors border border-stone-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ری سیٹ</span>
          </button>

          <a
            href="/admin.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <span>admin.html فائل</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Volume Selector Tabs (1 to 12) */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 shadow-md">
        <span className="text-[11px] text-stone-400 block mb-2 px-1">
          جلد منتخب کریں برائے ترمیم (۱ تا ۱۲):
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
          {editableVolumes.map((vol) => (
            <button
              key={vol.id}
              onClick={() => setSelectedVolId(vol.id)}
              className={`py-2 px-1 rounded-xl text-xs text-center font-nastaliq transition-all cursor-pointer ${
                vol.id === selectedVolId
                  ? 'bg-amber-600 text-stone-950 font-bold border border-amber-400 shadow-md scale-105'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-amber-200'
              }`}
            >
              {vol.volumeTitleUrdu}
            </button>
          ))}
        </div>
      </div>

      {/* Main Volume Editor Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
        {/* Left/Preview Column: Live Image Preview & PDF Link Test */}
        <div className="lg:col-span-4 flex flex-col items-center gap-4">
          <div className="w-full">
            <span className="text-xs font-semibold text-stone-300 block mb-2 text-center">
              لائیو امیج پریویو (Live Image Preview)
            </span>
            <div className="w-full aspect-[3/4.2] rounded-xl overflow-hidden border-2 border-dashed border-amber-600/40 bg-stone-950 flex flex-col items-center justify-center p-2 relative shadow-inner">
              {currentVol.coverImageUrl ? (
                <img
                  src={currentVol.coverImageUrl}
                  alt={`جلد ${currentVol.volumeNumber}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      const msg = document.createElement('div');
                      msg.className = 'text-center p-3 text-rose-400 text-xs';
                      msg.innerText = 'تصویر لوڈ نہیں ہو سکی! برائے مہربانی درست امیج لنک درج کریں۔';
                      parent.appendChild(msg);
                    }
                  }}
                />
              ) : (
                <div className="text-center p-4 text-stone-500 flex flex-col items-center gap-2">
                  <ImageIcon className="w-10 h-10 text-stone-600" />
                  <span className="text-xs">
                    امیج کا لنک پیسٹ کریں، یہاں فوری تصویر شو ہو جائے گی۔
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Test PDF Buttons */}
          <div className="w-full space-y-2">
            <a
              href={currentVol.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 py-2.5 px-3 rounded-xl text-xs transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>پی ڈی ایف لنک ٹیسٹ کریں (اوپن کریں)</span>
            </a>

            <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-[11px] text-stone-400 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                آپ آرکائیو (Archive.org) کا ڈائریکٹ امیج لنک، پی ڈی ایف لنک یا کوئی بھی کلاؤڈ لنک درج کر سکتے ہیں۔
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Input Fields for this Volume */}
        <div className="lg:col-span-8 space-y-4">
          {/* Quick Archive URL Helper */}
          <div className="bg-stone-950/90 border border-amber-600/30 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>آرکائیو لنک آٹو جنریٹر (Auto-fill from Archive.org URL):</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickArchiveUrl}
                onChange={(e) => setQuickArchiveUrl(e.target.value)}
                placeholder="مثلاً: https://archive.org/details/ehtisab-e-nasbiyat-vol-01 یا صرف آئی ڈی"
                className="flex-1 bg-stone-900 border border-stone-700 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none font-mono"
              />
              <button
                onClick={handleApplyQuickArchive}
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer whitespace-nowrap"
              >
                آٹو فل کریں
              </button>
            </div>
            <p className="text-[10px] text-stone-400">
              اگر آپ آرکائیو کی مکمل لنک پیسٹ کریں گے تو یہ امیج اور پی ڈی ایف لنک خود بخود بنا دے گا۔
            </p>
          </div>

          {/* Volume Title & Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-300 mb-1 font-semibold">
                جلد کا عنوان (مثلاً: جلد اول، جلد دوم)
              </label>
              <input
                type="text"
                value={currentVol.volumeTitleUrdu}
                onChange={(e) => handleFieldChange('volumeTitleUrdu', e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-amber-300 font-nastaliq"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-300 mb-1 font-semibold">
                جلد نمبر (1 تا 12)
              </label>
              <input
                type="number"
                value={currentVol.volumeNumber}
                onChange={(e) => handleFieldChange('volumeNumber', parseInt(e.target.value) || 1)}
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-stone-200"
              />
            </div>
          </div>

          {/* Cover Image URL input */}
          <div>
            <label className="block text-xs text-stone-300 mb-1 font-semibold flex items-center justify-between">
              <span>آرکائیو سرورق/امیج کا لنک (Archive Image Link):</span>
              <span className="text-[10px] text-amber-400">فوری لائیو شو ہوگا</span>
            </label>
            <input
              type="text"
              value={currentVol.coverImageUrl}
              onChange={(e) => handleFieldChange('coverImageUrl', e.target.value)}
              placeholder="https://archive.org/services/img/your-item-id"
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 font-mono"
            />
          </div>

          {/* PDF Link input */}
          <div>
            <label className="block text-xs text-stone-300 mb-1 font-semibold flex items-center justify-between">
              <span>پی ڈی ایف فائل کا لنک (Archive PDF Download Link):</span>
              <span className="text-[10px] text-emerald-400">براہ راست ڈاؤن لوڈ لنک</span>
            </label>
            <input
              type="text"
              value={currentVol.pdfUrl}
              onChange={(e) => handleFieldChange('pdfUrl', e.target.value)}
              placeholder="https://archive.org/download/your-item-id/volume.pdf"
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 font-mono"
            />
          </div>

          {/* Topic / Subject */}
          <div>
            <label className="block text-xs text-stone-300 mb-1 font-semibold">
              جلد کا موضوع / خلاصہ عنوان:
            </label>
            <input
              type="text"
              value={currentVol.topic}
              onChange={(e) => handleFieldChange('topic', e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-stone-100 font-nastaliq"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-stone-300 mb-1 font-semibold">
              تفصیل و مشمولات:
            </label>
            <textarea
              rows={2}
              value={currentVol.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 font-sans"
            />
          </div>

          {/* Pages & File Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-300 mb-1 font-semibold">
                صفحات کی تعداد:
              </label>
              <input
                type="number"
                value={currentVol.pageCount}
                onChange={(e) => handleFieldChange('pageCount', parseInt(e.target.value) || 0)}
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-300 mb-1 font-semibold">
                فائل سائز (مثلاً: 34 MB):
              </label>
              <input
                type="text"
                value={currentVol.fileSize}
                onChange={(e) => handleFieldChange('fileSize', e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-stone-200"
              />
            </div>
          </div>

          {/* Save Button for Current Volume */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>تمام ۱۲ جلدوں کی تبدیلیاں ایپ میں محفوظ کریں</span>
            </button>
          </div>
        </div>
      </div>

      {/* JSON Backup Export / Import */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
        <div>
          <span className="font-semibold text-stone-200 block">ڈیٹا بیک اپ اور بحالی (Backup & Restore):</span>
          <span>آپ اپنے لنکس کی مکمل فائل ڈاؤن لوڈ کر سکتے ہیں یا محفوظ شدہ فائل دوبارہ لوڈ کر سکتے ہیں۔</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-xl transition-colors cursor-pointer border border-stone-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>بیک اپ ایکسپورٹ (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-xl transition-colors cursor-pointer border border-stone-700">
            <Upload className="w-3.5 h-3.5" />
            <span>امپورٹ کریں</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
