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

export function formatDaysUntilDue(dueDate: Date | string): string {
  const days = getDaysUntilDue(dueDate);
  return `${days} ${days === 1 ? 'dia' : 'dias'}`;
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
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function isSameMonth(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

export function getCurrentMonth(): Date {
  return new Date();
}

export function getNextMonth(date: Date = new Date()): Date {
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth;
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: ptBR });
}