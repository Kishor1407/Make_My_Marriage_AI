'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { compressImage } from '@/lib/compression';

function GuestUploadContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || 'RAHUL24';

  const [uploaderName, setUploaderName] = useState('');
  const [uploaderEmail, setUploaderEmail] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('HALDI');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    if (filesArray.length > 10) {
      setErrorMessage('Upload limit: Maximum 10 photos per batch to prevent server overload.');
      return;
    }

    setErrorMessage('');
    setSelectedFiles(filesArray);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploaderName || !uploaderEmail) {
      setErrorMessage('Please enter your Name and Email for photo attribution.');
      return;
    }
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select at least one photo to upload.');
      return;
    }

    try {
      setIsCompressing(true);
      setErrorMessage('');

      // 1. Client-Side Aggressive Compression
      const compressedFiles: File[] = [];
      for (const file of selectedFiles) {
        const compressed = await compressImage(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1600 });
        compressedFiles.push(compressed);
      }

      setIsCompressing(false);
      setIsUploading(true);

      // 2. Simulated Upload / API dispatch
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
      }, 1200);
    } catch (err: any) {
      setIsCompressing(false);
      setIsUploading(false);
      setErrorMessage(err.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="bg-surface min-h-screen text-on-surface font-body-md antialiased p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/30 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center mx-auto shadow-md">
            <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-surface-container px-2.5 py-0.5 rounded-full">
            QR Venue Photo Dump
          </span>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface">
            Share Your Candid Memories
          </h1>
          <p className="text-xs text-on-surface-variant">
            Uploading to wedding vault <strong className="font-mono text-primary font-bold">{initialCode}</strong>
          </p>
        </div>

        {uploadSuccess ? (
          <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h3 className="font-headline-sm text-xl font-bold text-on-surface">
              Memories Uploaded!
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Thank you, <strong>{uploaderName}</strong>! Your photos have been added to the live gallery with your attribution.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setUploadSuccess(false);
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high"
              >
                Upload More Photos
              </button>
              <Link
                href={`/marriage/${initialCode.toLowerCase()}`}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm hover:opacity-90"
              >
                Go to Wedding Gallery
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* Attribution Details */}
            <div className="space-y-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">badge</span>
                Guest Attribution
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface uppercase mb-1">
                    Your Full Name *
                  </label>
                  <input
                    required
                    placeholder="e.g. Pooja Deshmukh"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface uppercase mb-1">
                    Your Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. pooja.d@yahoo.com"
                    value={uploaderEmail}
                    onChange={(e) => setUploaderEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Event Selector */}
            <div>
              <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                Ceremony / Event Tab
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-xs font-semibold text-on-surface"
              >
                <option value="ENGAGEMENT">Engagement</option>
                <option value="MEHNDI">Mehndi</option>
                <option value="HALDI">Haldi</option>
                <option value="SANGEET">Sangeet</option>
                <option value="MARRIAGE">Wedding Ceremony</option>
                <option value="OTHERS">Reception &amp; Afterparty</option>
              </select>
            </div>

            {/* File Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface uppercase">
                Select Photos (Max 10 files)
              </label>
              <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-6 text-center hover:border-primary transition-colors bg-surface-container-lowest flex flex-col items-center justify-center space-y-2 cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                </div>
                <div className="text-xs font-medium text-on-surface">
                  {selectedFiles.length > 0 ? (
                    <span className="text-primary font-bold">
                      {selectedFiles.length} photo(s) selected
                    </span>
                  ) : (
                    <span>Tap or drag photos from camera roll</span>
                  )}
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  Automatically shrunk on-device to save data and upload instantly
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="text-xs text-error text-center font-medium bg-error-container/20 py-2 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCompressing || isUploading}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-md text-xs font-semibold shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCompressing ? (
                <span>Compressing Photos On-Device...</span>
              ) : isUploading ? (
                <span>Streaming to Wedding Vault...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  <span>Upload to Photo Dump ({selectedFiles.length})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function GuestUploadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading upload portal...</div>}>
      <GuestUploadContent />
    </Suspense>
  );
}

