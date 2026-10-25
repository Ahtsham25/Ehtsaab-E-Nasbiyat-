import React, { useState } from 'react';
import { Download, CheckCircle, FileText, HardDrive, Sparkles, AlertCircle } from 'lucide-react';
import { VolumeData } from '../types/book';

interface DownloadsTabProps {
  volumes: VolumeData[];
  onDownload: (volume: VolumeData) => void;
  onRead: (volume: VolumeData) => void;
}

export const DownloadsTab: React.FC<DownloadsTabProps> = ({
  volumes,
  onDownload,
  onRead,
}) => {
  const [filter, setFilter] = useState<'all' | 'downloaded' | 'pending'>('all');

  const downloadedVolumes = volumes.filter((v) => v.isDownloaded);
  const pendingVolumes = volumes.filter((v) => !v.isDownloaded);

  const displayedVolumes =
    filter === 'downloaded'
      ? downloadedVolumes
      : filter === 'pending'
      ? pendingVolumes
      : volumes;

  const handleDownloadAll = () => {
    // Trigger downloads for each volume sequentially or open links
    volumes.forEach((vol, idx) => {
      setTimeout(() => {
        onDownload(vol);
      }, idx * 600);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Downloads Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950/70 border border-amber-900/40 rounded-2xl p-5 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-5 h-5 text-amber-400" />
              <h2 className="font-nastaliq text-2xl font-bold text-amber-300">
                ڈاؤن لوڈ مینیجر (۱۲ جلدیں)
              </h2>
            </div>
            <p className="text-xs text-stone-300 font-sans max-w-xl">
              کتاب احتساب ناصبیت کی تمام ۱۲ جلدیں پی ڈی ایف فارمیٹ میں ڈاؤن لوڈ کریں اور بغیر انٹرنیٹ کے آف لائن مطالعہ فرمائیں۔
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>تمام ۱۲ جلدیں ڈاؤن لوڈ کریں</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-800/80 text-center">
          <div className="bg-stone-900/70 p-2.5 rounded-xl border border-stone-800">
            <span className="text-[11px] text-stone-400 block">کل جلدیں</span>
            <span className="font-bold text-lg text-amber-300">۱۲</span>
          </div>
          <div className="bg-stone-900/70 p-2.5 rounded-xl border border-stone-800">
            <span className="text-[11px] text-stone-400 block">ڈاؤن لوڈ شدہ</span>
            <span className="font-bold text-lg text-emerald-400">{downloadedVolumes.length}</span>
          </div>
          <div className="bg-stone-900/70 p-2.5 rounded-xl border border-stone-800">
            <span className="text-[11px] text-stone-400 block">مجموعی سائز</span>
            <span className="font-bold text-lg text-stone-200">~۴۲۰ MB</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-amber-600 text-stone-950 font-bold'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          تمام جلدیں ({volumes.length})
        </button>
        <button
          onClick={() => setFilter('downloaded')}
          className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
            filter === 'downloaded'
              ? 'bg-emerald-600 text-white font-bold'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          محفوظ شدہ کتب ({downloadedVolumes.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-600 text-stone-950 font-bold'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          ڈاؤن لوڈ کے لیے دستیاب ({pendingVolumes.length})
        </button>
      </div>

      {/* List of Volumes */}
      <div className="space-y-3">
        {displayedVolumes.map((volume) => {
          return (
            <div
              key={volume.id}
              className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-700/40 transition-colors shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-14 rounded-lg bg-stone-950 border border-stone-700/60 overflow-hidden flex-shrink-0 flex items-center justify-center text-center p-1">
                  {volume.coverImageUrl ? (
                    <img
                      src={volume.coverImageUrl}
                      alt={volume.volumeTitleUrdu}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="font-nastaliq text-[10px] text-amber-300">
                      {volume.volumeTitleUrdu}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-nastaliq text-base font-bold text-amber-200">
                      {volume.volumeTitleUrdu}: {volume.topic}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                    <span>{volume.pageCount} صفحات</span>
                    <span>•</span>
                    <span>سائز: {volume.fileSize}</span>
                    <span>•</span>
                    <span className="text-[11px] text-emerald-400 font-sans">
                      مکمل پی ڈی ایف ایڈیشن
                    </span>
                    {volume.lastReadPage && volume.lastReadPage > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-medium">
                          مطالعہ: {Math.round((volume.lastReadPage / volume.pageCount) * 100)}% (ص {volume.lastReadPage})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {volume.isDownloaded && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-600/40 px-2.5 py-1.5 rounded-xl">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>ڈاؤن لوڈ مکمل</span>
                  </span>
                )}

                <button
                  onClick={() => onRead(volume)}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-xl transition-colors cursor-pointer"
                >
                  آن لائن پڑھیں
                </button>

                <button
                  onClick={() => onDownload(volume)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ڈاؤن لوڈ پی ڈی ایف</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful Download Instructions */}
      <div className="mt-8 p-4 bg-stone-900/50 border border-stone-800/80 rounded-2xl text-xs text-stone-400 space-y-2">
        <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
          <AlertCircle className="w-4 h-4" />
          <span>اہم رہنمائی برائے آف لائن مطالعہ:</span>
        </div>
        <p>
          ڈاؤن لوڈ بٹن دبانے کے بعد متعلقہ جلد کی پی ڈی ایف فائل خود بخود آپ کے ڈیوائس میں محفوظ ہو جائے گی۔ آپ اسے اپنے موبائل کے کسی بھی پی ڈی ایف ریڈر یا اس ایپ کے اندر انٹرنل ریڈر میں باآسانی کھول سکتے ہیں۔
        </p>
      </div>
    </div>
  );
};
