export interface IFlashcard {
  id: string;
  front: string;
  back: string;
  tags: string[];
}

export interface IFlashcardListResponse {
  success: boolean;
  message: string;
  data: IFlashcard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IFlashcardTagSummary {
  tag: string;
  count: number;
}

export interface IFlashcardTagsResponse {
  success: boolean;
  message: string;
  tags: IFlashcardTagSummary[];
}

export interface IFlashcardDetailResponse {
  success: boolean;
  message: string;
  data: IFlashcard;
}

export interface IRandomFlashcardsResponse {
  success: boolean;
  message: string;
  data: IFlashcard[];
}

export interface IFlashcardQueryParams {
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IRandomFlashcardQueryParams {
  tag?: string;
  limit?: number;
}
