
import { ThumbnailGenResult } from "../types";

// --- CONFIGURATION ---

// Groq Config (Reasoning & Text)
// Using Llama 3.3 70B as the high-intelligence reasoning model
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; 

// OpenRouter Config (Vision)
// Using Grok 4.1 or equivalent Vision model
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_VISION_MODEL = "x-ai/grok-vision-beta"; // Fallback compatible model name

// --- API KEY MANAGEMENT ---

const getApiKey = (provider: 'GROQ' | 'OPENROUTER'): string => {
  let key = "";
  
  // Vercel injects VITE_ prefixed variables at build time via the 'define' plugin in vite.config.ts
  // We access them directly from process.env for compatibility with the build config
  if (provider === 'GROQ') {
    // @ts-ignore
    key = process.env.VITE_GROQ_API_KEY || "";
  } else {
    // @ts-ignore
    key = process.env.VITE_OPENROUTER_API_KEY || "";
  }
  
  return key ? key.replace(/["']/g, "").trim() : "";
};

// --- CORE HELPERS ---

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  // Remove markdown code blocks
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  // Remove thinking/reasoning blocks often found in reasoning models
  clean = clean.replace(/<think>[\s\S]*?<\/think>/g, "");
  
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
};

const callLLM = async (
  provider: 'GROQ' | 'OPENROUTER',
  model: string,
  messages: any[],
  jsonMode: boolean = true
): Promise<string> => {
  const url = provider === 'GROQ' ? GROQ_API_URL : OPENROUTER_API_URL;
  const apiKey = getApiKey(provider);

  // We do NOT throw an error if the key is missing here. 
  // We let the request go through. If it fails 401, we handle it gracefully.
  
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  if (provider === 'OPENROUTER') {
    headers["HTTP-Referer"] = "https://tubemaster.ai";
    headers["X-Title"] = "TubeMaster";
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
        response_format: jsonMode ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`LLM Error (${response.status}):`, errText);
      throw new Error(`AI Provider Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "{}";
  } catch (error) {
    console.error("LLM Call Failed:", error);
    throw error;
  }
};

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const MAX = 1024;
      let w = img.width;
      let h = img.height;
      if (w > h) { if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; } }
      else { if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; } }
      
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

// --- EXPORTED SERVICES ---

export const findKeywords = async (topic: string): Promise<any[]> => {
  const prompt = `
    Act as a YouTube SEO Algorithm Expert.
    Topic: "${topic}"
    
    Generate 10 highly specific keywords/tags.
    Analyze them with these metrics:
    1. Search Volume (Monthly estimate)
    2. Difficulty (0-100)
    3. Opportunity Score (0-100)
    4. Trend (Rising/Stable/Falling)
    5. Intent (Educational/Entertainment/etc)
    6. CPC (Ad value)
    7. Competition Density
    8. Top Competitor Name
    9. Video Age Avg
    10. CTR Potential
    
    Return strictly a JSON object: { "keywords": [ { "keyword": "...", "searchVolume": "...", ... } ] }
  `;

  const json = await callLLM('GROQ', GROQ_MODEL, [{ role: "user", content: prompt }]);
  try {
    const parsed = JSON.parse(cleanJson(json));
    return Array.isArray(parsed.keywords) ? parsed.keywords : [];
  } catch (e) {
    console.error("Keyword parsing failed", e);
    return [];
  }
};

// HYBRID MODEL: Scraper + AI
export const analyzeCompetitor = async (channelUrl: string): Promise<any> => {
  let contextData = "";

  // 1. Web Scraping Layer (Hybrid)
  try {
    // Using AllOrigins to bypass CORS for client-side scraping
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(channelUrl)}`;
    const res = await fetch(proxy);
    if (res.ok) {
      const data = await res.json();
      const html = data.contents || "";
      
      // Basic regex extraction since we can't use DOMParser easily on raw strings in all envs
      const title = html.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const desc = html.match(/name="description" content="(.*?)"/)?.[1] || "";
      const keywords = html.match(/name="keywords" content="(.*?)"/)?.[1] || "";
      
      contextData = `Channel Title: ${title}\nDescription: ${desc}\nKeywords: ${keywords}`;
    }
  } catch (e) {
    console.warn("Scraping layer failed, falling back to pure AI inference.");
  }

  if (!contextData) {
    contextData = `Channel URL: ${channelUrl} (Scraping unreachable, infer from URL)`;
  }

  // 2. AI Reasoning Layer
  const prompt = `
    Analyze this YouTube competitor based on the scraped data below:
    ${contextData.substring(0, 1500)}

    Task: Provide a commercial strategic analysis.
    1. Estimate subscriber range based on fame/content.
    2. List 3 strengths.
    3. List 3 weaknesses.
    4. Identify 3 Content Gaps (topics they miss).
    5. Create a 1-sentence strategic action plan to beat them.

    Return strictly JSON:
    {
      "channelName": "...",
      "subscriberEstimate": "...",
      "strengths": ["..."],
      "weaknesses": ["..."],
      "contentGaps": ["..."],
      "actionPlan": "..."
    }
  `;

  const json = await callLLM('GROQ', GROQ_MODEL, [{ role: "user", content: prompt }]);
  return JSON.parse(cleanJson(json));
};

export const generateScript = async (title: string, audience: string): Promise<any> => {
  const prompt = `
    Write a YouTube script for "${title}" aimed at "${audience}".
    Structure: Hook -> Context -> Value -> Pattern Interrupt -> Payoff.
    Return JSON: { "title": "...", "estimatedDuration": "...", "targetAudience": "...", "sections": [ { "title": "...", "content": "...", "duration": "...", "visualCue": "...", "logicStep": "..." } ] }
  `;
  const json = await callLLM('GROQ', GROQ_MODEL, [{ role: "user", content: prompt }]);
  return JSON.parse(cleanJson(json));
};

export const generateTitles = async (topic: string): Promise<string[]> => {
  const prompt = `Generate 10 click-worthy, viral-style YouTube titles for: "${topic}". Return JSON: { "titles": ["..."] }`;
  const json = await callLLM('GROQ', GROQ_MODEL, [{ role: "user", content: prompt }]);
  const parsed = JSON.parse(cleanJson(json));
  return parsed.titles || [];
};

export const suggestBestTime = async (title: string, audience: string, tags: string): Promise<string> => {
  const prompt = `Best time to publish video "${title}" for "${audience}". Keep it brief (2 sentences).`;
  return await callLLM('GROQ', GROQ_MODEL, [{ role: "user", content: prompt }], false);
};

export const generateThumbnail = async (prompt: string, style: string, mood: string, optimize: boolean): Promise<ThumbnailGenResult> => {
  let finalPrompt = prompt;
  
  if (optimize) {
    try {
      finalPrompt = await callLLM('GROQ', GROQ_MODEL, [{ 
        role: "user", 
        content: `Optimize this image prompt for Flux AI. Make it highly detailed, cinematic lighting. Prompt: "${prompt}". Style: ${style}, ${mood}. Output ONLY text.` 
      }], false);
    } catch (e) { /* ignore */ }
  }

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1280&height=720&model=flux&seed=${Math.floor(Math.random() * 9999)}`;
  
  return {
    imageUrl: url,
    originalPrompt: prompt,
    optimizedPrompt: finalPrompt,
    style,
    createdAt: Date.now()
  };
};

export const compareThumbnailsVision = async (imgA: string, imgB: string, provider: 'GROQ' | 'OPENROUTER'): Promise<any> => {
  const [cA, cB] = await Promise.all([compressImage(imgA), compressImage(imgB)]);
  
  const prompt = `
    Analyze these two YouTube thumbnails. 
    Which one has higher CTR potential?
    Return JSON:
    {
      "winner": "A" or "B",
      "scoreA": number 0-10,
      "scoreB": number 0-10,
      "reasoning": "summary...",
      "breakdown": [ { "criterion": "Contrast", "winner": "A", "explanation": "..." } ]
    }
  `;

  const json = await callLLM('OPENROUTER', OPENROUTER_VISION_MODEL, [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: cA } },
        { type: "image_url", image_url: { url: cB } }
      ]
    }
  ]);

  return JSON.parse(cleanJson(json));
};
