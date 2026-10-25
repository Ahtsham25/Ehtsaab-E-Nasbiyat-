import React, { useState } from 'react';
import { Shield, Lock, FileCheck, Info, Mail, Globe, CheckCircle } from 'lucide-react';

export const PrivacyPolicyTab: React.FC = () => {
  const [lang, setLang] = useState<'ur' | 'en'>('ur');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Privacy Policy Header */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950/60 to-stone-900 border border-emerald-900/40 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="font-nastaliq text-2xl sm:text-3xl font-bold text-amber-300">
              پرائیویسی پالیسی و شرائطِ استعمال
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Privacy Policy & Terms of Service for Ihtisab-e-Nasbiyat Application
          </p>
        </div>

        {/* Language switch */}
        <div className="flex items-center bg-stone-900 rounded-xl p-1 border border-stone-800 self-start sm:self-center">
          <button
            onClick={() => setLang('ur')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
              lang === 'ur'
                ? 'bg-amber-600 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            اردو میں پڑھیں
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
              lang === 'en'
                ? 'bg-amber-600 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            English Version
          </button>
        </div>
      </div>

      {lang === 'ur' ? (
        /* Urdu Privacy Policy */
        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
          {/* Card 1: Introduction */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="font-nastaliq text-lg font-bold text-amber-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>۱. بنیادی تعارف و مقصد</span>
            </h3>
            <p>
              یہ ایپلی کیشن خالصتاً اسلامی، دینی، اور علمی تحقیق کے فروغ کے لیے تیار کی گئی ہے تاکہ قارئین کرام "احتساب ناصبیت" کی مکمل ۱۲ جلدوں کا آسانی کے ساتھ آن لائن مطالعہ اور آف لائن پی ڈی ایف ڈاؤن لوڈ کر سکیں۔ ہمارا مقصد دینی و علمی کتب تک عوامی رسائی کو سہل بنانا ہے۔
            </p>
          </div>

          {/* Card 2: User Data & Privacy */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="font-nastaliq text-lg font-bold text-amber-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>۲. صارف کے ذاتی کوائف کا مکمل تحفظ (No Data Collection)</span>
            </h3>
            <p>
              یہ ایپلی کیشن صارفین کی کسی قسم کی نجی معلومات، جیسے نام، موبائل نمبر، رابطہ، ای میل، یا جغرافیائی لوکیشن وغیرہ ہرگز جمع نہیں کرتی۔
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-400 pr-2">
              <li>کوئی پاس ورڈ یا رجسٹریشن کی شرط نہیں ہے۔</li>
              <li>صارفین کا کوئی بھی ڈیٹا کسی تیسرے فریق کو فروخت یا شیئر نہیں کیا جاتا۔</li>
              <li>ایپ میں کوئی نقصان دہ یا ٹریکنگ کوڈ موجود نہیں ہے۔</li>
            </ul>
          </div>

          {/* Card 3: Local Storage */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="font-nastaliq text-lg font-bold text-amber-300 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>۳. لوکل سٹوریج اور بک مارکس</span>
            </h3>
            <p>
              آپ کے محفوظ کردہ بُک مارکس، آخری پڑھے گئے صفحات، اور ایڈمن پینل کے کسٹم لنکس آپ کے اپنے موبائل یا براؤزر کے محفوظ لوکل سٹوریج (LocalStorage) میں رہتے ہیں۔ یہ ڈیٹا آپ کے ڈیوائس سے باہر نہیں جاتا اور ایپ یا براؤزر ہسٹری کلیئر کرنے پر ڈیلیٹ ہو سکتا ہے۔
            </p>
          </div>

          {/* Card 4: Archive.org Hosting */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="font-nastaliq text-lg font-bold text-amber-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>۴. انٹرنیٹ آرکائیو (Archive.org) سے روابط</span>
            </h3>
            <p>
              اس ایپ میں موجود پی ڈی ایف کتب اور سرورق کے لنکس انٹرنیٹ آرکائیو (Archive.org) سے حاصل کیے گئے ہیں جو کہ ایک معروف عالمی غیر منافع بخش ڈیجیٹل لائبریری ہے۔ پی ڈی ایف پڑھتے یا ڈاؤن لوڈ کرتے وقت صارف انٹرنیٹ آرکائیو کے سرور سے مستفید ہوتا ہے۔
            </p>
          </div>

          {/* Card 5: App Permissions */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="font-nastaliq text-lg font-bold text-amber-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>۵. مطلوبہ اجازت نامے (App Permissions)</span>
            </h3>
            <ul className="space-y-1.5 text-stone-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span><strong>انٹرنیٹ رسائی (Internet Access):</strong> کتب کے آن لائن مطالعے اور پی ڈی ایف ڈاؤن لوڈ کرنے کے لیے۔</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span><strong>اسٹوریج رسائی (Storage Access):</strong> ڈاؤن لوڈ کردہ پی ڈی ایف فائل کو آپ کے موبائل ڈاؤن لوڈز میں محفوظ کرنے کے لیے۔</span>
              </li>
            </ul>
          </div>

          {/* Card 6: Contact & Support */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="font-nastaliq text-lg font-bold text-amber-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>۶. رابطہ اور تجاویز</span>
            </h3>
            <p>
              اگر آپ کو کسی لنک میں خرابی نظر آئے، یا آپ کوئی مفید تجویز دینا چاہیں، تو آپ ہم سے رابطہ فرما سکتے ہیں۔
            </p>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center gap-2 text-stone-300">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>رابطہ ای میل: contact@ihtisab-e-nasbiyat.app</span>
            </div>
          </div>
        </div>
      ) : (
        /* English Privacy Policy */
        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed font-sans" dir="ltr">
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>1. Introduction & Purpose</span>
            </h3>
            <p>
              This application is developed solely for educational, scholarly, and Islamic research purposes. It provides free, accessible online reading and PDF downloading for the 12-volume scholarly book set titled <em>Ihtisab-e-Nasbiyat</em> (احتساب ناصبیت).
            </p>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>2. No Personal Data Collection</span>
            </h3>
            <p>
              We value your privacy. This application does not collect, track, store, or transmit any personally identifiable information (PII), such as names, email addresses, phone numbers, contacts, device identifiers, or GPS locations.
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-400 pl-2">
              <li>No user registration, account creation, or login required.</li>
              <li>No analytics tracking or ad-network profiling scripts.</li>
              <li>No sale or transfer of user data to any third parties.</li>
            </ul>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>3. Local Device Storage</span>
            </h3>
            <p>
              Your reading bookmarks, downloaded states, and admin link configurations are stored locally on your device using standard HTML5 LocalStorage. This data never leaves your device and can be cleared at any time via your browser or device storage settings.
            </p>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>4. Third-Party Hosting (Internet Archive)</span>
            </h3>
            <p>
              The digital PDF files and cover images are hosted on the Internet Archive (Archive.org), a public non-profit digital library. When viewing or downloading PDFs, your connection interacts directly with Archive.org servers.
            </p>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>5. Contact & Support</span>
            </h3>
            <p>
              For any questions regarding this Privacy Policy or book links, please reach out to us:
            </p>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-stone-300 font-mono text-xs">
              contact@ihtisab-e-nasbiyat.app
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
