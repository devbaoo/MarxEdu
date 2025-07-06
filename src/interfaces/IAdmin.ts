export interface IAdmin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginDate: string;
}

export interface INoticationAll {
  title: string;
  message: string;
}

export interface IPackageFeature {
  doubleXP: boolean;
  premiumLessons?: boolean;
  unlimitedLives: boolean;
}
export interface IPackageUpdateCreate {
  name: string;
  description: string;
  price: number;
  duration: number;
  discount: number;
  discountEndDate: string;
  features?: IPackageFeature;
}

export interface IPackage {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
  discount: number;
  discountEndDate: string;
  createdAt: string;
  updatedAt: string;
  features: IPackageFeature;
}

export interface ITopic {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface ILevel {
  _id: string;
  name: string;
  maxScore: number;
  timeLimit: number;
  minUserLevel: number;
  minLessonPassed: number;
  minScoreRequired: number;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface ISkill {
  _id: string;
  name: string;
  description: string;
  supportedTypes: string[];
  isActive: boolean;
  createdAt: string;
}

export interface IQuestion {
  _id: string;
  lessonId: string;
  content: string;
  options: string[];
  correctAnswer: string;
  score: number;
  createdAt: string;
}

export interface ILesson {
  _id: string;
  title: string;
  type: "multiple_choice" | "text_input" | "audio_input";
  topic: ITopic;
  level: ILevel | null;
  skill: ISkill;
  maxScore: number;
  timeLimit: number;
  questions: IQuestion[];
  isActive: boolean;
  createdAt: string;
}

export interface ILessonsResponse {
  success: boolean;
  lessons: ILesson[];
  total: number;
  page: number;
  limit: number;
}

export interface IUserRoleUpdateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  user: UserManager;
}

export interface UserManager {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
