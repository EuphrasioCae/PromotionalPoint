export interface NPSQuestion {
  id: string;
  questionId: string;
  text: string;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface NPSResponse {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  rating: 'good' | 'regular' | 'bad';
  comment?: string;
  createdAt: Date;
}

export interface NPSUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}
