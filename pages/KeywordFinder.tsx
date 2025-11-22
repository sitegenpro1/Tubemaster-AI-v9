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
      // Backend service handles auth. No client inputs needed.
      const data = await findKeywords(topic);
      if (data && data.length > 0) {
        setResults(data);
      } else {
        setError("No keywords found. Try a different topic.");
      }
    } catch (error: any) {
      console.error("Search error:", error);
      // Display a friendly message instead of raw technical errors
      setError("Unable to analyze at this moment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = results.map(r => r.keyword).join('\n');
    navigator.clipboard.writeText(text);
    alert("Keywords copied to clipboard!");
  };

  const getDifficultyColor = (score: number) => {
    if (score < 35) return 'bg-emerald-500 shadow-emerald-500/50';
    if (score < 65) return 'bg-amber-500 shadow-amber-500/50';
    return 'bg-rose-500 shadow-rose-500/50';
  };

  const getScoreColor = (score: number) => {
    if (score > 75) return 'text-emerald-400';
    if (score > 45) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-10 pb-20">
      <SEO 
        title="YouTube Keyword Tool" 
        description="Find high volume, low competition YouTube keywords with our 10-Point Logic analysis system."
        path="/keywords"
      />
      
      <div className="text-center relative py-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 blur-[100px] -z-10 rounded-full"></div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Keywords <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">Deep Explorer</span>
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Analyze keywords with 10-Point Logic using <strong>Groq Llama 3.3</strong>.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
           <div className="relative bg-slate-900 rounded-xl border border-slate-700 p-2 flex flex-col sm:flex-row gap-2 items-center shadow-2xl">
              <div className="pl-3 text-slate-500 hidden sm:block">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input 
                className="w-full bg-transparent border-none outline-none text-white text-lg placeholder:text-slate-600 px-4 py-3"
                placeholder="Enter your niche (e.g., 'Digital Marketing')..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading || !topic} 
                className="w-full sm:w-auto px-8 py-3 text-base shadow-none hover:shadow-lg whitespace-nowrap"
              >
                {loading ? <Spinner /> : 'Analyze'}
              </Button>
           </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-rose-900/10 border border-rose-500/20 rounded-lg text-rose-300 text-sm text-center animate-fade-in">
            {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-xl font-bold text-white">Analysis Results ({results.length})</h3>
             <button onClick={handleCopy} className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
               Copy List
             </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl ring-1 ring-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Keyword</th>
                    <th className="p-4 font-semibold w-32">Volume</th>
                    <th className="p-4 font-semibold w-32">KD %</th>
                    <th className="p-4 font-semibold w-32">Trend</th>
                    <th className="p-4 font-semibold w-32">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {results.map((row, idx) => (
                    <React.Fragment key={idx}>
                      <tr 
                        onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                        className={`cursor-pointer transition-all duration-200 group ${expandedRow === idx ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'}`}
                      >
                        <td className="p-4">
                          <div className="font-semibold text-slate-200 group-hover:text-white text-lg flex items-center gap-2">
                            {row.keyword}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 text-sm whitespace-nowrap">
                            {row.searchVolume}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full w-16 overflow-hidden">
                              <div className={`h-full rounded-full ${getDifficultyColor(row.difficulty).split(' ')[0]}`} style={{ width: `${row.difficulty}%` }}></div>
                            </div>
                            <span className="text-sm font-medium text-slate-400">{row.difficulty}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {row.trend === 'Rising' ? <Badge color="green">↗ Rising</Badge> : <Badge color="blue">→ Stable</Badge>}
                        </td>
                        <td className="p-4">
                           <span className={`text-lg font-bold ${getScoreColor(row.opportunityScore)}`}>{row.opportunityScore}</span>
                        </td>
                      </tr>
                      {expandedRow === idx && (
                        <tr className="bg-slate-900/80 border-b border-slate-800 animate-fade-in">
                          <td colSpan={5} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               <div className="space-y-2">
                                 <h4 className="text-xs font-bold text-slate-500 uppercase">Metrics</h4>
                                 <p className="text-sm text-slate-300">CPC: {row.cpc}</p>
                                 <p className="text-sm text-slate-300">Competition: {row.competitionDensity}</p>
                                 <p className="text-sm text-slate-300">Intent: {row.intent}</p>
                               </div>
                               <div className="space-y-2">
                                 <h4 className="text-xs font-bold text-slate-500 uppercase">Competitor</h4>
                                 <p className="text-sm text-brand-400">{row.topCompetitor}</p>
                                 <p className="text-sm text-slate-400">Freshness: {row.videoAgeAvg}</p>
                               </div>
                               <div className="space-y-2">
                                 <h4 className="text-xs font-bold text-slate-500 uppercase">Potential</h4>
                                 <Badge color={row.ctrPotential === 'High' ? 'green' : 'yellow'}>{row.ctrPotential} CTR</Badge>
                               </div>
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
        </div>
      )}
    </div>
  );
};
