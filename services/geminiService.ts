
import { ThumbnailGenResult } from "../types";

// --- CONFIGURATION ---

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; 

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_VISION_MODEL = "x-ai/grok-vision-beta"; 

// --- API KEY MANAGEMENT ---

const getApiKey = (provider: 'GROQ' | 'OPENROUTER'): string => {
  // In Vite, we access env vars via import.meta.env
  if (provider === 'GROQ') {
    return import.meta.env.VITE_GROQ_API_KEY || "";
  } else {
    return import.meta.env.VITE_OPENROUTER_API_KEY || "";
  }
};

// --- CORE HELPERS ---

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
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
      // We return empty JSON on failure to prevent app crashes
      return "{}";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "{}";
  } catch (error) {
    console.error("LLM Call Failed:", error);
    return "{}";
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
    Return strictly a JSON object: { "keywords": [ { "keyword": "...", "searchVolume": "...", "difficulty": 50, "opportunityScore": 80, "trend": "Rising", "intent": "Educational", "cpc": "$1.20", "competitionDensity": "Medium", "topCompetitor": "Channel Name", "videoAgeAvg": "2 years", "ctrPotential": "High" } ] }
  `;
  const json = await callLLM('GROQ', GROQ_MODEL, [{ role: "user", content: prompt }]);
  try {
    const parsed = JSON.parse(cleanJson(json));
    return Array.isArray(parsed.keywords) ? parsed.keywords : [];
  } catch (e) {
    return [];
  }
};

// HYBRID MODEL: Web Scraper + AI Reasoning
export const analyzeCompetitor = async (channelUrl: string): Promise<any> => {
  let contextData = "";
  
  // 1. Web Scraping Layer
  try {
    // Use AllOrigins to proxy the request and avoid CORS
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(channelUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const data = await response.json();
      const html = data.contents;
      
      // Regex extraction for key metadata (lighter than parsing full DOM)
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const descMatch = html.match(/name="description" content="(.*?)"/);
      const keywordsMatch = html.match(/name="keywords" content="(.*?)"/);
      
      const title = titleMatch ? titleMatch[1] : "Unknown Channel";
      const description = descMatch ? descMatch[1] : "";
      const keywords = keywordsMatch ? keywordsMatch[1] : "";
      
      contextData = `Channel Name: ${title}\nDescription: ${description}\nKeywords: ${keywords}`;
    }
  } catch (e) {
    console.warn("Scraping failed, proceeding with AI inference only.", e);
    contextData = `Channel URL: ${channelUrl} (Metadata could not be scraped)`;
  }

  // 2. AI Reasoning Layer
  const prompt = `
    Analyze this competitor channel based on the available data:
    ${contextData.substring(0, 2000)}
    
    If data is scarce, infer based on the channel name or likely niche.
    
    Task: Provide a strategic analysis.
    Return JSON:
    {
      "channelName": "...",
      "subscriberEstimate": "e.g. 100k-500k",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
      "contentGaps": ["gap 1", "gap 2", "gap 3"],
      "actionPlan": "One sentence strategy to beat them."
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
        content: `Optimize this image prompt for Flux AI. Make it highly detailed. Prompt: "${prompt}". Style: ${style}, ${mood}. Output ONLY text.` 
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
  const prompt = `Analyze these two thumbnails. Which has higher CTR? Return JSON: { "winner": "A", "scoreA": 8, "scoreB": 6, "reasoning": "...", "breakdown": [{"criterion": "Contrast", "winner": "A", "explanation": "..."}] }`;

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
