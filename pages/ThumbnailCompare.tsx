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
      const result = await analyzeCompetitor(url);
      if (!result) throw new Error("Analysis yielded no data.");
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError("Unable to analyze channel. Please verify the URL or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <SEO title="YouTube Competitor Spy Tool" description="Ethically analyze competitor YouTube channels." path="/competitors" />
      
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Competitor Spy</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Hybrid Analysis: Web Scraper + Groq (OpenAI OSS 120B) Logic. 
          <br/>Enter a channel URL to extract content gaps and opportunities.
        </p>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row gap-3">
          <Input 
            placeholder="https://www.youtube.com/@ChannelName"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <Button onClick={handleAnalyze} disabled={loading} className="md:w-40">
            {loading ? <Spinner /> : 'Spy'}
          </Button>
        </div>
        {error && <p className="text-rose-400 text-sm mt-3 text-center">{error}</p>}
      </div>

      {data && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            <Card title={data.channelName || 'Unknown Channel'}>
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 uppercase tracking-wider">Estimated Reach</p>
                <p className="text-3xl font-bold text-brand-400 mt-1">{data.subscriberEstimate || 'N/A'}</p>
              </div>
            </Card>
             <Card title="Strategic Action Plan" className="border-brand-500/30 bg-brand-900/10">
              <p className="text-slate-300 leading-relaxed">{data.actionPlan || 'No action plan generated.'}</p>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Strengths */}
            <Card title="Strengths" className="border-green-900/50">
              <ul className="space-y-3">
                {data.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-green-400 mt-1">✓</span> {s}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card title="Weaknesses" className="border-red-900/50">
               <ul className="space-y-3">
                {data.weaknesses?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-red-400 mt-1">✕</span> {s}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Gaps */}
            <Card title="Content Gaps" className="border-amber-900/50">
               <ul className="space-y-3">
                {data.contentGaps?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-amber-400 mt-1">⚠</span> {s}
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
