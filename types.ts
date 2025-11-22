
export enum ToolType {
  KEYWORD_FINDER = 'keyword-finder',
  THUMBNAIL_COMPARE = 'thumbnail-compare',
  TITLE_GENERATOR = 'title-generator',
  THUMBNAIL_GENERATOR = 'thumbnail-generator',
  SCRIPT_GENERATOR = 'script-generator',
  BEST_TIME = 'best-time',
  COMPETITOR_ANALYSIS = 'competitor-analysis'
}

export interface KeywordResult {
  keyword: string;
  // Logic 1: Volume
  searchVolume: string; 
  // Logic 2: Difficulty
  difficulty: number; 
  // Logic 3: Opportunity Score
  opportunityScore: number;
  // Logic 4: Trend
  trend: 'Rising' | 'Stable' | 'Falling' | 'Seasonal';
  // Logic 5: Intent
  intent: 'Informational' | 'Educational' | 'Entertainment' | 'Commercial';
  // Logic 6: CPC (Cost Per Click)
  cpc: string;
  // Logic 7: Competition Density
  competitionDensity: 'Low' | 'Medium' | 'High' | 'Very High';
  // Logic 8: Top Competitor (Channel Name)
  topCompetitor: string;
  // Logic 9: Content Gap (Video Age avg)
  videoAgeAvg: string;
  // Logic 10: Click Potential (CTR)
  ctrPotential: 'High' | 'Average' | 'Low';
}

export interface ScriptSection {
  title: string;
  content: string;
  duration: string;
  visualCue: string;
  logicStep: string; // e.g., "The Hook", "The Twist"
  psychologicalTrigger: string; // e.g., "Creates immediate curiosity gap"
}

export interface ScriptResponse {
  title: string;
  estimatedDuration: string;
  targetAudience: string;
  sections: ScriptSection[];
}

export interface CompetitorAnalysisResult {
  channelName: string;
  subscriberEstimate: string;
  strengths: string[];
  weaknesses: string[];
  contentGaps: string[];
  topPerformingTopics: string[];
  actionPlan: string;
}

export interface ThumbnailCompareResult {
  winner: 'A' | 'B';
  scoreA: number;
  scoreB: number;
  reasoning: string;
  breakdown: {
    criterion: string;
    winner: 'A' | 'B';
    explanation: string;
  }[];
}

export interface ThumbnailGenResult {
  imageUrl: string;
  originalPrompt: string;
  optimizedPrompt: string;
  style: string;
  createdAt: number;
}
