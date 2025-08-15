import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Transaction, NotificationSettings } from '../types';
import { generateId } from '../utils/formatters';
import { databaseService } from '../services/database';

interface AppState {
  transactions: Transaction[];
  loading: boolean;
  notificationSettings: NotificationSettings;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_NOTIFICATION_SETTINGS'; payload: NotificationSettings }
  | { type: 'CLEAR_ALL_DATA' };

const initialState: AppState = {
  transactions: [],
  loading: false,
  notificationSettings: {
    enabled: true,
    daysBefore: 1,
    time: '09:00',
  },
};

interface AppContextType {
  transactions: Transaction[];
  loading: boolean;
  notificationSettings: NotificationSettings;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    case 'SET_NOTIFICATION_SETTINGS':
      return { ...state, notificationSettings: action.payload };
    case 'CLEAR_ALL_DATA':
      return { ...initialState };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load transactions from Supabase on app start
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const transactions = await databaseService.getTransactions();
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const scheduleNotification = async (transaction: Transaction) => {
    if (!state.notificationSettings.enabled) return;

    try {
      const dueDate = new Date(transaction.dueDate);
      const notificationDate = new Date(dueDate);
      notificationDate.setDate(dueDate.getDate() - state.notificationSettings.daysBefore);
      
      const [hours, minutes] = state.notificationSettings.time.split(':');
      notificationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (notificationDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Lembrete de Vencimento',
            body: `${transaction.description} vence em ${state.notificationSettings.daysBefore} dia(s)`,
            data: { transactionId: transaction.id },
          },
          trigger: notificationDate as any,
          identifier: `transaction_${transaction.id}`,
        });
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const cancelNotification = async (transactionId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(`transaction_${transactionId}`);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const transaction = await databaseService.createTransaction(transactionData);
      if (transaction) {
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
        
        if (transaction.status === 'pending') {
          await scheduleNotification(transaction);
        }
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      const updatedTransaction = await databaseService.updateTransaction(transaction);
      if (updatedTransaction) {
        dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
        
        await cancelNotification(transaction.id);
        if (updatedTransaction.status === 'pending') {
          await scheduleNotification(updatedTransaction);
        }
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const success = await databaseService.deleteTransaction(id);
      if (success) {
        await cancelNotification(id);
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      const transaction = state.transactions.find(t => t.id === id);
      if (transaction) {
        const updatedTransaction = {
          ...transaction,
          status: 'paid' as const,
        };
        
        const result = await databaseService.updateTransaction(updatedTransaction);
        if (result) {
          await cancelNotification(id);
          dispatch({ type: 'UPDATE_TRANSACTION', payload: result });
        }
      }
    } catch (error) {
      console.error('Error marking transaction as paid:', error);
      throw error;
    }
  };

  const updateNotificationSettings = async (settings: NotificationSettings) => {
    dispatch({ type: 'SET_NOTIFICATION_SETTINGS', payload: settings });
    
    // Reschedule all pending notifications
    const pendingTransactions = state.transactions.filter(t => t.status === 'pending');
    
    for (const transaction of pendingTransactions) {
      await cancelNotification(transaction.id);
      if (settings.enabled) {
        await scheduleNotification(transaction);
      }
    }
  };

  const clearAllData = async () => {
    try {
      // Cancel all notifications
      for (const transaction of state.transactions) {
        await cancelNotification(transaction.id);
        await databaseService.deleteTransaction(transaction.id);
      }
      
      dispatch({ type: 'CLEAR_ALL_DATA' });
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  };

  const contextValue: AppContextType = {
    transactions: state.transactions,
    loading: state.loading,
    notificationSettings: state.notificationSettings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
    updateNotificationSettings,
    clearAllData,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export { AppContext };

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}