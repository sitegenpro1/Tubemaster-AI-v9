import React, { useState } from 'react';
import { Card, Input, Button, Spinner, Select } from '../components/UI';
import { generateTitles, suggestBestTime } from '../services/geminiService';
import { SEO } from '../components/SEO';

type Tab = 'titles' | 'time';

export const TitleTime: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('titles');
  
  // Title Generator State
  const [titleTopic, setTitleTopic] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(false);

  // Best Time State
  const [timeTitle, setTimeTitle] = useState('');
  const [audience, setAudience] = useState('General Audience');
  const [tags, setTags] = useState('');
  const [timeSuggestion, setTimeSuggestion] = useState('');
  const [loadingTime, setLoadingTime] = useState(false);

  // API Key State
  const [userKey, setUserKey] = useState('');
  const hasEnvKey = !!process.env.GROQ_API_KEY;

  const handleGenerateTitles = async () => {
    if (!titleTopic) return;
    
    const keyToUse = hasEnvKey ? undefined : userKey;
    if (!hasEnvKey && !userKey) {
      alert("Please enter a Groq API Key.");
      return;
    }

    setLoadingTitles(true);
    try {
      const data = await generateTitles(titleTopic, keyToUse);
      setTitles(data);
    } catch (e) {
      alert("Failed to generate titles. Try again.");
    } finally {
      setLoadingTitles(false);
    }
  };

  const handleSuggestTime = async () => {
    if (!timeTitle) return;

    const keyToUse = hasEnvKey ? undefined : userKey;
    if (!hasEnvKey && !userKey) {
      alert("Please enter a Groq API Key.");
      return;
    }

    setLoadingTime(true);
    try {
      const data = await suggestBestTime(timeTitle, audience, tags, keyToUse);
      setTimeSuggestion(data);
    } catch (e) {
      alert("Failed to analyze best time.");
    } finally {
      setLoadingTime(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <SEO 
        title="Title Generator & Best Publish Time" 
        description="Get click-worthy YouTube titles and scientifically calculated publishing times for your specific niche."
        path="/title-time"
      />
      {/* Tabs */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setActiveTab('titles')}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            activeTab === 'titles' 
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          ✨ Title Generator
        </button>
        <button
          onClick={() => setActiveTab('time')}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            activeTab === 'time' 
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          ⏰ Best Time to Publish
        </button>
      </div>

      {!hasEnvKey && (
        <div className="max-w-lg mx-auto bg-amber-900/20 border border-amber-500/30 p-3 rounded-lg flex items-center gap-3 animate-fade-in">
          <div className="flex-1">
            <label className="block text-xs font-bold text-amber-200 mb-1">Groq API Key (Required)</label>
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

      {activeTab === 'titles' && (
        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
          <div className="space-y-6">
            <Card title="Title Generator" description="Get 10 high-CTR, SEO-optimized titles for your next video.">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Video Topic / Keyword</label>
                  <Input 
                    placeholder="e.g. iPhone 15 Review" 
                    value={titleTopic}
                    onChange={(e) => setTitleTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateTitles()}
                  />
                </div>
                <Button onClick={handleGenerateTitles} disabled={loadingTitles || !titleTopic} className="w-full">
                  {loadingTitles ? <Spinner /> : 'Generate Titles'}
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Results</span>
              {titles.length > 0 && <span className="text-sm font-normal text-slate-500 bg-slate-900 px-2 py-1 rounded">{titles.length} titles</span>}
            </h3>
            {titles.length > 0 ? (
              <div className="space-y-3">
                {titles.map((t, i) => (
                  <div 
                    key={i} 
                    className="group bg-slate-900 border border-slate-800 p-4 rounded-lg hover:border-brand-500 transition-all cursor-pointer relative flex items-center justify-between" 
                    onClick={() => {
                      navigator.clipboard.writeText(t);
                      alert('Title copied!');
                    }}
                  >
                    <p className="text-slate-200 font-medium">{t}</p>
                    <span className="opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl p-12">
                <span className="text-4xl mb-2">📝</span>
                <p>Enter a topic to generate titles</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
          <Card title="Best Publishing Time Optimizer" description="AI analysis of your niche to predict the perfect upload slot.">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Video Title (Draft)</label>
                <Input 
                  placeholder="e.g. My Daily Routine" 
                  value={timeTitle}
                  onChange={(e) => setTimeTitle(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Target Audience</label>
                  <div className="relative">
                     <Input 
                       list="audiences" 
                       value={audience} 
                       onChange={e => setAudience(e.target.value)} 
                       placeholder="Select or type..."
                     />
                     <datalist id="audiences">
                       <option value="General Audience" />
                       <option value="Tech Enthusiasts" />
                       <option value="Gamers" />
                       <option value="Beauty & Lifestyle" />
                       <option value="Education / Students" />
                       <option value="Business / Finance" />
                     </datalist>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Tags (Optional)</label>
                  <Input 
                    placeholder="vlog, tutorial..." 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleSuggestTime} disabled={loadingTime || !timeTitle} className="w-full mt-2">
                {loadingTime ? <Spinner /> : 'Analyze Best Time'}
              </Button>
            </div>
          </Card>

          {timeSuggestion && (
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-8 rounded-2xl relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">📅</span> Recommendation
              </h3>
              <p className="text-indigo-100 text-lg leading-relaxed whitespace-pre-wrap">
                {timeSuggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};