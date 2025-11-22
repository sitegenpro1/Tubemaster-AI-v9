
import React, { useState } from 'react';
import { Card, Button, Spinner, Badge, Input } from '../components/UI';
import { compareThumbnailsVision } from '../services/geminiService';
import { ThumbnailCompareResult } from '../types';
import { SEO } from '../components/SEO';

export const ThumbnailCompare: React.FC = () => {
  const [visionProvider, setVisionProvider] = useState<'OPENROUTER' | 'GROQ'>('OPENROUTER');
  const [openRouterKey, setOpenRouterKey] = useState('');
  
  // Image Data
  const [imgA, setImgA] = useState<string | null>(null);
  const [imgB, setImgB] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThumbnailCompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setImg: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCompare = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      if (!imgA || !imgB) throw new Error("Please upload both thumbnails for analysis.");
      
      // IMPORTANT: Pass undefined if the key string is empty so the service uses the fallback hardcoded key
      const keyToSend = openRouterKey && openRouterKey.trim() !== '' ? openRouterKey : undefined;
      
      const data = await compareThumbnailsVision(imgA, imgB, visionProvider, keyToSend);
      setResult(data);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Comparison failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <SEO 
        title="Thumbnail A/B Tester" 
        description="Compare two YouTube thumbnails with AI. Get a 10-point psychological breakdown on why one will perform better than the other."
        path="/compare"
      />
      
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Thumbnail A/B Simulator</h2>
        <p className="text-slate-400 mb-6">
          Predict the winner using <span className="text-brand-400 font-bold">Visual AI Eye-Tracking</span>.
        </p>
        
        {/* Provider Selection */}
        <div className="flex justify-center mb-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex gap-2 items-center">
             <span className="text-xs text-slate-400 font-bold px-2">VISION MODEL:</span>
             <select 
               value={visionProvider} 
               onChange={(e) => setVisionProvider(e.target.value as any)}
               className="bg-slate-800 text-white text-sm rounded px-3 py-1 outline-none border border-slate-700 focus:border-brand-500 cursor-pointer"
             >
               <option value="OPENROUTER">xAI Grok 2 Vision (via OpenRouter)</option>
             </select>
          </div>
        </div>
      </div>

      {/* OpenRouter Key Input for Vision Mode */}
      {visionProvider === 'OPENROUTER' && (
        <div className="max-w-2xl mx-auto bg-brand-900/10 border border-brand-500/20 p-4 rounded-xl animate-fade-in mb-8">
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
                <Badge color="brand">MODEL: xAI Grok 2 Vision</Badge>
                <span className="text-sm font-bold text-brand-300">xAI Grok 2 Vision (via OpenRouter)</span>
             </div>
             <a href="https://openrouter.ai/keys" target="_blank" className="text-xs text-brand-400 underline hover:text-brand-300">Get Key ↗</a>
           </div>
           
           <div className="relative">
              <Input 
                type="password" 
                placeholder="Enter OpenRouter Key (starts with sk-or-)..." 
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                className="bg-slate-950 placeholder:text-slate-600 pr-24"
              />
              {!openRouterKey && (
                <div className="absolute right-3 top-3 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                   ✓ Configured
                </div>
              )}
           </div>
           
           <p className="text-[10px] text-slate-500 mt-2">
             * Leave blank if you have configured VITE_OPENROUTER_API_KEY in your .env file.
           </p>
        </div>
      )}

      {error && (
        <div className="bg-rose-900/20 border border-rose-500/40 text-rose-200 p-4 rounded-xl text-center max-w-2xl mx-auto animate-fade-in mb-6 flex flex-col items-center justify-center gap-2">
           <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span className="font-bold text-sm">Analysis Failed</span>
           </div>
           <p className="text-xs font-mono opacity-80 break-all max-h-32 overflow-y-auto custom-scrollbar w-full text-left bg-black/20 p-2 rounded">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Option A */}
        <Card title="Thumbnail A" className={result?.winner === 'A' ? 'border-green-500 shadow-green-500/20 shadow-lg' : ''}>
            <div className="aspect-video bg-slate-950 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden relative mb-4 group hover:border-brand-500/50 transition-colors">
              {imgA ? (
                <>
                  <img src={imgA} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => document.getElementById('fileA')?.click()}>
                    <span className="text-white text-sm font-bold">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 cursor-pointer" onClick={() => document.getElementById('fileA')?.click()}>
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-slate-500 text-sm">Click to Upload A</p>
                </div>
              )}
              <input 
                id="fileA"
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFile(e, setImgA)} 
                className="hidden" 
              />
            </div>
            
            {result && (
              <div className="text-center mt-4 pt-4 border-t border-slate-800 animate-fade-in">
                 <span className={`text-5xl font-bold ${result.winner === 'A' ? 'text-green-400' : 'text-slate-600'}`}>
                   {result.scoreA}
                 </span>
                 <span className="text-slate-600 text-xl">/10</span>
              </div>
            )}
        </Card>

        {/* Option B */}
        <Card title="Thumbnail B" className={result?.winner === 'B' ? 'border-green-500 shadow-green-500/20 shadow-lg' : ''}>
            <div className="aspect-video bg-slate-950 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden relative mb-4 group hover:border-brand-500/50 transition-colors">
              {imgB ? (
                <>
                  <img src={imgB} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => document.getElementById('fileB')?.click()}>
                    <span className="text-white text-sm font-bold">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 cursor-pointer" onClick={() => document.getElementById('fileB')?.click()}>
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-slate-500 text-sm">Click to Upload B</p>
                </div>
              )}
              <input 
                id="fileB"
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFile(e, setImgB)} 
                className="hidden" 
              />
            </div>

            {result && (
              <div className="text-center mt-4 pt-4 border-t border-slate-800 animate-fade-in">
                 <span className={`text-5xl font-bold ${result.winner === 'B' ? 'text-green-400' : 'text-slate-600'}`}>
                   {result.scoreB}
                 </span>
                 <span className="text-slate-600 text-xl">/10</span>
              </div>
            )}
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleCompare} disabled={loading} className="px-8 py-4 text-lg shadow-lg shadow-brand-500/20 min-w-[240px] rounded-full">
          {loading ? <><Spinner /> Analyzing with xAI...</> : `Compare Thumbnails ⚡`}
        </Button>
      </div>

      {result && (
        <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
           <Card title="The Verdict" className="md:col-span-3 bg-gradient-to-br from-brand-900/20 to-slate-900 border-brand-500/30">
             <p className="text-lg text-slate-200 leading-relaxed font-medium">{result.reasoning}</p>
           </Card>
           <div className="md:col-span-3">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               <span className="text-2xl">🧠</span> Psychological Breakdown
             </h3>
             <div className="bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
               {result.breakdown.map((item, i) => (
                 <div key={i} className="p-5 border-b border-slate-800 last:border-0 flex flex-col md:flex-row md:items-start gap-4 hover:bg-slate-900/80 transition-colors">
                   <div className="md:w-48 shrink-0">
                     <div className="font-bold text-white text-sm uppercase tracking-wider mb-1">{item.criterion}</div>
                     <Badge color={item.winner === 'A' ? 'green' : 'blue'}>Winner: {item.winner}</Badge>
                   </div>
                   <div className="flex-1">
                     <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-800 pl-4">{item.explanation}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};