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

  const handleGenerate = async () => {
    if (!title) return;
    setLoading(true);
    setScript(null);
    try {
      // Service handles all auth automatically.
      const data = await generateScript(title, audience);
      if (data && data.sections) {
        setScript(data);
      } else {
        throw new Error("Invalid script format received");
      }
    } catch (err: any) {
      console.error(err);
      // Non-blocking alert for errors
      alert("Unable to generate script. Please try again in a moment.");
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

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] pb-10">
      <SEO title="AI Video Script Writer" description="Generate retention-optimized YouTube scripts." path="/script" />
      <div className="lg:col-span-4 space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">
        <Card title="Research & Logic" description="Define the parameters for the smart script algorithm." className="border-brand-500/20 shadow-xl shadow-brand-900/5">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Video Title / Topic</label>
              <Input placeholder="e.g., How to build a PC in 2024" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Target Audience</label>
              <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option>Beginners</option>
                <option>Experts / Pro Users</option>
                <option>Children</option>
                <option>Tech Enthusiasts</option>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={loading || !title} className="w-full py-4 text-lg">
              {loading ? <><Spinner /> Analyzing...</> : '🚀 Generate Script'}
            </Button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-8 h-full flex flex-col bg-slate-950/50 rounded-2xl border border-slate-800 relative overflow-hidden backdrop-blur-sm">
        {script && script.sections && script.sections.length > 0 ? (
          <>
            <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
               <div>
                  <h2 className="text-xl font-bold text-white">{script.title}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                    <span>⏱ {script.estimatedDuration}</span>
                  </div>
               </div>
               <Button onClick={handleCopyAll} variant="outline" className="text-sm">📋 Copy</Button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
               {script.sections.map((section, idx) => (
                 <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
                    <div className="bg-slate-950/50 px-5 py-3 border-b border-slate-800 flex justify-between items-center">
                       <Badge color="brand">{section.logicStep}</Badge>
                       <span className="text-xs text-slate-500">{section.duration}</span>
                    </div>
                    <div className="grid md:grid-cols-2">
                       <div className="p-5 border-r border-slate-800/50">
                          <p className="text-slate-200 text-sm">{section.content}</p>
                       </div>
                       <div className="p-5 bg-slate-900/30">
                          <p className="text-indigo-200/80 text-sm italic">{section.visualCue}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
             <span className="text-6xl">🎬</span>
             <h3 className="text-2xl font-bold text-white">Script Writer</h3>
             <p className="text-slate-400">Powered by Llama 3.3 (Groq)</p>
          </div>
        )}
      </div>
    </div>
  );
};
