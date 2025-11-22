import React, { useState } from 'react';
import { Card, Input, Button, Spinner } from '../components/UI';
import { analyzeCompetitor } from '../services/geminiService';
import { CompetitorAnalysisResult } from '../types';
import { SEO } from '../components/SEO';

export const CompetitorAnalysis: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompetitorAnalysisResult | null>(null);

  // API Key State
  const [userKey, setUserKey] = useState('');
  const hasEnvKey = !!process.env.GROQ_API_KEY;

  const handleAnalyze = async () => {
    if (!url) return;
    
    const keyToUse = hasEnvKey ? undefined : userKey;
    if (!hasEnvKey && !userKey) {
      alert("Please enter a Groq API Key.");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeCompetitor(url, keyToUse);
      setData(result);
    } catch (error) {
      alert("Analysis failed. Ensure the URL is valid and the channel is public.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEO 
        title="YouTube Competitor Spy Tool" 
        description="Ethically analyze competitor YouTube channels to find content gaps, weaknesses, and growth opportunities."
        path="/competitors"
      />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Competitor Spy</h2>
        <p className="text-slate-400 mt-2">Paste a channel URL to extract content gaps and strategy.</p>
      </div>

      {!hasEnvKey && (
        <div className="max-w-lg mx-auto bg-amber-900/20 border border-amber-500/30 p-3 rounded-lg flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-amber-200 mb-1">Groq API Key</label>
            <Input 
              type="password" 
              placeholder="gsk_..." 
              value={userKey} 
              onChange={(e) => setUserKey(e.target.value)} 
              className="text-sm py-2 h-9"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input 
          placeholder="https://www.youtube.com/@ChannelName"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? <Spinner /> : 'Spy'}
        </Button>
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
              <ul className="list-disc list-inside text-green-400 space-y-2">
                {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </Card>
            <Card title="Weaknesses" className="border-red-900/50">
               <ul className="list-disc list-inside text-red-400 space-y-2">
                {data.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </Card>
            <Card title="Content Gaps (Opportunity)" className="border-amber-900/50">
               <ul className="list-disc list-inside text-amber-400 space-y-2">
                {data.contentGaps.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};