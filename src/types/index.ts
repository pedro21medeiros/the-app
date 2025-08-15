export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'income';
  dueDate: Date;
  isRecurring: boolean;
  status: 'pending' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'expense' | 'income' | 'both';
}

export interface NotificationSettings {
  enabled: boolean;
  daysBefore: number;
  time: string; // formato HH:MM
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: { editTransaction?: Transaction };
  TransactionHistory: undefined;
  Settings: undefined;
  Categories: undefined;
};