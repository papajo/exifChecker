import React from 'react';
import { AnalyzedImage } from '../types';
import { CameraIcon, ApertureIcon, ShutterIcon, IsoIcon, SparklesIcon, LoaderIcon, CheckIcon, DownloadIcon } from './Icons';

interface ImageCardProps {
  image: AnalyzedImage;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, isSelected, onToggleSelect }) => {
  const { status, exif, url, error } = image;

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(image.id);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        // Fetch as blob to force download instead of navigation
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `exifai-${image.id}.jpg`; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
        // Fallback for simple links if fetch fails (e.g. strict CORS on some remote URLs)
        const link = document.createElement('a');
        link.href = url;
        link.download = `exifai-${image.id}.jpg`;
        link.target = "_blank";
        link.click();
    }
  };

  return (
    <div className={`
        relative group w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-800 shadow-2xl 
        transition-all duration-500 hover:shadow-indigo-500/20
        ${isSelected ? 'ring-2 ring-indigo-500 scale-[0.98]' : 'ring-1 ring-white/10 hover:scale-[1.02]'}
      `}>
      
      {/* Selection Checkbox - Top Left */}
      <button
        onClick={handleSelectClick}
        className={`
          absolute top-3 left-3 z-30 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${isSelected 
            ? 'bg-indigo-500 border-indigo-500 text-white opacity-100' 
            : 'bg-black/40 hover:bg-black/60 text-transparent opacity-0 group-hover:opacity-100'
          }
        `}
      >
        <CheckIcon className="w-4 h-4" />
      </button>

      {/* Download Button - Top Right */}
      {status === 'complete' && (
        <button
            onClick={handleDownload}
            className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-indigo-600 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:scale-110"
            title="Download Image"
        >
            <DownloadIcon className="w-4 h-4" />
        </button>
      )}

      {/* Background Image */}
      <img 
        src={url} 
        alt="Analyzed photography" 
        className={`w-full h-full object-cover transition-all duration-700 
          ${status === 'complete' ? 'group-hover:scale-110 group-hover:brightness-50 group-hover:blur-sm' : ''}
        `}
      />

      {/* Loading State */}
      {status === 'analyzing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 pointer-events-none">
          <LoaderIcon className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
          <span className="text-xs font-medium text-indigo-200 tracking-wider uppercase">Analyzing...</span>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md z-20 p-6 text-center">
          <div className="p-3 bg-red-500/20 rounded-full mb-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-200"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <span className="text-sm font-bold text-red-200 mb-1">Analysis Failed</span>
          <span className="text-xs text-red-300/80">{error || "Could not process image."}</span>
        </div>
      )}

      {/* Hover Overlay - Only if complete */}
      {status === 'complete' && exif && (
        <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          
          {/* Main Tech Specs Container */}
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 pointer-events-auto">
            
            {/* Header: Camera & Lens */}
            <div className="mb-4 border-b border-white/10 pb-4">
                <div className="flex items-start space-x-3 mb-2">
                    <CameraIcon className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{exif.camera}</h3>
                        <p className="text-indigo-200 text-sm font-medium">{exif.lens}</p>
                    </div>
                </div>
                <div className="flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full w-fit">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    <span>AI Identified</span>
                </div>
            </div>

            {/* Grid: Settings */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div 
                    className="bg-white/5 backdrop-blur-md rounded-lg p-2 flex flex-col items-center justify-center border border-white/5 hover:bg-white/10 transition-colors cursor-help"
                    title="Aperture"
                >
                    <ApertureIcon className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-white font-mono text-sm">{exif.aperture}</span>
                    <span className="text-[10px] text-slate-500 uppercase">Aperture</span>
                </div>
                <div 
                    className="bg-white/5 backdrop-blur-md rounded-lg p-2 flex flex-col items-center justify-center border border-white/5 hover:bg-white/10 transition-colors cursor-help"
                    title="Shutter Speed"
                >
                    <ShutterIcon className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-white font-mono text-sm">{exif.shutterSpeed}</span>
                    <span className="text-[10px] text-slate-500 uppercase">Shutter</span>
                </div>
                <div 
                    className="bg-white/5 backdrop-blur-md rounded-lg p-2 flex flex-col items-center justify-center border border-white/5 hover:bg-white/10 transition-colors cursor-help"
                    title="ISO Sensitivity"
                >
                    <IsoIcon className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-white font-mono text-sm">{exif.iso}</span>
                    <span className="text-[10px] text-slate-500 uppercase">ISO</span>
                </div>
            </div>

            {/* Description */}
            <div className="bg-black/40 rounded-lg p-3 backdrop-blur-xl border border-white/5">
                <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                    {exif.description}
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCard;