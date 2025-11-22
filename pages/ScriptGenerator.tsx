import React, { useState } from 'react';
import { Card, Input, Button, Spinner, Select, Badge } from '../components/UI';
import { generateScript } from '../services/geminiService';
import { ScriptResponse } from '../types';
import { SEO } from '../components/SEO';

export const ScriptGenerator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('Beginners');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<ScriptResponse | null>(null);
  
  // API Key State
  const [userKey, setUserKey] = useState('');
  const hasEnvKey = !!process.env.GROQ_API_KEY;

  const handleGenerate = async () => {
    if (!title) return;
    
    const keyToUse = hasEnvKey ? undefined : userKey;
    if (!hasEnvKey && !userKey) {
      alert("Please enter a Groq API Key to proceed.");
      return;
    }

    setLoading(true);
    setScript(null);
    try {
      const data = await generateScript(title, audience, keyToUse);
      if (data && data.sections) {
        setScript(data);
      } else {
        throw new Error("Invalid script format received");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Script generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!script || !script.sections) return;
    const text = script.sections.map(s => `[${s.logicStep}] ${s.title} (${s.duration})\nAudio: ${s.content}\nVisual: ${s.visualCue}`).join('\n\n');
    navigator.clipboard.writeText(text);
    alert("Full script copied to clipboard!");
  };

  const getLogicColor = (stepName: string) => {
    if (stepName.includes("Hook") || stepName.includes("Payoff")) return "brand";
    if (stepName.includes("Emotional") || stepName.includes("Stakes")) return "rose";
    if (stepName.includes("Value") || stepName.includes("Context")) return "emerald";
    if (stepName.includes("Pivot") || stepName.includes("Twist")) return "amber";
    return "blue";
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] pb-10">
      <SEO 
        title="AI Video Script Writer" 
        description="Generate retention-optimized YouTube scripts with hooks, visual cues, and psychological triggers."
        path="/script"
      />
      {/* Left: Inputs (3 Cols) */}
      <div className="lg:col-span-4 space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">
        <Card title="Research & Logic" description="Define the parameters for the smart script algorithm." className="border-brand-500/20 shadow-xl shadow-brand-900/5">
          <div className="space-y-6">
            {!hasEnvKey && (
              <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-lg">
                <label className="block text-xs font-bold text-amber-200 mb-1">Groq API Key Required</label>
                <Input 
                  type="password" 
                  placeholder="gsk_..." 
                  value={userKey} 
                  onChange={(e) => setUserKey(e.target.value)} 
                  className="text-sm py-2"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Video Title / Topic</label>
              <Input 
                placeholder="e.g., How to build a PC in 2024" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Target Audience</label>
              <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option>Beginners</option>
                <option>Experts / Pro Users</option>
                <option>Children / Kids</option>
                <option>Tech Enthusiasts</option>
                <option>Lifestyle / Casual</option>
                <option>Business / Corporate</option>
              </Select>
            </div>
            
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-2">
               <p className="font-semibold text-slate-300 uppercase tracking-wider mb-2">Logic Points Applied:</p>
               <div className="grid grid-cols-2 gap-2">
                 <span className="flex items-center gap-1">⚡ The Hook</span>
                 <span className="flex items-center gap-1">🔥 The Stakes</span>
                 <span className="flex items-center gap-1">📖 Context</span>
                 <span className="flex items-center gap-1">🌀 The Twist</span>
                 <span className="flex items-center gap-1">💎 Core Value</span>
                 <span className="flex items-center gap-1">⚓ Retention</span>
                 <span className="flex items-center gap-1">❤️ Emotion</span>
                 <span className="flex items-center gap-1">🚀 Re-engage</span>
                 <span className="flex items-center gap-1">🎯 The CTA</span>
               </div>
            </div>

            <Button onClick={handleGenerate} disabled={loading || !title} className="w-full py-4 text-lg bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/30">
              {loading ? <><Spinner /> Analyzing & Writing...</> : '🚀 Generate Script'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Right: Logic Flow View (9 Cols) */}
      <div className="lg:col-span-8 h-full flex flex-col bg-slate-950/50 rounded-2xl border border-slate-800 relative overflow-hidden backdrop-blur-sm">
        {script && script.sections && script.sections.length > 0 ? (
          <>
            {/* Script Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
               <div>
                  <h2 className="text-xl font-bold text-white">{script.title}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                    <span>⏱ Est. Duration: <span className="text-brand-400">{script.estimatedDuration || 'N/A'}</span></span>
                    <span>👥 Target: <span className="text-brand-400">{script.targetAudience || audience}</span></span>
                  </div>
               </div>
               <Button onClick={handleCopyAll} variant="outline" className="text-sm">
                 📋 Copy Full Script
               </Button>
            </div>

            {/* Flow Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative">
               {/* Vertical Connecting Line */}
               <div className="absolute left-[35px] md:left-[45px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-brand-500 via-purple-500 to-transparent opacity-30"></div>
               
               <div className="space-y-8">
                 {script.sections.map((section, idx) => {
                   const color = getLogicColor(section.logicStep || "");
                   return (
                     <div key={idx} className="relative pl-12 md:pl-16 group animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                       
                       {/* Node Dot */}
                       <div className={`absolute left-[26px] md:left-[36px] top-6 w-5 h-5 rounded-full border-4 border-slate-950 z-10 transition-all duration-300 group-hover:scale-125 bg-${color}-500 shadow-[0_0_10px_rgba(var(--color-${color}-500),0.5)]`}></div>
                       
                       {/* Connector Arrow (Visual only) */}
                       <div className="absolute left-[45px] top-8 w-6 h-0.5 bg-slate-800 group-hover:bg-slate-700 transition-colors"></div>

                       {/* Card */}
                       <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                          
                          {/* Logic Header */}
                          <div className="bg-slate-950/50 px-5 py-3 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2">
                             <div className="flex items-center gap-3">
                               <Badge color={color as any}>{section.logicStep}</Badge>
                               <span className="text-slate-400 text-xs font-medium">Strategy: <span className="text-slate-200 italic">{section.psychologicalTrigger}</span></span>
                             </div>
                             <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">{section.duration}</span>
                          </div>

                          <div className="grid md:grid-cols-2">
                             {/* Audio Column */}
                             <div className="p-5 border-r border-slate-800/50">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                                  Narration
                                </h4>
                                <p className="text-slate-200 leading-relaxed text-sm md:text-base whitespace-pre-wrap font-sans">
                                  {section.content}
                                </p>
                             </div>

                             {/* Visual Column */}
                             <div className="p-5 bg-slate-900/30">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                  Visual Direction
                                </h4>
                                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3">
                                  <p className="text-indigo-200/80 text-sm italic leading-relaxed">
                                    {section.visualCue}
                                  </p>
                                </div>
                             </div>
                          </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
               
               {/* End Node */}
               <div className="relative pl-16 mt-8 pb-8">
                  <div className="absolute left-[39px] top-0 w-3 h-3 rounded-full bg-slate-800"></div>
                  <div className="text-slate-600 text-sm font-bold uppercase tracking-widest">End of Script</div>
               </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
             <div className="relative">
               <div className="absolute -inset-4 bg-brand-500/20 rounded-full blur-xl animate-pulse"></div>
               <div className="relative bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
                  <span className="text-6xl">🎬</span>
               </div>
             </div>
             <div className="max-w-md space-y-2">
               <h3 className="text-2xl font-bold text-white">Waiting for Direction</h3>
               <p className="text-slate-400 leading-relaxed">
                 Enter your topic on the left to activate the smart script logic. 
                 Our AI will structure hooks, retention spikes, and payoffs automatically.
               </p>
             </div>
             
             {/* Logic Preview Pills */}
             <div className="flex flex-wrap justify-center gap-2 opacity-50 max-w-lg">
               {['Hook', 'Stakes', 'Pivot', 'Value', 'Emotion', 'Payoff'].map(tag => (
                 <span key={tag} className="px-3 py-1 rounded-full border border-slate-700 text-xs text-slate-500">{tag}</span>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};