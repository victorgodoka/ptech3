import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ProtectedRoute from './components/ProtectedRoute';
import { useTransactions } from './contexts/TransactionContext';

interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  receiptUrl?: string;
}

const TransactionDetailsContent = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, deleteTransaction } = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const foundTransaction = transactions.find(t => t.id === id);
    if (foundTransaction) {
      setTransaction(foundTransaction);
    }
  }, [id, transactions]);

  const formatCurrency = (amountInCents: number) => {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };


  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDelete = () => {
    if (!transaction) return;

    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${transaction.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
              Alert.alert('Sucesso', 'Transação excluída com sucesso!', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a transação');
            }
          }
        }
      ]
    );
  };

  const handleViewReceipt = async () => {
    if (!transaction?.receiptUrl) return;

    try {
      const supported = await Linking.canOpenURL(transaction.receiptUrl);
      
      if (supported) {
        await Linking.openURL(transaction.receiptUrl);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o anexo');
      }
    } catch (error) {
      console.error('Erro ao abrir anexo:', error);
      Alert.alert('Erro', 'Não foi possível abrir o anexo');
    }
  };


  if (!transaction) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Transação</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b4d8" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Transação</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transaction Type Badge */}
        <View style={styles.typeBadgeContainer}>
          <View style={[
            styles.typeBadge,
            transaction.type === 'income' ? styles.incomeBadge : styles.expenseBadge
          ]}>
            <Ionicons
              name={transaction.type === 'income' ? 'arrow-down-outline' : 'arrow-up-outline'}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.typeBadgeText}>
              {transaction.type === 'income' ? 'Receita' : 'Despesa'}
            </Text>
          </View>
        </View>

        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Text style={[
            styles.amountValue,
            transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
          ]}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* Title */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Título</Text>
            <Text style={styles.fieldValue}>{transaction.title}</Text>
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Categoria</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{transaction.category}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Descrição</Text>
            <Text style={styles.fieldValue}>
              {transaction.description || 'Sem descrição'}
            </Text>
          </View>

          {/* Date */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Data</Text>
            <Text style={styles.fieldValue}>{formatDate(transaction.date)}</Text>
          </View>

          {/* Receipt */}
          {transaction.receiptUrl && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Anexo</Text>
              <TouchableOpacity 
                style={styles.receiptButton}
                onPress={handleViewReceipt}
              >
                <Ionicons name="document-attach" size={20} color="#00b4d8" />
                <Text style={styles.receiptButtonText}>Ver Anexo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => router.push(`/add-transaction?id=${transaction.id}` as any)}
          >
            <Ionicons name="create-outline" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
  },
  typeBadgeContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  incomeBadge: {
    backgroundColor: '#10b981',
  },
  expenseBadge: {
    backgroundColor: '#ef4444',
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#10b981',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  detailsSection: {
    gap: 24,
    marginBottom: 32,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#00b4d8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  receiptButtonText: {
    color: '#00b4d8',
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#00b4d8',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function TransactionDetails() {
  return (
    <ProtectedRoute>
      <TransactionDetailsContent />
    </ProtectedRoute>
  );
}
