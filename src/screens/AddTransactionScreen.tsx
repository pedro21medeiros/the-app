import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext } from '../contexts/AppContext';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface FormData {
  description: string;
  amount: string;
  category: string;
  type: 'expense' | 'income';
  dueDate: Date;
  isRecurring: boolean;
}

const categories = {
  expense: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Roupas',
    'Tecnologia',
    'Outros Gastos',
  ],
  income: [
    'Salário',
    'Freelance',
    'Investimentos',
    'Venda',
    'Outros Recebimentos',
  ],
};

export default function AddTransactionScreen() {
  const { addTransaction } = useAppContext();
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    defaultValues: {
      description: '',
      amount: '',
      category: '',
      type: 'expense',
      dueDate: selectedDate,
      isRecurring: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const baseTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        description: data.description,
        amount: parseFloat(data.amount.replace(',', '.')),
        category: data.category,
        type: data.type,
        dueDate: data.dueDate,
        isRecurring: data.isRecurring,
        status: 'pending',
      };

      if (data.isRecurring) {
        // Gerar 12 transações mensais
        for (let i = 0; i < 12; i++) {
          const nextMonthDate = new Date(data.dueDate);
          nextMonthDate.setMonth(nextMonthDate.getMonth() + i);
          
          const recurringTransaction = {
            ...baseTransaction,
            dueDate: nextMonthDate,
          };
          
          await addTransaction(recurringTransaction);
        }
        
        Alert.alert(
          'Sucesso!',
          '12 transações recorrentes criadas com sucesso.',
          [{ text: 'OK', onPress: () => {
            reset();
            setSelectedDate(new Date());
          }}]
        );
      } else {
        await addTransaction(baseTransaction);
        
        Alert.alert(
          'Sucesso!',
          'Transação adicionada com sucesso.',
          [{ text: 'OK', onPress: () => {
            reset();
            setSelectedDate(new Date());
          }}]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a transação. Tente novamente.');
    }
  };

  const handleTypeChange = (type: 'expense' | 'income') => {
    setSelectedType(type);
    setValue('type', type);
    setValue('category', '');
  };

  const formatAmountInput = (value: string) => {
    // Remove tudo que não é número
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    
    // Se está vazio, retorna vazio
    if (onlyNumbers === '') return '';
    
    // Converte para número (em centavos) e depois para reais
    const numberInCents = parseInt(onlyNumbers, 10);
    const numberInReais = numberInCents / 100;
    
    // Formata com 2 casas decimais e substitui ponto por vírgula
    return numberInReais.toFixed(2).replace('.', ',');
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setValue('dueDate', date);
    }
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior="height"
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Adicionar Transação</Text>
          <Text style={styles.subtitle}>Registre seus gastos e receitas</Text>
        </View>

        <View style={styles.form}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === 'expense' && styles.typeButtonActive,
              { backgroundColor: selectedType === 'expense' ? '#FF3B30' : '#f0f0f0' }
            ]}
            onPress={() => handleTypeChange('expense')}
          >
            <Ionicons 
              name="arrow-down" 
              size={20} 
              color={selectedType === 'expense' ? 'white' : '#666'} 
            />
            <Text style={[
              styles.typeButtonText,
              { color: selectedType === 'expense' ? 'white' : '#666' }
            ]}>
              Gasto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === 'income' && styles.typeButtonActive,
              { backgroundColor: selectedType === 'income' ? '#34C759' : '#f0f0f0' }
            ]}
            onPress={() => handleTypeChange('income')}
          >
            <Ionicons 
              name="arrow-up" 
              size={20} 
              color={selectedType === 'income' ? 'white' : '#666'} 
            />
            <Text style={[
              styles.typeButtonText,
              { color: selectedType === 'income' ? 'white' : '#666' }
            ]}>
              Receita
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição *</Text>
          <Controller
            control={control}
            rules={{ required: 'Descrição é obrigatória' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.description && styles.inputError]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Ex: Conta de luz, Salário..."
                placeholderTextColor="#999"
              />
            )}
            name="description"
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor (R$) *</Text>
          <Controller
            control={control}
            rules={{ 
              required: 'Valor é obrigatório',
              validate: (value) => {
                const numValue = parseFloat(value.replace(',', '.'));
                return numValue > 0 || 'Valor deve ser maior que zero';
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.amount && styles.inputError]}
                onBlur={onBlur}
                onChangeText={(text) => onChange(formatAmountInput(text))}
                value={value}
                placeholder="0,00"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            )}
            name="amount"
          />
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoria *</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories[selectedType].map((category) => (
              <Controller
                key={category}
                control={control}
                rules={{ required: 'Selecione uma categoria' }}
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      value === category && styles.categoryButtonActive
                    ]}
                    onPress={() => onChange(category)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      value === category && styles.categoryButtonTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                )}
                name="category"
              />
            ))}
          </ScrollView>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de Vencimento *</Text>
          <Controller
            control={control}
            rules={{ required: 'Data é obrigatória' }}
            render={({ field: { value } }) => (
              <>
                <TouchableOpacity
                  style={[styles.dateInput, errors.dueDate && styles.inputError]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formatDateForDisplay(value)}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#666" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
              </>
            )}
            name="dueDate"
          />
          {errors.dueDate && (
            <Text style={styles.errorText}>{errors.dueDate.message}</Text>
          )}
        </View>

        <View style={styles.switchContainer}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchLabel}>Pagamento Recorrente</Text>
            <Text style={styles.switchDescription}>
              Esta transação se repete mensalmente
            </Text>
          </View>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: '#f0f0f0', true: '#007AFF' }}
                thumbColor={'white'}
              />
            )}
            name="isRecurring"
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.submitButtonText}>Adicionar Transação</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  form: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  typeButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dateInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
});