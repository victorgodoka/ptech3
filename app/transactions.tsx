import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import { useTransactions } from './contexts/TransactionContext'

const TransactionsContent = () => {
  const { user } = useAuth()
  const {
    transactions,
    loading,
    error,
    hasMore,
    loadTransactions,
    loadMoreTransactions,
    deleteTransaction,
    clearError
  } = useTransactions()
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7days' | '30days' | '90days'>('all')

  const categories = [
    'Todos',
    'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Prêmios',
    'Alimentação', 'Transporte', 'Saúde', 'Educação', 
    'Entretenimento', 'Compras', 'Contas', 'Outros'
  ]

  useEffect(() => {
    if (user) {
      applyFilters()
    }
  }, [user])

  const applyFilters = () => {
    const filter: any = {}
    
    if (filterType !== 'all') {
      filter.type = filterType
    }
    
    if (filterCategory !== 'all') {
      filter.category = filterCategory
    }
    
    if (filterPeriod !== 'all') {
      const now = new Date()
      const days = filterPeriod === '7days' ? 7 : filterPeriod === '30days' ? 30 : 90
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      filter.startDate = startDate
      filter.endDate = now
    }
    
    loadTransactions(filter, true)
  }

  const clearFilters = () => {
    setFilterType('all')
    setFilterCategory('all')
    setFilterPeriod('all')
    loadTransactions({}, true)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadTransactions({}, true)
    } finally {
      setRefreshing(false)
    }
  }

  const handleLoadMore = async () => {
    if (!hasMore || loading || loadingMore) return

    setLoadingMore(true)
    try {
      await loadMoreTransactions()
    } finally {
      setLoadingMore(false)
    }
  }

  const formatCurrency = (amountInCents: number) => {
    const amount = amountInCents / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  const handleDeleteTransaction = async (id: string, title: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id)
              Alert.alert('Sucesso', 'Transação excluída com sucesso!')
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a transação')
            }
          }
        }
      ]
    )
  }

  const getTransactionIcon = (category: string, type: 'income' | 'expense') => {
    const iconProps = {
      size: 18,
      color: type === 'income' ? '#10b981' : '#ef4444'
    }

    const icons: Record<string, React.ReactElement> = {
      Salário: <FontAwesome5 name='briefcase' {...iconProps} />,
      Freelance: <FontAwesome5 name='laptop' {...iconProps} />,
      Investimentos: <FontAwesome5 name='chart-line' {...iconProps} />,
      Vendas: <FontAwesome5 name='money-bill-wave' {...iconProps} />,
      Prêmios: <FontAwesome5 name='trophy' {...iconProps} />,
      Alimentação: <Ionicons name='restaurant' {...iconProps} />,
      Transporte: <FontAwesome5 name='car' {...iconProps} />,
      Saúde: <FontAwesome5 name='hospital' {...iconProps} />,
      Educação: <FontAwesome5 name='graduation-cap' {...iconProps} />,
      Entretenimento: <FontAwesome5 name='gamepad' {...iconProps} />,
      Compras: <FontAwesome5 name='shopping-bag' {...iconProps} />,
      Contas: <FontAwesome5 name='file-invoice-dollar' {...iconProps} />,
      Outros: <FontAwesome5 name='ellipsis-h' {...iconProps} />
    }

    return icons[category] || icons['Outros']
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name='arrow-back' size={24} color='#ffffff' />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Transações ({transactions.length})
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => setShowFilters(!showFilters)} 
          style={styles.filterButton}
        >
          <Ionicons 
            name={showFilters ? 'close' : 'filter'} 
            size={24} 
            color='#ffffff' 
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ScrollView style={styles.filtersPanel} showsVerticalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Tipo</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
                onPress={() => setFilterType('all')}
              >
                <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterType === 'income' && styles.filterChipActive]}
                onPress={() => setFilterType('income')}
              >
                <Text style={[styles.filterChipText, filterType === 'income' && styles.filterChipTextActive]}>
                  Receitas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterType === 'expense' && styles.filterChipActive]}
                onPress={() => setFilterType('expense')}
              >
                <Text style={[styles.filterChipText, filterType === 'expense' && styles.filterChipTextActive]}>
                  Despesas
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Período</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterChip, filterPeriod === 'all' && styles.filterChipActive]}
                onPress={() => setFilterPeriod('all')}
              >
                <Text style={[styles.filterChipText, filterPeriod === 'all' && styles.filterChipTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterPeriod === '7days' && styles.filterChipActive]}
                onPress={() => setFilterPeriod('7days')}
              >
                <Text style={[styles.filterChipText, filterPeriod === '7days' && styles.filterChipTextActive]}>
                  7 dias
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterPeriod === '30days' && styles.filterChipActive]}
                onPress={() => setFilterPeriod('30days')}
              >
                <Text style={[styles.filterChipText, filterPeriod === '30days' && styles.filterChipTextActive]}>
                  30 dias
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterPeriod === '90days' && styles.filterChipActive]}
                onPress={() => setFilterPeriod('90days')}
              >
                <Text style={[styles.filterChipText, filterPeriod === '90days' && styles.filterChipTextActive]}>
                  90 dias
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Categoria</Text>
            <View style={styles.filterButtons}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    (cat === 'Todos' ? filterCategory === 'all' : filterCategory === cat) && styles.filterChipActive
                  ]}
                  onPress={() => setFilterCategory(cat === 'Todos' ? 'all' : cat)}
                >
                  <Text style={[
                    styles.filterChipText,
                    (cat === 'Todos' ? filterCategory === 'all' : filterCategory === cat) && styles.filterChipTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                applyFilters()
                setShowFilters(false)
              }}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <FlatList
        style={styles.content}
        data={transactions}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: transaction }) => (
          <TouchableOpacity
            style={styles.transactionItem}
            onPress={() => router.push(`/transaction-details?id=${transaction.id}` as any)}
            activeOpacity={0.7}
          >
            {getTransactionIcon(transaction.category, transaction.type)}

            <View style={styles.transactionInfo}>
              <View>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionDate}>
                    ({formatDate(transaction.date)})
                  </Text>
                </View>
                {transaction.description && (
                  <Text style={styles.transactionDate}>
                    {transaction.description}
                  </Text>
                )}
              </View>

              <View style={styles.transactionAmount}>
                <Text
                  style={[
                    styles.transactionTitle,
                    transaction.type === 'income'
                      ? { color: '#10b981' }
                      : { color: '#ef4444' }
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </Text>
                <Text style={styles.transactionDate}>
                  {transaction.category}
                </Text>
              </View>
            </View>

            <Ionicons name='chevron-forward' size={20} color='#94a3b8' />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name='receipt-outline'
              size={48}
              color='#6b7280'
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
            <Text style={styles.emptyText}>
              Comece adicionando sua primeira transação
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/add-transaction')}
              style={styles.primaryButton}
            >
              <View style={styles.buttonContent}>
                <Ionicons name='add-circle' size={20} color='#ffffff' />
                <Text style={styles.primaryButtonText}>Nova Transação</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() =>
          loadingMore ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size='small' color='#10b981' />
              <Text style={{ color: '#6b7280', marginTop: 8 }}>
                Carregando mais...
              </Text>
            </View>
          ) : null
        }
      />

      <View style={styles.bottomNav}>
        <View style={styles.bottomNavGradient}>
          <View style={styles.bottomNavBlur}>
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/dashboard' as any)}
            >
              <Ionicons name="home" size={20} color="#ffffff" />
              <Text style={styles.navLabel}>Início</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navItem, styles.navItemActive]}
              onPress={() => router.push('/transactions' as any)}
            >
              <Ionicons name="bar-chart" size={20} color="#ffffff" />
              <Text style={styles.navLabel}>Transações</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/add-transaction' as any)}
            >
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text style={styles.navLabel}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#0a0e27'
  },
  backButton: {
    width: 40
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff'
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  placeholder: {
    width: 40
  },
  refreshButton: {
    width: 40,
    alignItems: 'center'
  },
  refreshIcon: {
    fontSize: 20,
    color: '#ffffff'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  transactionsSection: {
    marginBottom: 100
  },
  transactionsList: {
    gap: 0
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  transactionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  transactionLogoText: {
    fontSize: 18
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionRight: {
    alignItems: 'flex-end'
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  positiveAmount: {
    color: '#10b981'
  },
  negativeAmount: {
    color: '#ef4444'
  },
  transactionStatus: {
    fontSize: 12,
    color: '#6b7280'
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden'
  },
  bottomNavGradient: {
    backgroundColor: 'rgba(30, 64, 175, 0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'relative'
  },
  bottomNavBlur: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backdropFilter: 'blur(10px)'
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12
  },
  navLabel: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24
  },
  primaryButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorContainer: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  errorTitle: {
    color: '#ffffff',
    fontWeight: '500'
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14
  },
  errorButton: {
    padding: 4
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 16
  },
  debugText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8
  },
  filterButton: {
    width: 40,
    alignItems: 'center'
  },
  filtersPanel: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    maxHeight: '60%',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#374151',
  },
  filterChipActive: {
    backgroundColor: '#00b4d8',
    borderColor: '#00b4d8',
  },
  filterChipText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#00b4d8',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default function Transactions() {
  return (
    <ProtectedRoute>
      <TransactionsContent />
    </ProtectedRoute>
  )
}
