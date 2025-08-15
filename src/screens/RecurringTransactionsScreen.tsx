import React, { useMemo } from 'react';
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

export default function RecurringTransactionsScreen() {
  const { transactions, deleteTransaction, loading } = useAppContext();

  if (loading) {
    return <LoadingSpinner message="Carregando transações recorrentes..." />;
  }

  // Agrupar transações recorrentes por descrição, categoria e valor
  const recurringGroups = useMemo(() => {
    const recurring = transactions.filter(t => t.isRecurring);
    
    const groups = new Map<string, Transaction[]>();
    
    recurring.forEach(transaction => {
      const key = `${transaction.description}-${transaction.category}-${transaction.amount}-${transaction.type}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(transaction);
    });

    // Converter para array e ordenar por próxima data
    return Array.from(groups.entries()).map(([key, transactions]) => ({
      key,
      transactions: transactions.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ),
      baseTransaction: transactions[0], // Use primeira como modelo
      nextDueDate: transactions.find(t => t.status === 'pending')?.dueDate || transactions[0].dueDate,
      totalRemaining: transactions.filter(t => t.status === 'pending').length,
    })).sort((a, b) => 
      new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
    );
  }, [transactions]);

  const handleDeleteRecurringGroup = (group: any) => {
    Alert.alert(
      'Excluir Transações Recorrentes',
      `Tem certeza que deseja excluir todas as ${group.transactions.length} transações de "${group.baseTransaction.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir Todas', 
          style: 'destructive',
          onPress: async () => {
            for (const transaction of group.transactions) {
              await deleteTransaction(transaction.id);
            }
          }
        },
      ]
    );
  };

  const renderRecurringGroup = ({ item: group }: { item: any }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupDescription}>{group.baseTransaction.description}</Text>
          <Text style={styles.groupCategory}>{group.baseTransaction.category}</Text>
          <Text style={styles.groupSchedule}>
            {group.totalRemaining} transações pendentes
          </Text>
        </View>
        
        <View style={styles.groupRight}>
          <Text style={[
            styles.groupAmount,
            { color: group.baseTransaction.type === 'income' ? '#34C759' : '#FF3B30' }
          ]}>
            {group.baseTransaction.type === 'income' ? '+' : '-'}{formatCurrency(group.baseTransaction.amount)}
          </Text>
          
          <Text style={styles.nextDate}>
            Próxima: {formatDate(group.nextDueDate)}
          </Text>
        </View>
      </View>

      <View style={styles.groupActions}>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => {
            Alert.alert(
              'Detalhes das Transações',
              `Total de transações: ${group.transactions.length}\n` +
              `Pendentes: ${group.totalRemaining}\n` +
              `Pagas: ${group.transactions.filter((t: Transaction) => t.status === 'paid').length}\n\n` +
              'Use a tela de Histórico para gerenciar transações individuais.'
            );
          }}
        >
          <Ionicons name="eye" size={16} color="white" />
          <Text style={styles.viewDetailsButtonText}>Ver Detalhes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteGroupButton}
          onPress={() => handleDeleteRecurringGroup(group)}
        >
          <Ionicons name="trash" size={16} color="white" />
          <Text style={styles.deleteGroupButtonText}>Excluir Série</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transações Recorrentes</Text>
        <Text style={styles.subtitle}>Gerencie suas séries de transações</Text>
      </View>

      {recurringGroups.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="repeat" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma transação recorrente</Text>
          <Text style={styles.emptySubtext}>
            Marque transações como recorrentes ao criá-las
          </Text>
        </View>
      ) : (
        <FlatList
          data={recurringGroups}
          keyExtractor={(item) => item.key}
          renderItem={renderRecurringGroup}
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
  listContainer: {
    padding: 20,
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  groupCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  groupSchedule: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  groupRight: {
    alignItems: 'flex-end',
  },
  groupAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nextDate: {
    fontSize: 12,
    color: '#666',
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteGroupButtonText: {
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