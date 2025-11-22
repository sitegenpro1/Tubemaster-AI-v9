import React, { useState } from 'react';
import { Card, Input, Button, Spinner } from '../components/UI';
import { analyzeCompetitor } from '../services/geminiService';
import { CompetitorAnalysisResult } from '../types';
import { SEO } from '../components/SEO';

export const CompetitorAnalysis: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompetitorAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const result = await analyzeCompetitor(url);
      setData(result);
    } catch (error: any) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEO title="YouTube Competitor Spy Tool" description="Ethically analyze competitor YouTube channels." path="/competitors" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Competitor Spy</h2>
        <p className="text-slate-400 mt-2">Groq Llama 3.3 Analysis</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input 
            placeholder="https://www.youtube.com/@ChannelName"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button onClick={handleAnalyze} disabled={loading}>{loading ? <Spinner /> : 'Spy'}</Button>
        </div>
      </div>

      {data && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            <Card title={data.channelName}>
              <p className="text-brand-400 font-mono text-lg">{data.subscriberEstimate} Est. Subs</p>
            </Card>
             <Card title="Action Plan" className="border-brand-500/30 bg-brand-900/10">
              <p className="text-slate-300">{data.actionPlan}</p>
            </Card>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card title="Strengths" className="border-green-900/50">
              <ul className="list-disc list-inside text-green-400 space-y-2">{data.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </Card>
            <Card title="Weaknesses" className="border-red-900/50">
               <ul className="list-disc list-inside text-red-400 space-y-2">{data.weaknesses.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </Card>
            <Card title="Content Gaps" className="border-amber-900/50">
               <ul className="list-disc list-inside text-amber-400 space-y-2">{data.contentGaps.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
