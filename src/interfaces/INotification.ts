export interface INotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  __v: number;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface INotificationResponse {
  notifications: INotification[];
  pagination: IPagination;
}
