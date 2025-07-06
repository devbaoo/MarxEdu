import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
