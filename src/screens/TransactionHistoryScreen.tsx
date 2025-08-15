import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../contexts/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate, isSameMonth, getCurrentMonth, getNextMonth, formatMonthYear } from '../utils/formatters';
import { Transaction } from '../types';

type FilterType = 'all' | 'pending' | 'paid' | 'expense' | 'income';

export default function TransactionHistoryScreen() {
  const { transactions, deleteTransaction, markAsPaid, loading } = useAppContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const navigation = useNavigation();

  if (loading) {
    return <LoadingSpinner message="Carregando histórico..." />;
  }

  const filteredTransactions = useMemo(() => {
    // Primeiro, filtrar por mês
    let filtered = transactions.filter(t => isSameMonth(t.dueDate, currentMonth));

    // Depois, aplicar filtros de tipo/status
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(t => t.status === 'pending');
        break;
      case 'paid':
        filtered = filtered.filter(t => t.status === 'paid');
        break;
      case 'expense':
        filtered = filtered.filter(t => t.type === 'expense');
        break;
      case 'income':
        filtered = filtered.filter(t => t.type === 'income');
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => 
      new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  }, [transactions, filter, currentMonth]);

  const stats = useMemo(() => {
    const currentMonthTransactions = transactions.filter(t => 
      isSameMonth(t.dueDate, currentMonth)
    );
    
    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingExpense = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      pendingExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions, currentMonth]);

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Excluir Transação',
      `Tem certeza que deseja excluir "${transaction.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteTransaction(transaction.id)
        },
      ]
    );
  };

  const handleMarkAsPaid = (transaction: Transaction) => {
    const actionText = transaction.type === 'income' ? 'recebimento' : 'pagamento';
    const titleText = transaction.type === 'income' ? 'Marcar como Recebido' : 'Marcar como Pago';
    
    Alert.alert(
      titleText,
      `Confirma o ${actionText} de ${formatCurrency(transaction.amount)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => markAsPaid(transaction.id)
        },
      ]
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDate}>
            Vencimento: {formatDate(item.dueDate)}
          </Text>
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: item.type === 'income' ? '#34C759' : '#FF3B30' }
          ]}>
            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
          
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'paid' ? '#34C759' : '#FF9500' }
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'paid' ? 'Pago' : 'Pendente'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.transactionActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => handleMarkAsPaid(item)}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.payButtonText}>
              {item.type === 'income' ? 'Receber' : 'Pagar'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTransaction(item)}
        >
          <Ionicons name="trash" size={16} color="white" />
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filterButtons = [
    { key: 'all', label: 'Todas', icon: 'list' },
    { key: 'pending', label: 'Pendentes', icon: 'time' },
    { key: 'paid', label: 'Pagas', icon: 'checkmark-circle' },
    { key: 'expense', label: 'Gastos', icon: 'arrow-down' },
    { key: 'income', label: 'Receitas', icon: 'arrow-up' },
  ] as const;

  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const goToNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(getCurrentMonth());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Histórico</Text>
            <Text style={styles.subtitle}>Gerencie suas transações</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.recurringButton}
            onPress={() => navigation.navigate('RecurringTransactions' as never)}
          >
            <Ionicons name="repeat" size={20} color="white" />
            <Text style={styles.recurringButtonText}>Recorrentes</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
            <Ionicons name="chevron-back" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToCurrentMonth} style={styles.monthSelector}>
            <Text style={styles.monthText}>{formatMonthYear(currentMonth)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Receitas</Text>
          <Text style={[styles.statValue, { color: '#34C759' }]}>
            {formatCurrency(stats.totalIncome)}
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Gastos</Text>
          <Text style={[styles.statValue, { color: '#FF3B30' }]}>
            {formatCurrency(stats.totalExpense)}
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Saldo</Text>
          <Text style={[
            styles.statValue,
            { color: stats.balance >= 0 ? '#34C759' : '#FF3B30' }
          ]}>
            {formatCurrency(stats.balance)}
          </Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          style={styles.filterScrollView}
        >
          {filterButtons.map((button) => (
            <TouchableOpacity
              key={button.key}
              style={[
                styles.filterButton,
                filter === button.key && styles.filterButtonActive
              ]}
              onPress={() => setFilter(button.key)}
            >
              <Ionicons 
                name={button.icon as any} 
                size={16} 
                color={filter === button.key ? 'white' : '#666'} 
              />
              <Text style={[
                styles.filterButtonText,
                { color: filter === button.key ? 'white' : '#666' }
              ]}>
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all' 
              ? 'Adicione sua primeira transação' 
              : 'Tente alterar o filtro selecionado'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recurringButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  recurringButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  monthButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  monthSelector: {
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  monthText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: '#f8f9fa',
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScrollView: {
    paddingHorizontal: 20,
  },
  filterContent: {
    paddingRight: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});