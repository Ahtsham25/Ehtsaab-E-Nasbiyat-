import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle2,
  ShieldAlert,
  HeartHandshake,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  FileCheck2,
  Clock,
  BookMarked,
  Link2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { VolumeData, getReadingProgress } from '../types/book';
import { DEFAULT_VOLUMES } from '../data/defaultVolumes';
import { Language, TRANSLATIONS, ENGLISH_VOLUME_DATA } from '../i18n/translations';

interface AboutTabProps {
  volumes?: VolumeData[];
  lang?: Language;
}

export const AboutTab: React.FC<AboutTabProps> = ({ volumes = DEFAULT_VOLUMES, lang = 'ur' }) => {
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);
  const t = TRANSLATIONS[lang];
  const isEn = lang === 'en';

  const handleCopyAdminUrl = () => {
    const url = `${window.location.origin}/admin.html`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedAdminLink(true);
        setTimeout(() => setCopiedAdminLink(false), 2500);
      }).catch(() => {
        setCopiedAdminLink(true);
        setTimeout(() => setCopiedAdminLink(false), 2500);
      });
    } else {
      setCopiedAdminLink(true);
      setTimeout(() => setCopiedAdminLink(false), 2500);
    }
  };

  // Calculate reading statistics
  const totalVolumes = volumes.length;
  const completedVolumes = volumes.filter(
    (v) => (v.lastReadPage || 0) >= (v.pageCount || 1)
  ).length;
  const inProgressVolumes = volumes.filter(
    (v) => (v.lastReadPage || 0) > 0 && (v.lastReadPage || 0) < (v.pageCount || 1)
  ).length;
  const remainingVolumes = totalVolumes - completedVolumes - inProgressVolumes;

  const totalPages = volumes.reduce((acc, v) => acc + (v.pageCount || 0), 0);
  const totalPagesRead = volumes.reduce((acc, v) => acc + Math.min(v.lastReadPage || 0, v.pageCount || 0), 0);
  const remainingPages = Math.max(0, totalPages - totalPagesRead);
  const overallProgressPct = totalPages > 0 ? Math.round((totalPagesRead / totalPages) * 100) : 0;

  // Pie chart data: Books Read vs Remaining
  const pieData = [
    { name: isEn ? 'Completed Books' : 'مکمل کتب (Read)', value: completedVolumes, color: '#10b981' },
    { name: isEn ? 'In Progress' : 'زیرِ مطالعہ (In Progress)', value: inProgressVolumes, color: '#f59e0b' },
    { name: isEn ? 'Remaining' : 'باقی کتب (Remaining)', value: remainingVolumes, color: '#44403c' },
  ].filter((item) => item.value > 0);

  // If user hasn't started any book yet, show informative placeholder slice
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: isEn ? 'Remaining Books' : 'غیر مطالعہ شدہ (Remaining)', value: 12, color: '#44403c' }
  ];

  // Bar chart data: 12 Volumes Read vs Remaining Pages
  const barData = volumes.map((vol) => {
    const read = Math.min(vol.lastReadPage || 0, vol.pageCount || 0);
    const rem = Math.max(0, (vol.pageCount || 0) - read);
    return {
      name: vol.volumeTitleUrdu,
      readPages: read,
      remainingPages: rem,
      totalPages: vol.pageCount,
      percentage: getReadingProgress(vol.lastReadPage, vol.pageCount),
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-tr from-emerald-950 via-stone-900 to-amber-950/80 border border-amber-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden islamic-pattern-bg">
        <div className="relative z-10">
          <span className="text-xs font-sans tracking-widest text-amber-400 uppercase bg-amber-950/70 border border-amber-600/30 px-3 py-1 rounded-full">
            تعارف و پس منظر
          </span>
          <h2 className="font-nastaliq text-3xl sm:text-4xl font-bold text-amber-200 mt-3 leading-relaxed">
            کتابِ مستطاب "احتسابِ ناصبیت"
          </h2>
          <p className="font-nastaliq text-lg sm:text-xl text-emerald-300 mt-1">
            مکمل ۱۲ ضخیم جلدوں پر مشتمل فکری و تحقیقی شاہکار
          </p>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mt-4 max-w-2xl font-sans">
            "احتساب ناصبیت" امت مسلمہ کے ان فکری فتنوں کے خلاف ایک عظیم الشان، غیر جانبدار اور مدلل علمی دستاویز ہے جس میں معتبر کتبِ اہلسنت و جماعت، تفاسیر، کتبِ احادیث، اسماء الرجال اور تاریخ اسلام کے ٹھوس حوالوں سے ناصبیت کا مکمل محاکمہ کیا گیا ہے۔
          </p>
        </div>
      </div>

      {/* READING STATISTICS SECTION (with recharts) */}
      <section className="bg-stone-900/90 border border-amber-900/40 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-950/80 rounded-xl border border-amber-600/30 text-amber-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-nastaliq text-2xl font-bold text-amber-300">
                مطالعہ کے شماریات و بصری چارٹس (Reading Statistics)
              </h3>
            </div>
            <p className="text-xs text-stone-400 font-sans mt-1">
              کتب کا مطالعہ: پڑھا گیا حصہ بمقابلہ باقی صفحات اور جلدوں کا مکمل گرافیکل تجزیہ
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-950 px-3.5 py-1.5 rounded-xl border border-stone-800 text-xs">
            <span className="text-stone-400">مجموعی مطالعہ:</span>
            <span className="text-emerald-400 font-bold font-mono text-sm">{overallProgressPct}%</span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-xs">مکمل کتب</span>
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {completedVolumes} <span className="text-xs text-stone-500 font-sans">/ ۱۲</span>
            </div>
            <span className="text-[11px] text-stone-400 mt-1">۱۰۰٪ مکمل مطالعہ</span>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-xs">زیرِ مطالعہ</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">
              {inProgressVolumes} <span className="text-xs text-stone-500 font-sans">/ ۱۲</span>
            </div>
            <span className="text-[11px] text-stone-400 mt-1">جاری کتب</span>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-xs">پڑھے گئے صفحات</span>
              <BookMarked className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-stone-100 font-mono">
              {totalPagesRead.toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-400 mt-1">از {totalPages.toLocaleString()} کل صفحات</span>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-xs">باقی صفحات</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-stone-300 font-mono">
              {remainingPages.toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-400 mt-1">مطالعہ کے منتظر</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Chart 1: Donut Pie Chart (Books Read vs Remaining) */}
          <div className="lg:col-span-5 bg-stone-950/90 border border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-between">
            <div className="w-full text-center pb-2 border-b border-stone-800/80">
              <span className="font-nastaliq text-base font-bold text-amber-300 block">
                کتب کی پیش رفت کا تناسب (Books Status)
              </span>
              <span className="text-[11px] text-stone-400">مکمل شدہ بمقابلہ باقی کتب</span>
            </div>

            <div className="w-full h-56 relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {displayPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#44403c',
                      borderRadius: '0.75rem',
                      color: '#f5f5f4',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Medallion Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-bold font-mono text-amber-400">{overallProgressPct}%</span>
                <span className="text-[10px] text-stone-400 font-sans">مطالعہ مکمل</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="w-full flex flex-wrap justify-center gap-3 text-xs pt-2 border-t border-stone-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-stone-300">مکمل ({completedVolumes})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-stone-300">جاری ({inProgressVolumes})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-stone-700"></span>
                <span className="text-stone-400">باقی ({remainingVolumes})</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Stacked Bar Chart (12 Volumes Read vs Remaining Pages) */}
          <div className="lg:col-span-7 bg-stone-950/90 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="pb-2 border-b border-stone-800/80 flex items-center justify-between">
              <div>
                <span className="font-nastaliq text-base font-bold text-amber-300 block">
                  تمام ۱۲ جلدوں کے صفحات کا گراف (Pages per Volume)
                </span>
                <span className="text-[11px] text-stone-400">سبز: پڑھے گئے صفحات | سرمئی: باقی صفحات</span>
              </div>
            </div>

            <div className="w-full h-64 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#78716c"
                    fontSize={10}
                    tick={{ fill: '#d6d3d1' }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis stroke="#78716c" fontSize={10} tick={{ fill: '#a8a29e' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#44403c',
                      borderRadius: '0.75rem',
                      color: '#f5f5f4',
                      fontSize: '11px',
                      direction: 'rtl',
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'readPages') return [`${value} صفحات`, 'پڑھے گئے'];
                      if (name === 'remainingPages') return [`${value} صفحات`, 'باقی صفحات'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="readPages" stackId="a" fill="#10b981" name="readPages" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="remainingPages" stackId="a" fill="#292524" stroke="#44403c" name="remainingPages" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[11px] text-stone-400 pt-2 border-t border-stone-800/80">
              <span>گراف پر ماؤس لے جا کر تفصیلی صفحات دیکھ سکتے ہیں</span>
              <span className="text-amber-400 font-mono">کل کتب: ۱۲</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-600/30 flex items-center justify-center text-amber-400 mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-nastaliq text-lg font-bold text-amber-300 mb-1">
            ۱۲ ضخیم جلدیں
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed font-sans">
            مجموعی طور پر تقریباً ۷۰۰۰ سے زائد صفحات پر مشتمل جامع تحقیقی مواد اور ہزاروں معتبر اسناد۔
          </p>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-600/30 flex items-center justify-center text-emerald-400 mb-3">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-nastaliq text-lg font-bold text-emerald-300 mb-1">
            محبتِ اہل بیتؑ و صحابہؓ
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed font-sans">
            افراط و تفریط سے پاک، مسلکِ اعتدال اور صحابہ کرام و اہل بیت اطہار کے مابین سچی الفت کا بیان۔
          </p>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-600/30 flex items-center justify-center text-rose-400 mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-nastaliq text-lg font-bold text-rose-300 mb-1">
            ردِ شبہات و فتن
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed font-sans">
            دورِ قدیم و جدید کے ناصبی لٹریچر کا محدثانہ تجزیہ اور عام فہم و مسکت رد و ابطال۔
          </p>
        </div>
      </div>

      {/* Chapters Outline */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6">
        <h3 className="font-nastaliq text-2xl font-bold text-amber-300 mb-4 pb-2 border-b border-stone-800">
          ۱۲ جلدوں کا اجمالی نقشہ
        </h3>
        <ul className="space-y-3 text-xs sm:text-sm text-stone-300">
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۱:</span>
            <span>تعریف ناصبیت، لغوی و اصطلاحی معنی اور ابتدائی دور کے تاریخی اسباب۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۲:</span>
            <span>قرآن مجید کی آیاتِ تطہیر، مباہلہ اور مودت کے تحت اہل بیت کے قطعی فضائل۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۳:</span>
            <span>امیر المؤمنین حضرت علی المرتضیٰؓ کی شان، خلافت اور دشمنانِ علی کے اعتراضات کا رد۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۴:</span>
            <span>حدیث غدیر، حدیث ثقلین، حدیث سفینہ اور ولایت کے مباحث پر مفصل تحقیق۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۵:</span>
            <span>سیدہ فاطمۃ الزہراء سلام اللہ علیہا کی طہارت و عظمت اور مقام خاتونِ جنت۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۶:</span>
            <span>سیدنا امام حسن مجتبیٰ علیہ السلام کی صلح کے حقیقی دینی مقاصد اور نتائج۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۷:</span>
            <span>قیام امام عالی مقام سید الشہداء امام حسین علیہ السلام اور واقعہ کربلا کے حقائق۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۸:</span>
            <span>یزید بن معاویہ کے فسق و فجور پر ائمہ اہلسنت کے اقوال اور وکلائے یزید کا محاکمہ۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۹:</span>
            <span>واقعہ حرہ میں مدینہ طیبہ کی توہین اور مسجد نبوی کی بے حرمتی کے تاریخی شواہد۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۱۰:</span>
            <span>اہل بیت اور صحابہ کرام کی باہمی رشتہ داریاں، مودت اور ناصبیت کا قلع قمع۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۱۱:</span>
            <span>برصغیر اور عرب دنیا کے معاصر ناصبی لٹریچر اور گمراہ کن رسائل کا مکمل جواب۔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-400 min-w-[70px]">جلد ۱۲:</span>
            <span>خاتمہ التحقیق، فتاویٰ مشائخ و فقہاء، اور تفصیلی اشاریہ کتب و اسماء الرجال۔</span>
          </li>
        </ul>
      </div>

      {/* Admin Portal Link (Discreetly placed for admin access to update Archive.org links) */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-600/30 text-amber-400">
                <Link2 className="w-4 h-4" />
              </span>
              <h4 className="font-nastaliq text-xl font-bold text-amber-300">
                {isEn ? 'Admin Portal Link (Update Book Links)' : 'ایڈمن پورٹل لنک (برائے اپڈیٹ لنکس)'}
              </h4>
            </div>
            <p className="text-xs text-stone-400 font-sans max-w-xl">
              {isEn
                ? 'External web portal URL where the admin can paste Archive.org book covers and PDF URLs to update the 12 volumes.'
                : 'مخصوص ویب پورٹل جہاں آپ انٹرنیٹ آرکائیو (Archive.org) سے حاصل کردہ کتب و سرورق کے لنکس پیسٹ کر کے ایپ کو اپڈیٹ کر سکتے ہیں۔'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyAdminUrl}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedAdminLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-sans">{isEn ? 'Copied!' : 'لنک کاپی ہو گیا'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-sans">{isEn ? 'Copy Admin URL' : 'ایڈمن لنک کاپی کریں'}</span>
                </>
              )}
            </button>

            <a
              href="/admin.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-md"
            >
              <span className="font-sans">{isEn ? 'Open Admin Portal' : 'پورٹل کھولیں'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
