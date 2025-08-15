import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export class DatabaseService {
  // Transactions CRUD
  async getTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      return data?.map(this.mapSupabaseToTransaction) || [];
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction | null> {
    try {
      const supabaseTransaction = this.mapTransactionToSupabase(transaction);
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(supabaseTransaction)
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        return null;
      }

      return this.mapSupabaseToTransaction(data);
    } catch (error) {
      console.error('Error in createTransaction:', error);
      return null;
    }
  }

  async updateTransaction(transaction: Transaction): Promise<Transaction | null> {
    try {
      const supabaseTransaction = this.mapTransactionToSupabase(transaction);
      
      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...supabaseTransaction,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        return null;
      }

      return this.mapSupabaseToTransaction(data);
    } catch (error) {
      console.error('Error in updateTransaction:', error);
      return null;
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTransaction:', error);
      return false;
    }
  }

  // Helper methods for data mapping
  private mapTransactionToSupabase(transaction: Partial<Transaction>) {
    return {
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      due_date: transaction.dueDate instanceof Date 
        ? transaction.dueDate.toISOString() 
        : transaction.dueDate,
      is_recurring: transaction.isRecurring,
      status: transaction.status,
      created_at: transaction.createdAt instanceof Date 
        ? transaction.createdAt.toISOString() 
        : transaction.createdAt,
      updated_at: transaction.updatedAt instanceof Date 
        ? transaction.updatedAt.toISOString() 
        : transaction.updatedAt,
    };
  }

  private mapSupabaseToTransaction(data: any): Transaction {
    return {
      id: data.id,
      amount: data.amount,
      description: data.description,
      category: data.category,
      type: data.type,
      dueDate: new Date(data.due_date),
      isRecurring: data.is_recurring,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const databaseService = new DatabaseService();