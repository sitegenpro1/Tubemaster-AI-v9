
import React, { useState } from 'react';
import { Card, Button, Spinner, Badge } from '../components/UI';
import { generateThumbnail } from '../services/geminiService';
import { ThumbnailGenResult } from '../types';
import { SEO } from '../components/SEO';

const STYLES = [
  { id: 'realistic', label: 'Hyper Realistic', icon: '📸' },
  { id: '3d', label: '3D Render', icon: '🧊' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬' },
  { id: 'anime', label: 'Anime / Drawn', icon: '🎌' },
  { id: 'minimalist', label: 'Minimalist', icon: '⬜' },
  { id: 'cyberpunk', label: 'Neon / Cyber', icon: '🌃' },
];

const MOODS = ['Exciting', 'Happy', 'Serious', 'Mystery', 'Educational'];

export const ThumbnailGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [optimize, setOptimize] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedMood, setSelectedMood] = useState('Exciting');
  const [loading, setLoading] = useState(false);
  
  // Session History
  const [history, setHistory] = useState<ThumbnailGenResult[]>([]);
  const [currentImage, setCurrentImage] = useState<ThumbnailGenResult | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const result = await generateThumbnail(prompt, selectedStyle, selectedMood, optimize);
      setHistory(prev => [result, ...prev]);
      setCurrentImage(result);
    } catch (error) {
      console.error(error);
      alert("Generation failed. Please check your settings or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] pb-10">
      <SEO 
        title="4K YouTube Thumbnail Generator" 
        description="Create high-CTR YouTube thumbnails with AI. Features automatic prompt optimization, 4K upscaling, and style selection."
        path="/thumbnail-gen"
      />
      {/* Left Control Panel */}
      <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 space-y-6">
        <Card title="Design Studio" className="border-brand-500/20 shadow-2xl shadow-black/50">
          <div className="space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Describe your Vision</label>
              <textarea 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none min-h-[100px] placeholder:text-slate-600 resize-none"
                placeholder="e.g., A shocked man pointing at a floating bitcoin in a neon city..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="mt-2 flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${optimize ? 'bg-brand-600 border-brand-500' : 'bg-slate-900 border-slate-600'}`}>
                     <input type="checkbox" checked={optimize} onChange={(e) => setOptimize(e.target.checked)} className="hidden" />
                     {optimize && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-brand-400 transition-colors">Auto-Optimize Prompt (Uses AI Text)</span>
                </label>
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Art Style</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2 rounded-lg border text-left text-sm transition-all ${
                      selectedStyle === style.id 
                        ? 'bg-brand-600/20 border-brand-500 text-brand-300 shadow-[0_0_10px_rgba(20,184,166,0.2)]' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="mr-2 text-lg">{style.icon}</span>
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Atmosphere / Mood</label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(mood => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedMood === mood 
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={loading || !prompt} className="w-full py-4 text-lg font-bold shadow-brand-500/30">
              {loading ? <><Spinner /> Generating...</> : '✨ Generate (Unlimited)'}
            </Button>
            <p className="text-xs text-center text-slate-500">Powered by Pollinations.ai (No quotas)</p>
          </div>
        </Card>
      </div>

      {/* Right Preview Area */}
      <div className="lg:col-span-8 flex flex-col h-full gap-6">
        {/* Main Canvas */}
        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 relative group overflow-hidden shadow-2xl flex items-center justify-center">
          {loading ? (
             <div className="text-center space-y-4">
               <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
               <p className="text-brand-400 animate-pulse font-medium">Dreaming up pixels...</p>
             </div>
          ) : currentImage ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <img 
                src={currentImage.imageUrl} 
                alt="Generated Thumbnail" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              />
              
              {/* Overlay Actions */}
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                 <a 
                   href={currentImage.imageUrl} 
                   download={`thumbnail-${Date.now()}.jpg`}
                   target="_blank"
                   rel="noreferrer"
                   className="bg-white/10 backdrop-blur-md hover:bg-brand-500 text-white p-3 rounded-full border border-white/20 transition-colors"
                   title="Open / Download"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 </a>
              </div>

              {/* Prompt Details Overlay */}
              {currentImage.optimizedPrompt && currentImage.optimizedPrompt !== currentImage.originalPrompt && (
                <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 max-w-2xl mx-auto">
                   <span className="text-brand-400 font-bold uppercase text-xs tracking-wider block mb-1">AI Optimized Prompt Used</span>
                   <p className="text-slate-300 italic">"{currentImage.optimizedPrompt}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-600 p-10">
               <div className="text-8xl mb-6 opacity-20">🎨</div>
               <h3 className="text-2xl font-bold text-slate-500 mb-2">Ready to Create</h3>
               <p className="text-slate-600 max-w-md mx-auto">Select a style, describe your idea, and watch the AI generate a high-CTR thumbnail in seconds. <br/><span className="text-brand-500 font-semibold">Unlimited Generations Enabled.</span></p>
            </div>
          )}
        </div>

        {/* Session History Strip */}
        {history.length > 0 && (
          <div className="h-32 shrink-0 bg-slate-900/50 border-t border-slate-800 backdrop-blur-sm overflow-x-auto custom-scrollbar flex items-center gap-4 px-6 rounded-xl">
             {history.map((item, idx) => (
               <div 
                 key={item.createdAt} 
                 onClick={() => setCurrentImage(item)}
                 className={`relative shrink-0 w-48 aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${currentImage?.createdAt === item.createdAt ? 'border-brand-500 scale-105 ring-2 ring-brand-500/20' : 'border-slate-700 hover:border-slate-500'}`}
               >
                 <img src={item.imageUrl} className="w-full h-full object-cover" loading="lazy" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                   <span className="text-[10px] text-white truncate w-full">{item.style}</span>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
