import React, { useState } from 'react';
import { Card, Button, Spinner, Badge } from '../components/UI';
import { compareThumbnailsVision } from '../services/geminiService';
import { ThumbnailCompareResult } from '../types';
import { SEO } from '../components/SEO';

export const ThumbnailCompare: React.FC = () => {
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
      // We use the 'OPENROUTER' provider which defaults to the injected env key
      const data = await compareThumbnailsVision(imgA, imgB, 'OPENROUTER');
      setResult(data);

    } catch (err: any) {
      console.error(err);
      setError("Comparison temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <SEO title="Thumbnail A/B Tester" description="Compare two YouTube thumbnails with AI." path="/compare" />
      
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Thumbnail A/B Simulator</h2>
        <p className="text-slate-400 mb-6">Powered by <span className="text-brand-400 font-bold">xAI Grok Vision</span></p>
        
        <div className="flex justify-center mb-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex gap-2 items-center">
             <span className="text-xs text-slate-400 font-bold px-2">MODEL:</span>
             <span className="text-sm font-mono text-white">x-ai/grok-4.1-fast</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card title="Thumbnail A" className={result?.winner === 'A' ? 'border-green-500' : ''}>
            <div className="aspect-video bg-slate-950 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden relative mb-4 group cursor-pointer" onClick={() => document.getElementById('fileA')?.click()}>
              {imgA ? <img src={imgA} className="w-full h-full object-cover" /> : <div className="text-center p-4"><div className="text-4xl mb-2">🖼️</div><p className="text-slate-500 text-sm">Upload A</p></div>}
              <input id="fileA" type="file" accept="image/*" onChange={(e) => handleFile(e, setImgA)} className="hidden" />
            </div>
            {result && <div className="text-center"><span className={`text-5xl font-bold ${result.winner === 'A' ? 'text-green-400' : 'text-slate-600'}`}>{result.scoreA}</span><span className="text-slate-600 text-xl">/10</span></div>}
        </Card>

        <Card title="Thumbnail B" className={result?.winner === 'B' ? 'border-green-500' : ''}>
            <div className="aspect-video bg-slate-950 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden relative mb-4 group cursor-pointer" onClick={() => document.getElementById('fileB')?.click()}>
              {imgB ? <img src={imgB} className="w-full h-full object-cover" /> : <div className="text-center p-4"><div className="text-4xl mb-2">🖼️</div><p className="text-slate-500 text-sm">Upload B</p></div>}
              <input id="fileB" type="file" accept="image/*" onChange={(e) => handleFile(e, setImgB)} className="hidden" />
            </div>
            {result && <div className="text-center"><span className={`text-5xl font-bold ${result.winner === 'B' ? 'text-green-400' : 'text-slate-600'}`}>{result.scoreB}</span><span className="text-slate-600 text-xl">/10</span></div>}
        </Card>
      </div>

      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-4">
           <Button onClick={handleCompare} disabled={loading} className="px-8 py-4 text-lg rounded-full shadow-lg shadow-brand-500/20">
             {loading ? <><Spinner /> Asking Grok...</> : `Analyze with Grok Vision ⚡`}
           </Button>
           {error && <p className="text-rose-400 text-sm font-medium">{error}</p>}
        </div>
      </div>

      {result && (
        <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
           <Card title="Verdict" className="md:col-span-3 bg-gradient-to-br from-brand-900/20 to-slate-900"><p className="text-lg text-slate-200">{result.reasoning}</p></Card>
           <div className="md:col-span-3 bg-slate-950/50 rounded-xl border border-slate-800 p-5">
             {result.breakdown.map((item, i) => (
               <div key={i} className="py-4 border-b border-slate-800 last:border-0 flex gap-4">
                 <div className="w-32 shrink-0 font-bold text-white text-sm">{item.criterion} <Badge color={item.winner === 'A' ? 'green' : 'blue'}>{item.winner}</Badge></div>
                 <p className="text-slate-400 text-sm">{item.explanation}</p>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};
