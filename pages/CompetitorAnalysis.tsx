import React, { useState } from 'react';
import { Card, Input, Button, Spinner } from '../components/UI';
import { analyzeCompetitor } from '../services/geminiService';
import { CompetitorAnalysisResult } from '../types';
import { SEO } from '../components/SEO';

export const CompetitorAnalysis: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompetitorAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      // Calls the Hybrid (Scraper + AI) service
      const result = await analyzeCompetitor(url);
      
      if (result && (result.strengths || result.actionPlan)) {
        setData(result);
      } else {
        throw new Error("Unable to analyze channel data.");
      }
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <SEO title="Competitor Spy" description="Hybrid AI + Web Scraping analysis." path="/competitors" />
      
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Competitor Spy</h2>
        <p className="text-slate-400">
          Deep channel analysis using Hybrid Logic (Web Scraping + AI Reasoning).
        </p>
      </div>

      <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <Input 
            placeholder="Paste Channel URL (e.g., https://youtube.com/@ChannelName)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <Button onClick={handleAnalyze} disabled={loading || !url} className="md:w-48 font-bold text-lg">
            {loading ? <><Spinner /> Scanning...</> : 'Analyze Channel'}
          </Button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {loading && !data && (
        <div className="text-center py-12 animate-pulse">
          <div className="text-4xl mb-4">🕵️‍♂️</div>
          <p className="text-slate-400">Scraping channel data & analyzing content gaps...</p>
        </div>
      )}

      {data && (
        <div className="space-y-6 animate-slide-up">
          <div className="grid md:grid-cols-2 gap-6">
            <Card title="Channel Profile">
              <div className="text-center py-2">
                <h3 className="text-2xl font-bold text-white">{data.channelName || 'Analyzed Channel'}</h3>
                <div className="mt-2 inline-block bg-slate-800 px-3 py-1 rounded-full text-xs text-slate-400 uppercase tracking-wider">
                  Est. Subs: <span className="text-brand-400 font-bold">{data.subscriberEstimate}</span>
                </div>
              </div>
            </Card>
            <Card title="Strategic Attack Plan" className="bg-brand-900/10 border-brand-500/30">
              <p className="text-lg text-slate-200 italic">"{data.actionPlan}"</p>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card title="Strengths" className="border-emerald-500/20">
              <ul className="space-y-2">
                {data.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400">✓</span> {s}
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Weaknesses" className="border-rose-500/20">
               <ul className="space-y-2">
                {data.weaknesses?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-rose-400">✕</span> {s}
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Missed Gaps" className="border-amber-500/20">
               <ul className="space-y-2">
                {data.contentGaps?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-amber-400">⚠</span> {s}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
