import React, { useState, useRef } from 'react';
import { Upload, Loader2, Image as ImageIcon, X, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { CATEGORY_DEFAULT_IMAGES } from './adminConstants';

export default function ImagePickerField({ imageUrl, onImageChange, isUploading, onPresetSelect }) {
  const [useUrlInput, setUseUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const presets = [
    { label: 'Splashjet Ink', category: 'Splashjet Inks', path: CATEGORY_DEFAULT_IMAGES['Splashjet Inks'] || '/splashjet_images/ink-cat-desktop-printer.png' },
    { label: 'Printers', category: 'Printers', path: CATEGORY_DEFAULT_IMAGES['Printers'] || '/splashjet_images/ink-cat-large-format.png' },
    { label: 'Photocopy Machine', category: 'Photocopy Machines', path: CATEGORY_DEFAULT_IMAGES['Photocopy Machines'] || '/splashjet_images/category-page-1.jpg' },
    { label: 'Machinery & DTF', category: 'Machinery', path: CATEGORY_DEFAULT_IMAGES['Machinery'] || '/splashjet_images/ink-cat-digital-textile.png' },
    { label: 'POS & Barcode', category: 'POS & Barcode', path: CATEGORY_DEFAULT_IMAGES['POS & Barcode'] || '/splashjet_images/ink-cat-industrial-inkjet.png' },
    { label: 'Toner & Inks', category: 'Toner & Inks', path: CATEGORY_DEFAULT_IMAGES['Toner & Inks'] || '/splashjet_images/ink-cat-desktop-printer.png' },
    { label: 'Accessories & Parts', category: 'Accessories & Parts', path: CATEGORY_DEFAULT_IMAGES['Accessories & Parts'] || '/splashjet_images/grow-your-canon-lfp-ink-business.png' },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          Product Image * <span className="text-[10px] text-slate-400 font-normal">(প্রধান ছবি)</span>
        </label>
        <button
          type="button"
          onClick={() => setUseUrlInput(!useUrlInput)}
          className="text-xs font-semibold text-[#c92127] hover:underline cursor-pointer flex items-center gap-1"
        >
          {useUrlInput ? (
            <>
              <Upload className="w-3 h-3" />
              <span>📁 ফাইল আপলোড মোড</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" />
              <span>🔗 ইমেজ লিংক (Direct URL) দিন</span>
            </>
          )}
        </button>
      </div>

      {!useUrlInput ? (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {isUploading ? (
            <div className="border-2 border-dashed border-[#c92127]/40 rounded-2xl p-6 text-center bg-red-50/20 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-8 h-8 text-[#c92127] animate-spin" />
              <span className="text-xs font-bold text-slate-700">
                ছবি আপলোড হচ্ছে...
              </span>
            </div>
          ) : imageUrl ? (
            <div className="border border-slate-200 bg-white rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl border border-slate-200 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/splashjet_images/about-splashjet.jpg';
                    }}
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <p className="text-xs font-bold text-slate-800">ছবি লোড হয়েছে</p>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs mt-0.5">
                    {imageUrl}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-[#c92127] hover:underline font-bold mt-1 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>নতুন ছবি বদলান (Replace)</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onImageChange('')}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="ছবি মুছে ফেলুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#c92127] rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-red-50/20 transition-all flex flex-col items-center justify-center space-y-1.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#c92127] flex items-center justify-center border border-red-100 shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন
              </span>
              <span className="text-[11px] text-slate-400">
                PNG, JPG, WebP বা নিচে থেকে প্রিসেট সিলেক্ট করুন
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={imageUrl || ''}
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="ছবির লিংক পেস্ট করুন (যেমন: https://... বা /splashjet_images/...)"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
          />
          {imageUrl && (
            <div className="w-20 h-20 bg-slate-50 rounded-xl border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
              <img
                src={imageUrl}
                alt="Direct url preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/splashjet_images/about-splashjet.jpg';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Quick Category Preset Selectors */}
      <div className="pt-1">
        <span className="text-[11px] text-slate-500 font-bold block mb-2">
          বা ক্যাটাগরির রেডি ছবি সিলেক্ট করুন:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const isSelected = imageUrl === preset.path;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  if (onPresetSelect) {
                    onPresetSelect(preset.path);
                  } else {
                    onImageChange(preset.path);
                  }
                }}
                className={`text-[11px] px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-red-50 border-[#c92127] text-[#c92127] font-bold shadow-xs scale-102'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <img
                  src={preset.path}
                  alt=""
                  className="w-4 h-4 object-contain rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/splashjet_images/about-splashjet.jpg';
                  }}
                />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
