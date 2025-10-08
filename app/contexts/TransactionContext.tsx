import { QueryDocumentSnapshot } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import { mockDataService } from '../services/mockDataService';
import { CategorySummary, Transaction, TransactionFilter, TransactionInput, TransactionSummary } from '../types/transaction';
import { useAuth } from './AuthContext';
import { useLoading } from './LoadingContext';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  summary: TransactionSummary | null;
  categorySummary: CategorySummary[];
  hasMore: boolean;
  error: string | null;
  
  loadTransactions: (filter?: TransactionFilter, refresh?: boolean) => Promise<void>;
  createTransaction: (data: TransactionInput) => Promise<string>;
  updateTransaction: (id: string, data: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  populateWithMockData: () => Promise<void>;
  loadSummary: (filter?: TransactionFilter) => Promise<void>;
  loadCategorySummary: (type: 'income' | 'expense', filter?: TransactionFilter) => Promise<void>;
  clearError: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { setLoading: setGlobalLoading } = useLoading();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>();
  const [currentFilter, setCurrentFilter] = useState<TransactionFilter | undefined>();

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setSummary(null);
      setCategorySummary([]);
      setLastDoc(undefined);
      setHasMore(true);
      setError(null);
    }
  }, [user]);

  const clearError = () => setError(null);

  const loadTransactions = async (filter?: TransactionFilter, refresh = false) => {
    if (!user) return;

    try {
      setLoading(true);
      setGlobalLoading(true, 'Carregando transações...');
      setError(null);
      
      if (refresh) {
        setTransactions([]);
        setLastDoc(undefined);
        setHasMore(true);
      }

      setCurrentFilter(filter);

      const result = await transactionService.getUserTransactions(
        user.uid, 
        filter, 
        10, // Carregar 10 transações por vez
        refresh ? undefined : lastDoc
      );

      if (refresh) {
        setTransactions(result.transactions);
      } else {
        setTransactions(prev => [...prev, ...result.transactions]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.transactions.length === 10);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar transações');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (!user || !hasMore || loading) return;
    await loadTransactions(currentFilter, false);
  };

  const createTransaction = async (transactionData: TransactionInput) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setLoading(true);
      setGlobalLoading(true, 'Salvando transação...');
      setError(null);

      const transactionId = await transactionService.createTransaction(user.uid, transactionData);
      
      setGlobalLoading(true, 'Atualizando dados...');
      await loadTransactions(currentFilter, true);
      
      await loadSummary(currentFilter);
      
      return transactionId;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar transação');
      throw err;
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<TransactionInput>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setLoading(true);
      setGlobalLoading(true, 'Atualizando transação...');
      setError(null);

      await transactionService.updateTransaction(id, user.uid, updates);
      
      await loadTransactions(currentFilter, true);
      
      await loadSummary(currentFilter);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar transação');
      throw err;
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setLoading(true);
      setError(null);

      await transactionService.deleteTransaction(id);
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      await loadSummary(currentFilter);
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar transação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTransactionById = async (id: string): Promise<Transaction | null> => {
    try {
      return await transactionService.getTransactionById(id);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar transação');
      return null;
    }
  };

  const loadSummary = async (filter?: TransactionFilter) => {
    if (!user) return;

    try {
      setGlobalLoading(true, 'Carregando resumo...');
      const summaryData = await transactionService.getTransactionSummary(user.uid, filter);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar resumo');
    } finally {
      setGlobalLoading(false);
    }
  };

  const loadCategorySummary = async (type: 'income' | 'expense', filter?: TransactionFilter) => {
    if (!user) return;

    try {
      const categoryData = await transactionService.getCategorySummary(user.uid, type, filter);
      setCategorySummary(categoryData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar resumo por categoria');
    }
  };

  const populateWithMockData = async () => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setLoading(true);
      setGlobalLoading(true, 'Gerando transações de exemplo...');
      setError(null);

      const mockTransactions = mockDataService.generateMockTransactions();
      let processedCount = 0;

      const batchSize = 10;
      for (let i = 0; i < mockTransactions.length; i += batchSize) {
        const batch = mockTransactions.slice(i, i + batchSize);
        
        const promises = batch.map(async (mockTransaction) => {
          return transactionService.createTransaction(user.uid, mockTransaction);
        });

        await Promise.all(promises);
        processedCount += batch.length;
        
        setGlobalLoading(true, `Criando transações... ${processedCount}/${mockTransactions.length}`);
      }

      setGlobalLoading(true, 'Atualizando dados...');
      await loadTransactions(currentFilter, true);
      await loadSummary(currentFilter);

      console.log(`✅ ${mockTransactions.length} transações de exemplo criadas com sucesso!`);
    } catch (err: any) {
      setError(err.message || 'Erro ao popular dados de exemplo');
      throw err;
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const refreshTransactions = async () => {
    await loadTransactions(currentFilter, true);
  };

  const value: TransactionContextType = {
    transactions,
    loading,
    error,
    summary,
    categorySummary,
    hasMore,
    loadTransactions,
    loadMoreTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions,
    loadSummary,
    loadCategorySummary,
    populateWithMockData,
    clearError
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionProvider;
