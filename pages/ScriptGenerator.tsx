
import React, { useState } from 'react';
import { Card, Input, Button, Spinner, Select, Badge } from '../components/UI';
import { generateScript } from '../services/geminiService';
import { ScriptResponse } from '../types';
import { SEO } from '../components/SEO';

export const ScriptGenerator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('General');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<ScriptResponse | null>(null);

  const handleGenerate = async () => {
    if (!title) return;
    setLoading(true);
    setScript(null);
    try {
      const data = await generateScript(title, audience);
      if (data && data.sections) setScript(data);
    } catch (e) {
      console.error(e);
      alert("Script generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] pb-10">
      <SEO title="Script Writer" description="AI Script Generator" path="/script" />
      
      <div className="lg:col-span-4 space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">
        <Card title="Script Settings" className="shadow-xl">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Topic</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Galaxy S24 Review" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Audience</label>
              <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option>General</option>
                <option>Experts</option>
                <option>Beginners</option>
                <option>Kids</option>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={loading || !title} className="w-full py-4">
              {loading ? <Spinner /> : 'Generate Script'}
            </Button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-8 h-full bg-slate-950/50 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
        {script ? (
          <>
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
              <h3 className="font-bold text-white truncate">{script.title}</h3>
              <Badge>{script.estimatedDuration}</Badge>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
              {script.sections.map((s, i) => (
                <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between">
                    <span className="text-brand-400 font-bold text-sm uppercase">{s.logicStep}</span>
                    <span className="text-slate-500 text-xs">{s.duration}</span>
                  </div>
                  <div className="p-4 grid md:grid-cols-2 gap-4">
                    <div className="text-slate-300 text-sm leading-relaxed">{s.content}</div>
                    <div className="text-slate-500 text-xs italic border-l border-slate-800 pl-4 flex items-center">
                      🎥 {s.visualCue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-600 flex-col gap-4">
            <div className="text-6xl opacity-20">📝</div>
            <p>Ready to write viral content.</p>
          </div>
        )}
      </div>
    </div>
  );
};
