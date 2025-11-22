import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface UploadZoneProps {
  onUpload: (files: FileList | null) => void;
  onUrlUpload: (url: string) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, onUrlUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onUpload(e.dataTransfer.files);
  }, [onUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpload(e.target.files);
  }, [onUpload]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onUrlUpload(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Drag & Drop Area */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed 
          transition-all duration-300 cursor-pointer group
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
            : 'border-slate-600 bg-slate-800/50 hover:border-slate-400 hover:bg-slate-800'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`p-3 rounded-full bg-slate-700/50 transition-colors ${isDragging ? 'bg-indigo-500/20' : 'group-hover:bg-slate-700'}`}>
            <UploadIcon className={`w-6 h-6 ${isDragging ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">
              <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF</p>
          </div>
        </div>
        <input 
          type="file" 
          className="hidden" 
          multiple 
          accept="image/*"
          onChange={handleChange}
        />
      </label>

      {/* Divider */}
      <div className="flex items-center justify-center space-x-3">
        <div className="h-px bg-slate-700 w-full"></div>
        <span className="text-xs text-slate-500 font-medium uppercase">OR</span>
        <div className="h-px bg-slate-700 w-full"></div>
      </div>

      {/* URL Input Area */}
      <form onSubmit={handleUrlSubmit} className="relative flex items-center">
        <div className="absolute left-3 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste image URL (e.g., https://site.com/photo.jpg)"
          className="w-full bg-slate-800/50 text-slate-200 placeholder-slate-500 border border-slate-600 rounded-xl py-3 pl-10 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={!urlInput.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
        >
          Analyze
        </button>
      </form>
    </div>
  );
};

export default UploadZone;