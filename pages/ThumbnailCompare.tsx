
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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setImg: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCompare = async () => {
    if (!imgA || !imgB) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await compareThumbnailsVision(imgA, imgB, 'OPENROUTER');
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Comparison failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <SEO title="Thumbnail A/B" description="AI Thumbnail Comparison" path="/compare" />
      
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Thumbnail A/B Simulator</h2>
        <p className="text-slate-400 mt-2">Predict the winner using Grok Vision intelligence.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {[
          { id: 'A', img: imgA, set: setImgA, score: result?.scoreA, win: result?.winner === 'A' },
          { id: 'B', img: imgB, set: setImgB, score: result?.scoreB, win: result?.winner === 'B' }
        ].map((item) => (
          <Card key={item.id} title={`Thumbnail ${item.id}`} className={item.win ? 'border-green-500 ring-1 ring-green-500/50' : ''}>
            <div 
              onClick={() => document.getElementById(`file${item.id}`)?.click()}
              className="aspect-video bg-slate-950 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center cursor-pointer hover:border-slate-600 overflow-hidden relative"
            >
              {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <span className="text-4xl">🖼️</span>}
              <input id={`file${item.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, item.set)} />
              {item.score !== undefined && (
                <div className="absolute top-2 right-2 bg-black/80 px-3 py-1 rounded text-xl font-bold text-white">
                  {item.score}/10
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button onClick={handleCompare} disabled={loading || !imgA || !imgB} className="px-10 py-4 text-lg rounded-full">
          {loading ? <Spinner /> : 'Predict Winner'}
        </Button>
      </div>

      {result && (
        <div className="animate-slide-up space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950">
             <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
             <p className="text-slate-300 leading-relaxed">{result.reasoning}</p>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            {result.breakdown.map((b, i) => (
              <div key={i} className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
                 <span className="font-medium text-slate-300">{b.criterion}</span>
                 <Badge color={b.winner === 'A' ? 'green' : 'blue'}>{b.winner}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
