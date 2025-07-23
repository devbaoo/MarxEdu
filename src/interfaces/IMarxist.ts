// Marxist Topic Interfaces
export interface IMarxistTopic {
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

export interface ICreateMarxistTopicData {
  name: string;
  title: string;
  description: string;
  keywords?: string[];
  suggestedDifficulty?: number;
  suggestedQuestionCount?: number;
  displayOrder?: number;
}

export interface IUpdateMarxistTopicData {
  title?: string;
  description?: string;
  keywords?: string[];
  suggestedDifficulty?: number;
  suggestedQuestionCount?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface IMarxistTopicsResponse {
  success: boolean;
  message: string;
  topics: IMarxistTopic[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

// Marxist Learning Path Interfaces
export interface IMarxistLearningPath {
  pathId: string;
  lessonId: string;
  title: string;
  marxistTopic: {
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

export interface IMarxistLearningPathResponse {
  success: boolean;
  message: string;
  learningPath: IMarxistLearningPath[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

// Marxist Lesson Generation Interfaces
export interface IGenerateMarxistLessonOptions {
  topic?: string;
  difficulty?: number;
}

export interface IGenerateMarxistLessonResponse {
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

// Marxist Statistics Interfaces
export interface IMarxistTopicStats {
  topicId: string;
  name: string;
  title: string;
  total: number;
  completed: number;
  avgScore: number;
}

export interface IMarxistStats {
  totalLessons: number;
  completedLessons: number;
  completionRate: number;
  overallAvgScore: number;
  topicBreakdown: IMarxistTopicStats[];
}

export interface IMarxistStatsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  stats: IMarxistStats;
}

// Progress Analysis Interfaces
export interface IMarxistProgressAnalysis {
  recommendedTopic: string;
  difficultyLevel: number;
  previousScore?: number;
  reason: string;
}

export interface IMarxistProgressAnalysisResponse {
  success: boolean;
  message: string;
  analysis: IMarxistProgressAnalysis;
}

// Complete Lesson Interfaces
export interface ICompleteMarxistLessonData {
  lessonId: string;
  score: number;
}

export interface ICompleteMarxistLessonResponse {
  success: boolean;
  statusCode: number;
  message: string;
  pathUpdated?: boolean;
  completed?: boolean;
  nextLessonGenerated?: boolean;
  livesDeducted?: boolean;
  currentLives?: number;
  scoreAchieved?: number;
  passed?: boolean;
}

// Gemini Connection Test Interface
export interface IGeminiConnectionResponse {
  success: boolean;
  message: string;
  connected: boolean;
} 