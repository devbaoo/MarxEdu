export interface ITopic {
  success: boolean;
  statusCode: number;
  message: string;
  topics: {
    _id: string;
    name: string;
    description: string;
  }[];
}
