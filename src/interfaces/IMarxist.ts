// Marxist Philosophy Topic Interfaces
export interface IMarxistPhilosophyTopic {
  _id: string;
  name: string;
  title: string;
  description: string;
  keywords: string[];
  suggestedDifficulty: number;
  suggestedQuestionCount: number;
  displayOrder: number;
  totalLessonsGenerated: number;
  averageScore: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateMarxistPhilosophyTopicData {
  name: string;
  title: string;
  description: string;
  keywords?: string[];
  suggestedDifficulty?: number;
  suggestedQuestionCount?: number;
  displayOrder?: number;
}

export interface IUpdateMarxistPhilosophyTopicData {
  title?: string;
  description?: string;
  keywords?: string[];
  suggestedDifficulty?: number;
  suggestedQuestionCount?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface IMarxistPhilosophyTopicsResponse {
  success: boolean;
  message: string;
  topics: IMarxistPhilosophyTopic[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

// Marxist Philosophy Learning Path Interfaces
export interface IMarxistLearningPath {
  pathId: string;
  lessonId: string;
  title: string;
  marxistPhilosophyTopic: {
    id: string;
    name: string;
    title: string;
    description: string;
  };
  difficultyLevel: number;
  recommendedReason: string;
  previousScore: number;
  order: number;
  completed: boolean;
  achievedScore?: number;
  completedAt?: string;
  status: "LOCKED" | "ACTIVE" | "COMPLETE";
  createdAt: string;
}

export interface IMarxistPhilosophyLearningPath {
  pathId: string;
  lessonId: string;
  title: string;
  marxistPhilosophyTopic: {
    id: string;
    name: string;
    title: string;
    description: string;
  };
  difficultyLevel: number;
  recommendedReason: string;
  previousScore: number;
  order: number;
  completed: boolean;
  achievedScore?: number;
  completedAt?: string;
  status: "LOCKED" | "ACTIVE" | "COMPLETE";
  createdAt: string;
}

// Learning path response interface
export interface IMarxistPhilosophyLearningPathResponse {
  success: boolean;
  statusCode: number;
  message: string;
  learningPath: IMarxistLearningPath[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  // New field for first-time users
  needsFirstLesson?: boolean;
  availableTopics?: number;
}

// Marxist Philosophy Lesson Generation Interfaces
export interface IGenerateMarxistPhilosophyLessonOptions {
  topic?: string;
  difficulty?: number;
}

export interface IGenerateMarxistPhilosophyLessonResponse {
  success: boolean;
  statusCode: number;
  message: string;
  lesson?: {
    lessonId: string;
    title: string;
    topic: string;
    difficultyLevel: number;
    questionCount: number;
    maxScore: number;
    createdAt: string;
  };
  learningPath?: {
    pathId: string;
    order: number;
    marxistTopic: {
      id: string;
      name: string;
      title: string;
    };
    recommendedReason: string;
  };
}

// Marxist Philosophy Statistics Interfaces
export interface IMarxistPhilosophyTopicStats {
  topicId: string;
  name: string;
  title: string;
  total: number;
  completed: number;
  avgScore: number;
}

export interface IMarxistPhilosophyStats {
  totalLessons: number;
  completedLessons: number;
  completionRate: number;
  overallAvgScore: number;
  topicBreakdown: IMarxistPhilosophyTopicStats[];
}

export interface IMarxistPhilosophyStatsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  stats: IMarxistPhilosophyStats;
}

// Progress Analysis Interfaces
export interface IMarxistPhilosophyProgressAnalysis {
  recommendedTopic: string;
  difficultyLevel: number;
  previousScore?: number;
  reason: string;
}

export interface IMarxistPhilosophyProgressAnalysisResponse {
  success: boolean;
  message: string;
  analysis: IMarxistPhilosophyProgressAnalysis;
}

// Complete Lesson Interfaces
export interface ICompleteMarxistPhilosophyLessonData {
  lessonId: string;
  score: number;
  questionResults?: Array<{
    questionId: string;
    answer: string; // Backend expects 'answer', not 'userAnswer'
    isCorrect: boolean;
    score: number;
    isTimeout?: boolean;
    transcription?: string | null;
    feedback?: string | null;
  }>;
}

// Complete lesson response interface
export interface ICompleteMarxistPhilosophyLessonResponse {
  success: boolean;
  statusCode: number;
  message: string;
  pathUpdated: boolean;
  completed: boolean;
  nextLessonGenerated: boolean;
  // Lives system
  livesDeducted: boolean;
  currentLives: number;
  // Score info
  scoreAchieved: number;
  passed: boolean;
  // XP & Level system
  earnedXP: number;
  leveledUp: boolean;
  newLevel: number;
  livesFromLevelUp: number;
  currentXP: number;
  nextLevelRequiredXP: number;
  // Progress system (NEW)
  progressId: string;
  progressStatus: "COMPLETE" | "FAILED";
}

// Multi-AI Connection Test Interfaces
export interface IAIProviderStatus {
  success: boolean;
  connected: boolean;
  message: string;
  model?: string;
  response?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  config?: {
    model: string;
    baseUrl: string;
    apiKeyStatus: string;
    source: string;
  };
}

export interface IMultiAIConnectionResponse {
  success: boolean;
  message: string;
  results: {
    gemini: IAIProviderStatus;
    grok: IAIProviderStatus;
  };
  summary: {
    total: number;
    connected: number;
    failed: number;
  };
}

// Load Balancer Info Interface
export interface ILoadBalancerInfo {
  strategy: string;
  providerAttempt: number;
  totalProviders: number;
  currentLoads?: Record<string, number>;
  attemptedProviders?: string[];
  totalAttempts?: number;
  failureCounts?: Record<string, number>;
}

// Enhanced Generation Response with Load Balancer Info
export interface IGenerateMarxistPhilosophyLessonResponse {
  success: boolean;
  statusCode: number;
  message: string;
  lesson?: {
    lessonId: string;
    title: string;
    topic: string;
    difficultyLevel: number;
    questionCount: number;
    maxScore: number;
    createdAt: string;
  };
  learningPath?: {
    pathId: string;
    order: number;
    marxistTopic: {
      id: string;
      name: string;
      title: string;
    };
    recommendedReason: string;
  };
  // Multi-AI specific fields
  provider?: string; // 'gemini' | 'grok'
  loadBalancer?: ILoadBalancerInfo;
}

// Legacy Gemini Connection Response (for backward compatibility)
export interface IGeminiConnectionResponse {
  success: boolean;
  message: string;
  connected: boolean;
}

// ========= Pre-study Content Pack =========
// Recursive type for mindmap nodes
interface IMindmapNode {
  id: string;
  label: string;
  children?: IMindmapNode[];
}

// Source interface for content references
interface IContentSource {
  title: string;
  url?: string;
  author?: string;
  type?: "book" | "article" | "video" | "website" | "document";
  description?: string;
}

export interface IContentPack {
  title: string;
  topicId?: string;
  topicName?: string;
  level?: string;
  goal?: string;
  summary?: string;
  keyPoints?: string[];
  mindmapNodes?: IMindmapNode[];
  flashcards?: Array<{
    term: string;
    definition: string;
    example?: string;
    tags?: string[];
    difficulty?: "easy" | "medium" | "hard";
  }>;
  slideOutline?: string[];
  readingTime?: number;
  sources?: IContentSource[];
}

export interface IGenerateContentPackPayload {
  topicId?: string;
  topicName?: string;
  level?: string;
  goal?: string;
  include?: {
    summary?: boolean;
    keyPoints?: boolean;
    mindmap?: boolean;
    flashcards?: boolean;
    slideOutline?: boolean;
  };
}

export interface IGenerateContentPackResponse {
  success: boolean;
  contentPack: IContentPack;
}

export interface IGenerateLessonFromContentPayload {
  topicId?: string;
  topicName?: string;
  level?: string;
  goal?: string;
  questionCount?: number; // default 10
}

// ⚡ Performance Monitoring Interfaces
export interface IGenerationStats {
  success: boolean;
  message: string;
  stats: {
    queue: {
      currentRunning: number;
      queueLength: number;
      maxConcurrent: number;
      totalProcessed: number;
      totalFailed: number;
      avgProcessingTime: number;
    };
    rateLimiter: {
      concurrent: number;
      queued: number;
      lastReset: string;
    };
    performance: {
      avgGenerationTime: number;
      totalGenerations: number;
      successRate: number;
    };
  };
}

export interface IMultiAiStats {
  success: boolean;
  message: string;
  stats: {
    providers: Array<{
      name: string;
      priority: number;
      weight: number;
      maxConcurrent: number;
      currentLoad: number;
      failures: number;
      lastUsed: number;
    }>;
    timestamp: number;
  };
}

export interface IRateLimiterStats {
  success: boolean;
  message: string;
  stats: {
    concurrent: number;
    queued: number;
    processed: number;
    failed: number;
    lastReset: string;
    memoryUsage: number;
  };
}
