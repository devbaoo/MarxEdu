import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { IQuestion } from "@/interfaces/ILesson"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fisher-Yates shuffle algorithm for array randomization
 * @param array - Array to shuffle
 * @returns New shuffled array (immutable)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Create copy to avoid mutation
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle questions array
 * @param questions - Array of questions to shuffle
 * @returns Shuffled questions array
 */
export function shuffleQuestions(questions: IQuestion[]): IQuestion[] {
  console.log('🔀 Shuffling questions order...');
  return shuffleArray(questions);
}

/**
 * Shuffle options within a question while maintaining correct answer
 * @param question - Question with options to shuffle
 * @returns Question with shuffled options and updated correctAnswer
 */
export function shuffleQuestionOptions(question: IQuestion): IQuestion {
  if (!question.options || question.options.length === 0) {
    return question;
  }

  // Create copy to avoid mutation
  const shuffledOptions = shuffleArray(question.options);
  
  // Find the new position of the correct answer
  const originalCorrectAnswer = question.correctAnswer;
  const newCorrectAnswer = shuffledOptions.find(option => option === originalCorrectAnswer);
  
  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: newCorrectAnswer || originalCorrectAnswer
  };
}

/**
 * Shuffle all options in all questions
 * @param questions - Array of questions with options to shuffle
 * @returns Questions with shuffled options
 */
export function shuffleAllQuestionOptions(questions: IQuestion[]): IQuestion[] {
  console.log('🔀 Shuffling options for all questions...');
  return questions.map(question => shuffleQuestionOptions(question));
}

export type Unit = {
  unitNumber: number;
  description: string;
  backgroundColor: `bg-${string}`;
  textColor: `text-${string}`;
  borderColor: `border-${string}`;
  tiles: Tile[];
};

export type TileType =
  | "star"
  | "book"
  | "dumbbell"
  | "fast-forward"
  | "treasure"
  | "trophy";

export interface Tile {
  type: TileType;
  description: string;
  lessonId?: string;
}
