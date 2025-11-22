import React, { useState, useCallback, useMemo } from 'react';
import { AnalyzedImage } from './types';
import { analyzeImageWithGemini, fileToBase64 } from './services/geminiService';
import ImageCard from './components/ImageCard';
import UploadZone from './components/UploadZone';
import { CameraIcon, SparklesIcon, TrashIcon, DownloadIcon, XIcon } from './components/Icons';
import { DEMO_IMAGES } from './constants';

type FilterType = 'all' | 'complete' | 'analyzing' | 'error';

const App: React.FC = () => {
  const [images, setImages] = useState<AnalyzedImage[]>(DEMO_IMAGES);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --- File / Upload Handling ---

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newImages: AnalyzedImage[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      status: 'analyzing',
      file,
    }));

    setImages((prev) => [...newImages, ...prev]);
    setActiveFilter('all');

    for (const img of newImages) {
      if (!img.file) continue;

      try {
        const base64 = await fileToBase64(img.file);
        const exifData = await analyzeImageWithGemini(base64, img.file.type);

        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? { ...item, status: 'complete', exif: exifData }
              : item
          )
        );
      } catch (err) {
        console.error("Processing failed", err);
        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id ? { ...item, status: 'error', error: "Failed to analyze file." } : item
          )
        );
      }
    }
  }, []);

  const handleUrlUpload = useCallback(async (url: string) => {
    const id = Math.random().toString(36).substring(7);
    
    setImages((prev) => [{
      id,
      url,
      status: 'analyzing'
    }, ...prev]);
    setActiveFilter('all');

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image (${response.status})`);

      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) throw new Error("URL does not point to a valid image");

      const base64 = await fileToBase64(blob);
      const exifData = await analyzeImageWithGemini(base64, blob.type);

      setImages((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'complete', exif: exifData } : item
        )
      );

    } catch (err: any) {
      console.error("URL processing failed", err);
      let errorMessage = "Could not process URL.";
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        errorMessage = "CORS Access Restricted. Try downloading the image and uploading it manually.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setImages((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'error', error: errorMessage } : item
        )
      );
    }
  }, []);

  // --- Selection & Bulk Actions ---

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const visibleIds = filteredImages.map(img => img.id);
    setSelectedIds(new Set(visibleIds));
  }, []); // Added filteredImages to dependency via useMemo usage context, but function needs wrapper or clean dependency

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} images?`)) {
      setImages(prev => prev.filter(img => !selectedIds.has(img.id)));
      setSelectedIds(new Set());
    }
  }, [selectedIds]);

  const handleBulkExport = useCallback(() => {
    const selectedImages = images.filter(img => selectedIds.has(img.id));
    const exportData = selectedImages.map(img => ({
      id: img.id,
      originalUrl: img.url,
      status: img.status,
      exifData: img.exif || null,
      error: img.error || null,
      exportedAt: new Date().toISOString()
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exifai_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [images, selectedIds]);

  // --- Filtering ---

  const filteredImages = useMemo(() => {
    if (activeFilter === 'all') return images;
    return images.filter((img) => img.status === activeFilter);
  }, [images, activeFilter]);

  // Re-bind handleSelectAll with correct dependency
  const handleSelectAllFiltered = useCallback(() => {
    const visibleIds = filteredImages.map(img => img.id);
    setSelectedIds(new Set(visibleIds));
  }, [filteredImages]);

  const getCount = (status: FilterType) => {
    if (status === 'all') return images.length;
    return images.filter((img) => img.status === status).length;
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'complete', label: 'Complete' },
    { id: 'analyzing', label: 'Processing' },
    { id: 'error', label: 'Failed' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30 pb-24">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg">
              <CameraIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ExifAI Lens
              </h1>
              <p className="text-xs text-slate-400">Intelligent Metadata Extraction</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <SparklesIcon className="w-3 h-3 text-indigo-400" />
            <span>Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* Hero / Upload Section */}
        <section className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Reveal the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">hidden details</span> inside your photos.
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Upload any image or paste a URL. Our AI extracts embedded EXIF data or analyzes the visual signature to infer camera model, lens choice, and exposure settings.
            </p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-3xl shadow-2xl shadow-black/50 border border-white/5">
            <UploadZone onUpload={handleFileUpload} onUrlUpload={handleUrlUpload} />
          </div>
        </section>

        {/* Gallery Grid */}
        <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-white">Recent Analysis</h3>
                    <button 
                      onClick={handleSelectAllFiltered}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Select All
                    </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                        ${activeFilter === filter.id
                          ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                          : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200'
                        }
                      `}
                    >
                      <span>{filter.label}</span>
                      <span className={`
                        px-1.5 py-0.5 rounded-full text-[10px] font-bold
                        ${activeFilter === filter.id ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-700/50 text-slate-500'}
                      `}>
                        {getCount(filter.id)}
                      </span>
                    </button>
                  ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((img) => (
                  <ImageCard 
                    key={img.id} 
                    image={img} 
                    isSelected={selectedIds.has(img.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
            </div>
            
            {filteredImages.length === 0 && (
                <div className="text-center py-20 border border-dashed border-slate-700 rounded-3xl">
                    <p className="text-slate-500">
                      {images.length === 0 
                        ? "No images analyzed yet. Upload one above!" 
                        : "No images match the selected filter."}
                    </p>
                </div>
            )}
        </section>

      </main>

      {/* Bulk Action Floating Bar */}
      <div className={`
        fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50
        transition-all duration-500 ease-in-out
        ${selectedIds.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}
      `}>
        <div className="bg-slate-800/90 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center space-x-6">
          <div className="flex items-center space-x-3 border-r border-white/10 pr-6">
            <div className="bg-indigo-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white">
              {selectedIds.size}
            </div>
            <span className="text-sm font-medium text-white whitespace-nowrap">Selected</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleBulkExport}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
            
            <button 
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <button 
              onClick={handleDeselectAll}
              className="ml-2 p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Clear Selection"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <footer className="py-8 text-center text-slate-600 text-sm border-t border-white/5 mt-12">
        <p>&copy; {new Date().getFullYear()} ExifAI Lens. Built with React & Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
