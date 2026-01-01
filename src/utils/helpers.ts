/**
 * Funções auxiliares gerais
 */

import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import bcrypt from 'bcryptjs';

/**
 * Gera hash de senha usando bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compara senha com hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Calcula a próxima data de recorrência
 */
export const getNextRecurrenceDate = (
  currentDate: Date,
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
): Date => {
  switch (frequency) {
    case 'DAILY':
      return addDays(currentDate, 1);
    case 'WEEKLY':
      return addWeeks(currentDate, 1);
    case 'MONTHLY':
      return addMonths(currentDate, 1);
    case 'YEARLY':
      return addYears(currentDate, 1);
    default:
      return currentDate;
  }
};

/**
 * Calcula porcentagem
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Calcula progresso de meta (0-100%)
 */
export const calculateGoalProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(progress, 100); // Limita a 100%
};

/**
 * Gera número aleatório de N dígitos
 */
export const generateRandomNumber = (digits: number): string => {
  return Math.floor(Math.random() * Math.pow(10, digits))
    .toString()
    .padStart(digits, '0');
};

/**
 * Verifica se uma data já passou
 */
export const isPastDate = (date: Date): boolean => {
  return date < new Date();
};

/**
 * Calcula dias restantes até uma data
 */
export const daysUntil = (date: Date): number => {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
