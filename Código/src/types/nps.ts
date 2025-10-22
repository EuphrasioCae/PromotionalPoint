export type ScaleType = 'emoji5' | 'emoji3' | 'numeric';

export type Emoji5Rating = 'bad' | 'not_good' | 'good' | 'very_good' | 'excellent';
export type Emoji3Rating = 'bad' | 'good' | 'excellent';

export type Rating =
  | { type: 'emoji5'; value: Emoji5Rating }
  | { type: 'emoji3'; value: Emoji3Rating }
  | { type: 'numeric'; value: number };

export interface NPSQuestion {
  id: string;
  questionId: string;
  text: string;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  scaleType: ScaleType;
  company: string;
  assignedTo: 'all' | 'selected';
  assignedUserIds?: string[];
}

export interface NPSResponse {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  rating: Rating;
  comment?: string;
  createdAt: Date;
  company: string;
}

export interface NPSUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  company: string;
  origin?: string;
  createdAt: Date;
}
