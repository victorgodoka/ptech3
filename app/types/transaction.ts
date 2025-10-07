export interface Transaction {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  receiptUrl?: string;
  receiptName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionInput {
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  receiptFile?: File;
}

export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: 'income' | 'expense' | 'all';
  searchTerm?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export const CATEGORIES = {
  INCOME: [
    'Salário',
    'Freelance',
    'Investimentos',
    'Vendas',
    'Outros'
  ],
  EXPENSE: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Entretenimento',
    'Compras',
    'Contas',
    'Outros'
  ]
} as const;
