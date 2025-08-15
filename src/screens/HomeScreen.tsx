import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../contexts/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate, isOverdue, isDueToday, formatDaysUntilDue, isSameMonth, getCurrentMonth } from '../utils/formatters';
import { Transaction } from '../types';

export default function HomeScreen() {
  const { transactions, markAsPaid, loading } = useAppContext();

  if (loading) {
    return <LoadingSpinner message="Carregando transações..." />;
  }

  const { pendingTransactions, totalBalance, overdueCount, dueTodayCount } = useMemo(() => {
    const currentMonth = getCurrentMonth();
    
    // Filtrar apenas transações do mês atual
    const currentMonthTransactions = transactions.filter(t => 
      isSameMonth(t.dueDate, currentMonth)
    );
    
    const pending = currentMonthTransactions.filter(t => t.status === 'pending');
    const balance = currentMonthTransactions
      .filter(t => t.status === 'paid')
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
    
    const overdue = pending.filter(t => isOverdue(t.dueDate)).length;
    const dueToday = pending.filter(t => isDueToday(t.dueDate)).length;

    return {
      pendingTransactions: pending.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ),
      totalBalance: balance,
      overdueCount: overdue,
      dueTodayCount: dueToday,
    };
  }, [transactions]);

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
          onPress: () => markAsPaid(transaction.id),
          style: 'default' 
        },
      ]
    );
  };

  const getStatusColor = (transaction: Transaction) => {
    if (isOverdue(transaction.dueDate)) return '#FF3B30';
    if (isDueToday(transaction.dueDate)) return '#FF9500';
    return '#007AFF';
  };

  const getStatusIcon = (transaction: Transaction) => {
    if (isOverdue(transaction.dueDate)) return 'alert-circle';
    if (isDueToday(transaction.dueDate)) return 'time';
    return 'calendar';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão Financeira</Text>
        <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Atual</Text>
        <Text style={[
          styles.balanceAmount,
          { color: totalBalance >= 0 ? '#34C759' : '#FF3B30' }
        ]}>
          {formatCurrency(totalBalance)}
        </Text>
      </View>

      <View style={styles.alertsContainer}>
        {overdueCount > 0 && (
          <View style={[styles.alertCard, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="alert-circle" size={24} color="#FF3B30" />
            <Text style={[styles.alertText, { color: '#FF3B30' }]}>
              {overdueCount} conta(s) em atraso
            </Text>
          </View>
        )}
        
        {dueTodayCount > 0 && (
          <View style={[styles.alertCard, { backgroundColor: '#FFF3CD' }]}>
            <Ionicons name="time" size={24} color="#FF9500" />
            <Text style={[styles.alertText, { color: '#FF9500' }]}>
              {dueTodayCount} conta(s) vencem hoje
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximas Contas</Text>
        
        {pendingTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color="#34C759" />
            <Text style={styles.emptyText}>Nenhuma conta pendente!</Text>
            <Text style={styles.emptySubtext}>Todas as suas contas estão em dia</Text>
          </View>
        ) : (
          pendingTransactions.slice(0, 5).map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={[
                styles.transactionCard,
                { borderLeftColor: getStatusColor(transaction) }
              ]}
              onPress={() => handleMarkAsPaid(transaction)}
            >
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionCategory}>
                    {transaction.category}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.amountText,
                    { color: transaction.type === 'income' ? '#34C759' : '#FF3B30' }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.transactionFooter}>
                <View style={styles.dueDateContainer}>
                  <Ionicons 
                    name={getStatusIcon(transaction)} 
                    size={16} 
                    color={getStatusColor(transaction)} 
                  />
                  <Text style={[
                    styles.dueDateText,
                    { color: getStatusColor(transaction) }
                  ]}>
                    {formatDate(transaction.dueDate)}
                    {!isOverdue(transaction.dueDate) && !isDueToday(transaction.dueDate) && 
                      ` (${formatDaysUntilDue(transaction.dueDate)})`
                    }
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handleMarkAsPaid(transaction)}
                >
                  <Text style={styles.payButtonText}>
                    {transaction.type === 'income' ? 'Receber' : 'Pagar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
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
  balanceCard: {
    margin: 20,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  alertsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});