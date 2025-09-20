export interface ISurveyQuestion {
  questionText: string;
  questionType: "rating" | "multiple_choice" | "text";
  options: string[];
  required: boolean;
  order: number;
  _id: string;
}

export interface ISurveyReward {
  xp: number;
  points: number;
}

export interface ISurvey {
  _id: string;
  title: string;
  description: string;
  questions: ISurveyQuestion[];
  reward: ISurveyReward;
  isActive: boolean;
  version: number;
  createdBy: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ISurveyStatus {
  hasCompleted: boolean;
  surveyVersion: number;
}

export interface ISurveyAnswer {
  questionId: string;
  answer: string | number | string[];
}

export interface ISurveySubmission {
  surveyId: string;
  answers: ISurveyAnswer[];
}

// Admin interfaces
export interface ICreateSurveyQuestion {
  questionText: string;
  questionType: "rating" | "multiple_choice" | "text";
  options?: string[];
  required: boolean;
  order: number;
}

export interface ICreateSurvey {
  title: string;
  description: string;
  questions: ICreateSurveyQuestion[];
  reward: ISurveyReward;
}

export interface IRatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface IOptionDistribution {
  option: string;
  count: number;
  percentage: number;
}

export interface IQuestionStatistics {
  questionId: string;
  questionText: string;
  questionType: "rating" | "multiple_choice" | "text";
  totalResponses: number;
  averageRating?: number;
  ratingDistribution?: IRatingDistribution[];
  options?: IOptionDistribution[];
  textResponses?: string[];
}

export interface ISurveyStatistics {
  totalResponses: number;
  surveyVersion: number;
  questions: IQuestionStatistics[];
}
