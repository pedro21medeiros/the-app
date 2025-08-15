import { format, parseISO, addDays, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM', { locale: ptBR });
}

export function formatDateLong(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
}

export function getDaysUntilDue(dueDate: Date | string): number {
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const today = new Date();
  const diffTime = dateObj.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: Date | string): boolean {
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isBefore(dateObj, new Date()) && !isToday(dateObj);
}

export function isDueToday(dueDate: Date | string): boolean {
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isToday(dateObj);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}