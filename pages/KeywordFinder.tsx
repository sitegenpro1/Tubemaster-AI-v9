
import React, { useState } from 'react';
import { Button, Spinner, Badge } from '../components/UI';
import { findKeywords } from '../services/geminiService';
import { KeywordResult } from '../types';
import { SEO } from '../components/SEO';

export const KeywordFinder: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!topic) return;
    setError(null);
    setLoading(true);
    setExpandedRow(null);
    setResults([]);

    try {
      const data = await findKeywords(topic);
      if (data && data.length > 0) {
        setResults(data);
      } else {
        setError("No high-value keywords found for this specific topic.");
      }
    } catch (error) {
      console.error(error);
      setError("Keyword analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyList = () => {
    navigator.clipboard.writeText(results.map(r => r.keyword).join('\n'));
    alert("Copied to clipboard");
  };

  return (
    <div className="space-y-10 pb-20">
      <SEO title="Keyword Explorer" description="Deep logic keyword research." path="/keywords" />
      
      <div className="text-center py-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-500/10 blur-[100px] -z-10 rounded-full"></div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Keyword <span className="text-brand-400">Deep Dive</span>
        </h2>
        <p className="text-lg text-slate-400">10-Point Logic Analysis for Commercial Growth.</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex gap-3 items-center shadow-2xl">
          <input 
            className="flex-1 bg-transparent border-none outline-none text-white text-lg px-4 py-2 placeholder:text-slate-600"
            placeholder="Enter niche (e.g., 'Vegan Meal Prep')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading || !topic} className="px-8 py-3">
            {loading ? <Spinner /> : 'Research'}
          </Button>
        </div>
        {error && <p className="text-center text-rose-400 text-sm">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex justify-between px-2">
            <h3 className="text-white font-bold">Results</h3>
            <button onClick={copyList} className="text-brand-400 text-sm hover:text-brand-300">Copy All</button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-sm uppercase">
                  <th className="p-4">Keyword</th>
                  <th className="p-4 hidden sm:table-cell">Volume</th>
                  <th className="p-4 hidden sm:table-cell">KD</th>
                  <th className="p-4">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {results.map((r, i) => (
                  <React.Fragment key={i}>
                    <tr onClick={() => setExpandedRow(expandedRow === i ? null : i)} className="cursor-pointer hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-medium text-slate-200">{r.keyword}</td>
                      <td className="p-4 hidden sm:table-cell text-slate-400">{r.searchVolume}</td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${r.difficulty > 60 ? 'bg-rose-500' : r.difficulty > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${r.difficulty}%`}}></div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-brand-400">{r.opportunityScore}</td>
                    </tr>
                    {expandedRow === i && (
                      <tr className="bg-slate-950/50">
                        <td colSpan={4} className="p-6">
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                             <div><span className="text-slate-500 block text-xs uppercase">Trend</span> {r.trend}</div>
                             <div><span className="text-slate-500 block text-xs uppercase">Intent</span> {r.intent}</div>
                             <div><span className="text-slate-500 block text-xs uppercase">CPC</span> {r.cpc}</div>
                             <div><span className="text-slate-500 block text-xs uppercase">Competitor</span> {r.topCompetitor}</div>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
