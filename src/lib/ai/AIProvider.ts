export interface AIRecommendation {
  severity: "high" | "medium" | "low";
  title: string;
  explanation: string;
  recommendedAction: string;
  type?: "positive" | "negative" | "neutral";
}

export interface SentimentAnalysisResult {
  sentimentScore: number; // -1.0 to +1.0
  sentimentLabel: "positive" | "neutral" | "negative";
  keywords: string[];
}

export interface ForecastResult {
  next7DaysRevenue: number[];
  next7DaysOrders: number[];
  next24HoursTraffic: number[];
  confidenceScore: number;
}

export interface AIProvider {
  analyzeReview(text: string, rating: number): Promise<SentimentAnalysisResult>;
  generateRecommendations(restaurantId: string): Promise<AIRecommendation[]>;
  generateForecast(restaurantId: string): Promise<ForecastResult>;
  semanticSearch(query: string, items: any[]): Promise<any[]>;
}
