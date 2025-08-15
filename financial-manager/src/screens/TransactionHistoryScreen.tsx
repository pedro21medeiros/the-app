import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../contexts/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Transaction } from '../types';

type FilterType = 'all' | 'pending' | 'paid' | 'expense' | 'income';

export default function TransactionHistoryScreen() {
  const { transactions, deleteTransaction, markAsPaid, loading } = useAppContext();

  if (loading) {
    return <LoadingSpinner message="Carregando histórico..." />;
  }
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

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
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions, filter]);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      pendingExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions]);

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
    Alert.alert(
      'Marcar como Pago',
      `Confirma o pagamento de ${formatCurrency(transaction.amount)}?`,
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
            <Text style={styles.payButtonText}>Pagar</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Gerencie suas transações</Text>
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
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