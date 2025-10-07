import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Transaction, TransactionInput, TransactionFilter, TransactionSummary, CategorySummary } from '../types/transaction';

export class TransactionService {
  private collectionName = 'transactions';

  // Criar nova transação
  async createTransaction(userId: string, transactionData: TransactionInput): Promise<string> {
    try {
      console.log('🔥 TransactionService: Iniciando createTransaction para userId:', userId);
      console.log('🔥 TransactionService: Dados da transação:', transactionData);
      
      let receiptUrl = '';
      let receiptName = '';

      // Upload do recibo se fornecido
      if (transactionData.receiptFile) {
        console.log('📎 TransactionService: Fazendo upload do recibo...');
        const uploadResult = await this.uploadReceipt(userId, transactionData.receiptFile);
        receiptUrl = uploadResult.url;
        receiptName = uploadResult.name;
      }

      const transaction: Omit<Transaction, 'id'> = {
        userId,
        title: transactionData.title,
        description: transactionData.description,
        amount: transactionData.amount,
        type: transactionData.type,
        category: transactionData.category,
        date: transactionData.date,
        receiptUrl,
        receiptName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('🔥 TransactionService: Preparando documento para salvar...');
      const docData = {
        ...transaction,
        date: Timestamp.fromDate(transaction.date),
        createdAt: Timestamp.fromDate(transaction.createdAt),
        updatedAt: Timestamp.fromDate(transaction.updatedAt)
      };
      
      console.log('🔥 TransactionService: Documento preparado:', docData);
      console.log('🔥 TransactionService: Tentando salvar no Firestore...');
      
      // Implementar retry logic
      let attempts = 0;
      const maxAttempts = 3;
      let docRef;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`🔥 TransactionService: Tentativa ${attempts}/${maxAttempts}`);
          
          docRef = await addDoc(collection(db, this.collectionName), docData);
          break; // Sucesso, sair do loop
        } catch (retryError: any) {
          console.warn(`⚠️ TransactionService: Tentativa ${attempts} falhou:`, retryError.message);
          
          if (attempts === maxAttempts) {
            throw retryError; // Última tentativa, propagar erro
          }
          
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        }
      }
      
      if (!docRef) {
        throw new Error('Falha ao criar documento após todas as tentativas');
      }
      
      console.log('✅ TransactionService: Documento salvo com ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('❌ TransactionService: Erro ao criar transação:', error);
      console.error('❌ TransactionService: Detalhes do erro:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
      throw new Error(`Falha ao criar transação: ${error?.message || 'Erro desconhecido'}`);
    }
  }

