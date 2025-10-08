import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { useTransactions } from './contexts/TransactionContext';
import { signOutUser } from './firebase/auth';

const DashboardContent = () => {
  const { user } = useAuth();
  const { summary, transactions, loadTransactions, loadSummary, populateWithMockData } = useTransactions();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'charts'>('transactions');

  useEffect(() => {
    if (user) {
      console.log('🏠 Dashboard: Loading transactions for user:', user.email);
      loadTransactions({}, true);
      loadSummary();
    }
  }, [user]);


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
      year: 'numeric'
    }).format(date);
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#f97316', // orange
      '#84cc16', // lime
      '#6366f1', // indigo
    ];
    return colors[index % colors.length];
  };

  const getCategoryData = (type: 'expense' | 'income') => {
    const filtered = transactions.filter(t => t.type === type);
    const categoryTotals: Record<string, number> = {};
    
    filtered.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getLast7DaysData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= date && tDate < nextDate;
      });
      
      const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      days.push({
        date,
        label: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        income,
        expense,
        balance: income - expense
      });
    }
    
    return days;
  };

  const getTransactionIcon = (category: string, type: 'income' | 'expense') => {
    const iconProps = { size: 18, color: '#ffffff' };
    
    const icons: Record<string, React.ReactElement> = {
      'Salário': <FontAwesome5 name="briefcase" {...iconProps} />,
      'Freelance': <FontAwesome5 name="laptop" {...iconProps} />,
      'Investimentos': <FontAwesome5 name="chart-line" {...iconProps} />,
      'Vendas': <FontAwesome5 name="money-bill-wave" {...iconProps} />,
      'Prêmios': <FontAwesome5 name="trophy" {...iconProps} />,
      'Alimentação': <Ionicons name="restaurant" {...iconProps} />,
      'Transporte': <FontAwesome5 name="car" {...iconProps} />,
      'Saúde': <FontAwesome5 name="hospital" {...iconProps} />,
      'Educação': <FontAwesome5 name="book" {...iconProps} />,
      'Entretenimento': <Ionicons name="film" {...iconProps} />,
      'Compras': <FontAwesome5 name="shopping-bag" {...iconProps} />,
      'Contas': <FontAwesome5 name="file-invoice" {...iconProps} />,
      'Outros': type === 'income' 
        ? <FontAwesome5 name="coins" {...iconProps} />
        : <FontAwesome5 name="credit-card" {...iconProps} />
    };
    
    return icons[category] || (type === 'income' 
      ? <FontAwesome5 name="coins" {...iconProps} />
      : <FontAwesome5 name="credit-card" {...iconProps} />
    );
  };

  const recentTransactions = transactions.slice(0, 4);
  
  console.log('🏠 Dashboard render - Transactions count:', transactions.length);
  console.log('🏠 Dashboard render - Recent transactions:', recentTransactions.length);

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Falha ao fazer logout');
    }
  };

  const handlePopulateData = async () => {
    setMenuVisible(false);
    Alert.alert(
      'Popular com Dados de Exemplo',
      'Isso irá criar 200 transações de exemplo em sua conta. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            try {
              await populateWithMockData();
              Alert.alert('Sucesso', '200 transações de exemplo foram criadas!');
            } catch (error: any) {
              Alert.alert('Erro', `Falha ao criar dados de exemplo: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleOptions = () => {
    setMenuVisible(false);
    Alert.alert('Opções', 'Funcionalidade em desenvolvimento');
  };

  return (
    <View style={styles.container}>
      {menuVisible && (
        <TouchableOpacity 
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
          activeOpacity={1}
        />
      )}
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
                
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <Ionicons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        {menuVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handlePopulateData}
            >
              <Ionicons name="add-circle-outline" size={20} color="#ffffff" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Dados de Exemplo</Text>
            </TouchableOpacity>
            
            <View style={styles.menuSeparator} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleOptions}
            >
              <Ionicons name="settings-outline" size={20} color="#ffffff" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Opções</Text>
            </TouchableOpacity>
            
            <View style={styles.menuSeparator} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#ffffff" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardGradient}>
            <View style={styles.balanceCardBlur}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Saldo total</Text>
                <TouchableOpacity 
                  onPress={() => setBalanceVisible(!balanceVisible)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={balanceVisible ? 'eye-outline' : 'eye-off-outline'} 
                    size={20} 
                    color="#93c5fd" 
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.balanceAmount}>
                {balanceVisible ? formatCurrency(summary?.balance || 0) : '••••••'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsSection}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
              onPress={() => setActiveTab('transactions')}
            >
              <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
                Transações
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'charts' && styles.activeTab]}
              onPress={() => setActiveTab('charts')}
            >
              <Text style={[styles.tabText, activeTab === 'charts' && styles.activeTabText]}>
                Gráficos
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'transactions' ? (
              <View style={styles.transactionsContent}>
                <View style={styles.transactionsHeader}>
                  <TouchableOpacity onPress={() => router.push('/transactions' as any)}>
                    <Text style={styles.seeAllText}>Ver todas</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.transactionsList}>
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => (
                      <TouchableOpacity 
                        key={transaction.id}
                        style={styles.transactionItem}
                        onPress={() => router.push(`/transaction-details?id=${transaction.id}` as any)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.transactionLeft}>
                          <View style={styles.transactionLogo}>
                            {getTransactionIcon(transaction.category, transaction.type)}
                          </View>
                          <View style={styles.transactionInfo}>
                            <Text style={styles.transactionTitle}>{transaction.title}</Text>
                            <Text style={styles.transactionDate}>
                              {formatDate(transaction.date)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.transactionRight}>
                          <Text style={[
                            styles.transactionAmount,
                            transaction.type === 'income' ? styles.positiveAmount : styles.negativeAmount
                          ]}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </Text>
                          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyTransactions}>
                      <Ionicons name="receipt-outline" size={48} color="#6b7280" style={styles.emptyIcon} />
                      <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
                      <Text style={styles.emptySubtext}>Comece adicionando sua primeira transação</Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.chartsContent}>
                {transactions.length > 0 ? (
                  <>
                    <View style={[styles.summaryCard, styles.incomeCard]}>
                      <Ionicons name="arrow-down" size={24} color="#10b981" />
                      <Text style={styles.summaryCardLabel}>Receitas</Text>
                      <Text style={styles.summaryCardValue}>{formatCurrency(summary?.totalIncome || 0)}</Text>
                    </View>
                    <View style={[styles.summaryCard, styles.expenseCard]}>
                      <Ionicons name="arrow-up" size={24} color="#ef4444" />
                      <Text style={styles.summaryCardLabel}>Despesas</Text>
                      <Text style={styles.summaryCardValue}>{formatCurrency(summary?.totalExpenses || 0)}</Text>
                    </View>

                    <View style={styles.chartSection}>
                      <Text style={styles.chartTitle}>Despesas por Categoria</Text>
                      {getCategoryData('expense').length > 0 ? (
                        <View style={styles.pieChartContainer}>
                          {getCategoryData('expense').slice(0, 5).map((item, index) => (
                            <View key={item.category} style={styles.pieItem}>
                              <View style={styles.pieItemLeft}>
                                <View style={[styles.pieDot, { backgroundColor: getCategoryColor(index) }]} />
                                <Text style={styles.pieCategoryName}>{item.category}</Text>
                              </View>
                              <View style={styles.pieItemRight}>
                                <Text style={styles.piePercentage}>{item.percentage.toFixed(1)}%</Text>
                                <Text style={styles.pieAmount}>{formatCurrency(item.amount)}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.emptyChartText}>Nenhuma despesa registrada</Text>
                      )}
                    </View>

                    <View style={styles.chartSection}>
                      <Text style={styles.chartTitle}>Receitas por Categoria</Text>
                      {getCategoryData('income').length > 0 ? (
                        <View style={styles.barChartContainer}>
                          {getCategoryData('income').slice(0, 5).map((item, index) => {
                            const maxAmount = Math.max(...getCategoryData('income').map(i => i.amount));
                            const barWidth = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                            
                            return (
                              <View key={item.category} style={styles.barItem}>
                                <Text style={styles.barLabel}>{item.category}</Text>
                                <View style={styles.barContainer}>
                                  <View 
                                    style={[
                                      styles.bar, 
                                      { 
                                        width: `${barWidth}%`,
                                        backgroundColor: getCategoryColor(index)
                                      }
                                    ]}
                                  />
                                </View>
                                <Text style={styles.barValue}>{formatCurrency(item.amount)}</Text>
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        <Text style={styles.emptyChartText}>Nenhuma receita registrada</Text>
                      )}
                    </View>

                    <View style={styles.chartSection}>
                      <Text style={styles.chartTitle}>Últimos 7 Dias</Text>
                      {getLast7DaysData().some(d => d.income > 0 || d.expense > 0) ? (
                        <View style={styles.lineChartContainer}>
                          {getLast7DaysData().map((day, index) => {
                            const maxValue = Math.max(
                              ...getLast7DaysData().map(d => Math.max(d.income, d.expense))
                            );
                            const incomeHeight = maxValue > 0 ? (day.income / maxValue) * 100 : 0;
                            const expenseHeight = maxValue > 0 ? (day.expense / maxValue) * 100 : 0;
                            
                            return (
                              <View key={index} style={styles.lineChartDay}>
                                <View style={styles.lineChartBars}>
                                  <View style={styles.lineChartBarContainer}>
                                    <View 
                                      style={[
                                        styles.lineChartBar,
                                        styles.incomeBar,
                                        { height: `${incomeHeight}%` }
                                      ]}
                                    />
                                  </View>
                                  <View style={styles.lineChartBarContainer}>
                                    <View 
                                      style={[
                                        styles.lineChartBar,
                                        styles.expenseBar,
                                        { height: `${expenseHeight}%` }
                                      ]}
                                    />
                                  </View>
                                </View>
                                <Text style={styles.lineChartLabel}>{day.label}</Text>
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        <Text style={styles.emptyChartText}>Nenhuma transação nos últimos 7 dias</Text>
                      )}
                      <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                          <Text style={styles.legendText}>Receitas</Text>
                        </View>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                          <Text style={styles.legendText}>Despesas</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.chartSection}>
                      <Text style={styles.chartTitle}>Resumo Geral</Text>
                      <View style={styles.monthlyTrend}>
                        <View style={styles.trendItem}>
                          <Text style={styles.trendLabel}>Total de Transações</Text>
                          <Text style={styles.trendValue}>{summary?.transactionCount || 0}</Text>
                        </View>
                        <View style={styles.trendItem}>
                          <Text style={styles.trendLabel}>Total de Receitas</Text>
                          <Text style={[styles.trendValue, { color: '#10b981' }]}>
                            {formatCurrency(summary?.totalIncome || 0)}
                          </Text>
                        </View>
                        <View style={styles.trendItem}>
                          <Text style={styles.trendLabel}>Total de Despesas</Text>
                          <Text style={[styles.trendValue, { color: '#ef4444' }]}>
                            {formatCurrency(summary?.totalExpenses || 0)}
                          </Text>
                        </View>
                        <View style={styles.trendItem}>
                          <Text style={styles.trendLabel}>Saldo Atual</Text>
                          <Text style={[
                            styles.trendValue,
                            { color: (summary?.balance || 0) >= 0 ? '#10b981' : '#ef4444' }
                          ]}>
                            {formatCurrency(summary?.balance || 0)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyCharts}>
                    <Ionicons name="bar-chart-outline" size={48} color="#6b7280" />
                    <Text style={styles.emptyText}>Nenhum dado para exibir</Text>
                    <Text style={styles.emptySubtext}>Adicione transações para ver os gráficos</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {activeTab === 'transactions' && (
        <View style={styles.bottomNav}>
        <View style={styles.bottomNavGradient}>
          <View style={styles.bottomNavBlur}>
            <TouchableOpacity 
              style={[styles.navItem, styles.navItemActive]}
              onPress={() => router.push('/dashboard' as any)}
            >
              <Ionicons name="home" size={20} color="#ffffff" />
              <Text style={styles.navLabel}>Início</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#0a0e27',
  },
  headerLeft: {
    width: 40,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  coinText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  menuButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  menuIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  balanceCard: {
    borderRadius: 24,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  balanceCardGradient: {
    backgroundColor: 'rgba(30, 64, 175, 0.85)',
    borderRadius: 24,
    position: 'relative',
  },
  balanceCardBlur: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    padding: 24,
    borderRadius: 24,
    backdropFilter: 'blur(10px)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#93c5fd',
  },
  eyeButton: {
    padding: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 16,
    color: '#93c5fd',
    marginBottom: 4,
  },
  balanceChange: {
    fontSize: 16,
    color: '#10b981',
    marginBottom: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  earnBanner: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  earnIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  earnText: {
    flex: 1,
  },
  earnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  earnSubtitle: {
    fontSize: 12,
    color: '#93c5fd',
  },
  earnClose: {
    padding: 4,
  },
  earnCloseText: {
    fontSize: 16,
    color: '#93c5fd',
  },
  tabsSection: {
    marginBottom: 100,
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#00b4d8',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabContent: {
    flex: 1,
  },
  transactionsContent: {
    flex: 1,
  },
  chartsContent: {
    flex: 1,
  },
  emptyCharts: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  transactionsSection: {
    marginBottom: 100,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  transactionsList: {
    gap: 0,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionLogoText: {
    fontSize: 18,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 12,
    color: '#6b7280',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  bottomNavGradient: {
    backgroundColor: 'rgba(30, 64, 175, 0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'relative',
  },
  bottomNavBlur: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backdropFilter: 'blur(10px)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  navLabel: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },
  positiveAmount: {
    color: '#10b981',
  },
  negativeAmount: {
    color: '#ef4444',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 4,
    marginHorizontal: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 12,
  },
  incomeCard: {
    borderColor: '#10b981',
  },
  expenseCard: {
    borderColor: '#ef4444',
  },
  summaryCardLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chartSection: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  emptyChartText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
  monthlyTrend: {
    gap: 16,
  },
  trendItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
  },
  trendLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  trendValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pieChartContainer: {
    gap: 12,
  },
  pieItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
  },
  pieItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pieDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pieCategoryName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
  },
  pieItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  piePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pieAmount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  barChartContainer: {
    gap: 16,
  },
  barItem: {
    gap: 8,
  },
  barLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  barValue: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  lineChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  lineChartDay: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  lineChartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 120,
  },
  lineChartBarContainer: {
    width: 12,
    height: '100%',
    justifyContent: 'flex-end',
  },
  lineChartBar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  incomeBar: {
    backgroundColor: '#10b981',
  },
  expenseBar: {
    backgroundColor: '#ef4444',
  },
  lineChartLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
});

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
