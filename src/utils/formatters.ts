/**
 * Formatadores para dados brasileiros
 */

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata valor para formato brasileiro (R$ 1.234,56)
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};

/**
 * Formata data para formato brasileiro (dd/MM/yyyy)
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

/**
 * Formata data e hora para formato brasileiro (dd/MM/yyyy HH:mm)
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

/**
 * Formata mês e ano (Janeiro de 2024)
 */
export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month - 1);
  return format(date, 'MMMM yyyy', { locale: ptBR });
};

/**
 * Formata porcentagem (75.5% → 75,50%)
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2).replace('.', ',')}%`;
};

/**
 * Remove formatação de valor monetário (R$ 1.234,56 → 1234.56)
 */
export const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleanValue);
};