  // Buscar transações do usuário
  async getUserTransactions(
    userId: string, 
    filter?: TransactionFilter,
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot
  ): Promise<{ transactions: Transaction[], lastDoc?: QueryDocumentSnapshot }> {
    try {
      let q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      // Aplicar filtros
      if (filter?.startDate) {
        q = query(q, where('date', '>=', Timestamp.fromDate(filter.startDate)));
      }
      if (filter?.endDate) {
        q = query(q, where('date', '<=', Timestamp.fromDate(filter.endDate)));
      }
      if (filter?.category) {
        q = query(q, where('category', '==', filter.category));
      }
      if (filter?.type && filter.type !== 'all') {
        q = query(q, where('type', '==', filter.type));
      }

      // Paginação
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(pageSize));

      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];
      let newLastDoc: QueryDocumentSnapshot | undefined;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Transaction);
        newLastDoc = doc;
      });

      // Filtro por termo de busca (feito no cliente)
      let filteredTransactions = transactions;
      if (filter?.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        filteredTransactions = transactions.filter(t => 
          t.title.toLowerCase().includes(searchTerm) ||
          t.description?.toLowerCase().includes(searchTerm) ||
          t.category.toLowerCase().includes(searchTerm)
        );
      }

      return { 
        transactions: filteredTransactions, 
        lastDoc: newLastDoc 
      };
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw new Error('Falha ao buscar transações');
    }
  }

  // Buscar transação por ID
  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const docRef = doc(db, this.collectionName, transactionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Transaction;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      throw new Error('Falha ao buscar transação');
    }
  }

  // Atualizar transação
  async updateTransaction(transactionId: string, userId: string, updates: Partial<TransactionInput>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, transactionId);
      
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Remover receiptFile do updateData pois não pode ser salvo diretamente
      delete updateData.receiptFile;

      // Se há um novo arquivo de recibo, fazer upload
      if (updates.receiptFile) {
        console.log('📎 TransactionService: Fazendo upload do novo recibo...');
        
        // Buscar transação atual para deletar recibo antigo se existir
        const currentTransaction = await this.getTransactionById(transactionId);
        if (currentTransaction?.receiptUrl) {
          console.log('🗑️ TransactionService: Deletando recibo antigo...');
          await this.deleteReceipt(currentTransaction.receiptUrl);
        }
        
        // Upload do novo recibo
        const uploadResult = await this.uploadReceipt(userId, updates.receiptFile);
        updateData.receiptUrl = uploadResult.url;
        updateData.receiptName = uploadResult.name;
      }

      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      await updateDoc(docRef, updateData);
      console.log('✅ TransactionService: Transação atualizada com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar transação:', error);
      throw new Error(`Falha ao atualizar transação: ${error?.message || 'Erro desconhecido'}`);
    }
  }

  // Deletar transação
  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      // Buscar a transação para obter URL do recibo
      const transaction = await this.getTransactionById(transactionId);
      
      // Deletar recibo se existir
      if (transaction?.receiptUrl) {
        await this.deleteReceipt(transaction.receiptUrl);
      }

      // Deletar documento
      await deleteDoc(doc(db, this.collectionName, transactionId));
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw new Error('Falha ao deletar transação');
    }
  }

  // Upload de recibo
  private async uploadReceipt(userId: string, file: File): Promise<{ url: string, name: string }> {
    try {
      const timestamp = Date.now();
      const fileName = `${userId}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `receipts/${userId}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      return { url, name: fileName };
    } catch (error) {
      console.error('Erro ao fazer upload do recibo:', error);
      throw new Error('Falha no upload do recibo');
    }
  }

  // Deletar recibo
  private async deleteReceipt(receiptUrl: string): Promise<void> {
    try {
      const storageRef = ref(storage, receiptUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Erro ao deletar recibo:', error);
      // Não propagar erro pois a transação pode ser deletada mesmo se o recibo falhar
    }
  }

  // Obter resumo financeiro
  async getTransactionSummary(userId: string, filter?: TransactionFilter): Promise<TransactionSummary> {
    try {
      const { transactions } = await this.getUserTransactions(userId, filter, 1000);
      
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount: transactions.length
      };
    } catch (error) {
      console.error('Erro ao obter resumo:', error);
      throw new Error('Falha ao obter resumo financeiro');
    }
  }

  // Obter resumo por categoria
  async getCategorySummary(userId: string, type: 'income' | 'expense', filter?: TransactionFilter): Promise<CategorySummary[]> {
    try {
      const { transactions } = await this.getUserTransactions(userId, { ...filter, type }, 1000);
      
      const categoryTotals = transactions.reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = { amount: 0, count: 0 };
        }
        acc[transaction.category].amount += transaction.amount;
        acc[transaction.category].count += 1;
        return acc;
      }, {} as Record<string, { amount: number, count: number }>);

      const total = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0);

      return Object.entries(categoryTotals).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: total > 0 ? (data.amount / total) * 100 : 0
      })).sort((a, b) => b.amount - a.amount);
    } catch (error) {
      console.error('Erro ao obter resumo por categoria:', error);
      throw new Error('Falha ao obter resumo por categoria');
    }
  }
}

export const transactionService = new TransactionService();
