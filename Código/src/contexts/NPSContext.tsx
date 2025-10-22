import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { NPSQuestion, NPSResponse, NPSUser, Rating } from '@/types/nps';
import { useAuth } from '@/contexts/AuthContext';

interface NPSContextType {
  questions: NPSQuestion[];
  responses: NPSResponse[];
  users: NPSUser[];
  addQuestion: (question: Omit<NPSQuestion, 'id' | 'createdAt'>) => void;
  updateQuestion: (id: string, updates: Partial<NPSQuestion>) => void;
  deleteQuestion: (id: string) => void;
  addResponse: (response: Omit<NPSResponse, 'id' | 'createdAt'>) => void;
  addUser: (user: Omit<NPSUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<NPSUser>) => void;
  deleteUser: (id: string) => void;
}

const NPSContext = createContext<NPSContextType | undefined>(undefined);

// Mock initial data
const initialQuestions: NPSQuestion[] = [
  {
    id: '1',
    questionId: 'Q001',
    text: 'How satisfied are you with our customer service?',
    createdAt: new Date('2024-01-15'),
    createdBy: 'Admin User',
    isActive: true,
    scaleType: 'emoji3',
    company: 'Acme Corp',
    assignedTo: 'all'
  },
  {
    id: '2',
    questionId: 'Q002',
    text: 'How would you rate the quality of our product?',
    createdAt: new Date('2024-01-20'),
    createdBy: 'Admin User',
    isActive: true,
    scaleType: 'emoji5',
    company: 'Acme Corp',
    assignedTo: 'all'
  }
];

const initialResponses: NPSResponse[] = [
  {
    id: '1',
    questionId: '1',
    userId: '2',
    userName: 'Regular User',
    rating: { type: 'emoji3', value: 'good' },
    comment: 'Excellent service!',
    createdAt: new Date('2024-01-16'),
    company: 'Acme Corp'
  },
  {
    id: '2',
    questionId: '1',
    userId: '3',
    userName: 'John Doe',
    rating: { type: 'emoji3', value: 'bad' },
    createdAt: new Date('2024-01-17'),
    company: 'Acme Corp'
  },
  {
    id: '3',
    questionId: '2',
    userId: '2',
    userName: 'Regular User',
    rating: { type: 'emoji5', value: 'very_good' },
    createdAt: new Date('2024-01-21'),
    company: 'Acme Corp'
  }
];

const initialUsers: NPSUser[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    company: 'Acme Corp',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    company: 'Acme Corp',
    origin: 'cliente',
    createdAt: new Date('2024-01-05')
  }
];

export const NPSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<NPSQuestion[]>([]);
  const [responses, setResponses] = useState<NPSResponse[]>([]);
  const [users, setUsers] = useState<NPSUser[]>([]);
  const { user: authUser } = useAuth();

  useEffect(() => {
    // Load from localStorage or use initial data
    const storedQuestions = localStorage.getItem('nps_questions');
    const storedResponses = localStorage.getItem('nps_responses');
    const storedUsers = localStorage.getItem('nps_users');

    setQuestions(storedQuestions ? JSON.parse(storedQuestions) : initialQuestions);
    setResponses(storedResponses ? JSON.parse(storedResponses) : initialResponses);
    setUsers(storedUsers ? JSON.parse(storedUsers) : initialUsers);
  }, []);

  useEffect(() => {
    localStorage.setItem('nps_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('nps_responses', JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem('nps_users', JSON.stringify(users));
  }, [users]);

  const addQuestion = (question: Omit<NPSQuestion, 'id' | 'createdAt'>) => {
    const newQuestion: NPSQuestion = {
      ...question,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<NPSQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addResponse = (response: Omit<NPSResponse, 'id' | 'createdAt'>) => {
    const newResponse: NPSResponse = {
      ...response,
      id: Date.now().toString(),
      createdAt: new Date(),
      company: authUser?.company || 'Acme Corp'
    };
    setResponses([...responses, newResponse]);
  };

  const addUser = (user: Omit<NPSUser, 'id' | 'createdAt'>) => {
    const newUser: NPSUser = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date(),
      company: authUser?.company || 'Acme Corp'
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, updates: Partial<NPSUser>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  // Company-level filtering
  const company = authUser?.company;
  const companyQuestions = useMemo(() => {
    if (!company) return questions;
    return questions.filter(q => q.company === company);
  }, [questions, company]);

  const companyResponses = useMemo(() => {
    if (!company) return responses;
    return responses.filter(r => r.company === company);
  }, [responses, company]);

  const companyUsers = useMemo(() => {
    if (!company) return users;
    return users.filter(u => u.company === company);
  }, [users, company]);

  return (
    <NPSContext.Provider value={{
      questions: companyQuestions,
      responses: companyResponses,
      users: companyUsers,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addResponse,
      addUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </NPSContext.Provider>
  );
};

export const useNPS = () => {
  const context = useContext(NPSContext);
  if (context === undefined) {
    throw new Error('useNPS must be used within an NPSProvider');
  }
  return context;
};
