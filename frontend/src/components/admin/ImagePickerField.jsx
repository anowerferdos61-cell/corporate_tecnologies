import React, { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { CATEGORY_DEFAULT_IMAGES } from './adminConstants';

export default function ImagePickerField({ imageUrl, onImageChange, isUploading, onPresetSelect }) {
  const [useUrlInput, setUseUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const presets = [
    { label: 'Splashjet Ink', category: 'Splashjet Inks', path: CATEGORY_DEFAULT_IMAGES['Splashjet Inks'] },
    { label: 'Printers', category: 'Printers', path: CATEGORY_DEFAULT_IMAGES['Printers'] },
    { label: 'Photocopy Machine', category: 'Photocopy Machines', path: CATEGORY_DEFAULT_IMAGES['Photocopy Machines'] },
    { label: 'Machinery & DTF', category: 'Machinery', path: CATEGORY_DEFAULT_IMAGES['Machinery'] },
    { label: 'POS & Barcode', category: 'POS & Barcode', path: CATEGORY_DEFAULT_IMAGES['POS & Barcode'] },
    { label: 'Toner & Inks', category: 'Toner & Inks', path: CATEGORY_DEFAULT_IMAGES['Toner & Inks'] },
    { label: 'Accessories & Parts', category: 'Accessories & Parts', path: CATEGORY_DEFAULT_IMAGES['Accessories & Parts'] },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          Product Image *
        </label>
        <button
          type="button"
          onClick={() => setUseUrlInput(!useUrlInput)}
          className="text-xs font-semibold text-[#c92127] hover:underline cursor-pointer"
        >
          {useUrlInput ? '📁 Upload File' : '🔗 Direct Image URL'}
        </button>
      </div>

      {!useUrlInput ? (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            imageUrl
              ? 'border-slate-300 bg-slate-50 hover:bg-slate-100'
              : 'border-slate-300 hover:border-[#c92127] bg-slate-50 hover:bg-red-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onImageChange) {
                onImageChange(file);
              }
            }}
          />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <Loader2 className="w-8 h-8 text-[#c92127] animate-spin" />
              <span className="text-xs font-semibold text-slate-600">
                Uploading to Supabase Storage...
              </span>
            </div>
          ) : imageUrl ? (
            <div className="flex items-center justify-center gap-4">
              <div className="relative group w-20 h-20 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center overflow-hidden shadow-xs">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">Image Loaded</p>
                <p className="text-[11px] text-slate-500 max-w-xs truncate">{imageUrl}</p>
                <span className="text-[11px] text-[#c92127] font-semibold mt-1 inline-block">
                  Click to change
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-3 space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#c92127] flex items-center justify-center transition-transform border border-red-100">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">
                Click to upload from device
              </span>
              <span className="text-[11px] text-slate-400">
                Supports PNG, JPG, WebP or choose a preset below
              </span>
            </div>
          )}
        </div>
      ) : (
        <input
          type="text"
          value={imageUrl || ''}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder="Enter image URL (https://... or /images/...)"
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
        />
      )}

      {/* Quick Category Preset Selectors */}
      <div>
        <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
          Or select category preset image:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onPresetSelect ? onPresetSelect(preset) : onImageChange(preset.path);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                imageUrl === preset.path
                  ? 'bg-red-50 border-[#c92127] text-[#c92127] font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <img src={preset.path} alt="" className="w-3.5 h-3.5 object-contain rounded" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
