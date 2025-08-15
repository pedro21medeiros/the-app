import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../contexts/AppContext';

export default function SettingsScreen() {
  const { 
    notificationSettings, 
    updateNotificationSettings,
    clearAllData 
  } = useAppContext();
  
  const [localSettings, setLocalSettings] = useState(notificationSettings);

  const handleNotificationToggle = (enabled: boolean) => {
    const newSettings = { ...localSettings, enabled };
    setLocalSettings(newSettings);
    updateNotificationSettings(newSettings);
  };

  const handleDaysBeforeChange = (daysBefore: number) => {
    const newSettings = { ...localSettings, daysBefore };
    setLocalSettings(newSettings);
    updateNotificationSettings(newSettings);
  };

  const handleClearData = () => {
    Alert.alert(
      'Limpar Dados',
      'Esta ação removerá todas as suas transações. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Sucesso', 'Todos os dados foram removidos.');
          }
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar Dados',
      'Esta funcionalidade será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color="#007AFF" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent && <View style={styles.settingRight}>{rightComponent}</View>}
      {onPress && !rightComponent && (
        <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>Personalize seu app</Text>
      </View>

      <SettingSection title="Notificações">
        <SettingItem
          icon="notifications"
          title="Notificações Ativas"
          subtitle="Receber lembretes de vencimento"
          rightComponent={
            <Switch
              value={localSettings.enabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#f0f0f0', true: '#007AFF' }}
              thumbColor="white"
            />
          }
        />

        {localSettings.enabled && (
          <>
            <View style={styles.daysContainer}>
              <Text style={styles.daysLabel}>
                Notificar com quantos dias de antecedência?
              </Text>
              <View style={styles.daysButtons}>
                {[1, 2, 3, 5, 7].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.dayButton,
                      localSettings.daysBefore === days && styles.dayButtonActive
                    ]}
                    onPress={() => handleDaysBeforeChange(days)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      localSettings.daysBefore === days && styles.dayButtonTextActive
                    ]}>
                      {days} {days === 1 ? 'dia' : 'dias'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </SettingSection>

      <SettingSection title="Dados">
        <SettingItem
          icon="download"
          title="Exportar Dados"
          subtitle="Fazer backup das suas transações"
          onPress={handleExportData}
        />
        
        <SettingItem
          icon="trash"
          title="Limpar Todos os Dados"
          subtitle="Remove todas as transações"
          onPress={handleClearData}
        />
      </SettingSection>

      <SettingSection title="Sobre">
        <SettingItem
          icon="information-circle"
          title="Versão do App"
          subtitle="1.0.0"
        />
        
        <SettingItem
          icon="card"
          title="Desenvolvido com"
          subtitle="React Native + Expo + Supabase"
        />
        
        <SettingItem
          icon="heart"
          title="Feito com ❤️"
          subtitle="Para gerenciamento financeiro pessoal"
        />
      </SettingSection>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Gestão Financeira © 2024
        </Text>
        <Text style={styles.footerSubtext}>
          Mantenha suas finanças organizadas
        </Text>
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
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    marginLeft: 12,
  },
  daysContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 2,
  },
  daysLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  daysButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
  },
});