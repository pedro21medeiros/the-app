# Financial Manager App

App de gestão financeira pessoal desenvolvido com React Native + Expo + Supabase.

## Funcionalidades

✅ **Gestão de Transações**
- Adicionar receitas e despesas com input monetário inteligente
- Categorizar transações (Alimentação, Transporte, Moradia, etc.)
- Marcar como pago/pendente
- Histórico completo com filtros avançados
- Seletor de data intuitivo com calendário nativo

✅ **Transações Recorrentes** 
- Criar automaticamente 12 transações mensais
- Gerenciar séries de transações recorrentes
- Visualizar próximas datas de vencimento
- Excluir ou editar transações recorrentes em grupo

✅ **Dashboard Inteligente**
- Visão geral das finanças do mês atual
- Alertas de contas em atraso
- Próximos vencimentos ordenados por data
- Saldo atual com receitas e gastos
- Filtro automático por mês

✅ **Navegação Temporal**
- Histórico com navegação entre meses
- Visualizar transações futuras
- Estatísticas por mês específico
- Botões de navegação mês anterior/próximo

✅ **Notificações Locais**
- Lembretes automáticos de vencimento
- Configurável (1-7 dias de antecedência)
- Funciona offline

✅ **Interface Moderna**
- Design iOS/Android nativo
- Navegação por abas + stack navigation
- Estados de loading
- Input monetário formatado automaticamente
- Filtros horizontais com scroll
- Layout responsivo e otimizado

## Tecnologias

- **React Native** + **Expo** - Framework mobile
- **TypeScript** - Tipagem estática  
- **Supabase** - Backend as a Service (PostgreSQL)
- **React Navigation** - Navegação (Tab + Stack)
- **React Hook Form** - Formulários e validação
- **@react-native-community/datetimepicker** - Seletor de data nativo
- **Expo Notifications** - Notificações locais
- **date-fns** - Manipulação e formatação de datas
- **Ionicons** - Ícones nativos

## Setup do Projeto

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Supabase
Siga as instruções detalhadas em `SUPABASE_SETUP.md`

### 3. Executar o app
```bash
npm start
```

### 4. Abrir no dispositivo
- Instale o **Expo Go** no seu celular
- Escaneie o QR Code que aparece no terminal
- Ou use um simulador iOS/Android

## Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   └── LoadingSpinner.tsx
├── contexts/            # Context API para estado global
│   └── AppContext.tsx
├── screens/             # Telas da aplicação
│   ├── HomeScreen.tsx
│   ├── AddTransactionScreen.tsx
│   ├── TransactionHistoryScreen.tsx
│   ├── RecurringTransactionsScreen.tsx
│   └── SettingsScreen.tsx
├── services/            # Integração com APIs
│   ├── supabase.ts
│   └── database.ts
├── types/               # Definições TypeScript
│   └── index.ts
└── utils/               # Funções utilitárias
    └── formatters.ts

sql/                     # Scripts SQL para Supabase
└── create_tables.sql
```

## Como usar

### Adicionar Transação
1. Toque na aba "Adicionar"
2. Escolha entre Gasto ou Receita
3. Preencha descrição e valor (digite apenas números - formato automático)
4. Selecione uma categoria das opções horizontais
5. Toque no campo de data para abrir o calendário
6. Marque como recorrente para criar 12 transações mensais

### Input Monetário Inteligente
- Digite apenas números: `1234` vira `12,34`
- Funciona como calculadora: cada dígito representa centavos
- Exemplo: `68` = R$ 0,68, `6800` = R$ 68,00

### Marcar como Pago
- Na tela inicial, toque em "Pagar" na transação
- Ou no histórico, use o botão verde com ✓

### Navegar entre Meses
- Na tela de histórico, use as setas ← → para navegar
- Toque no nome do mês para voltar ao mês atual
- Estatísticas se atualizam automaticamente por mês

### Gerenciar Transações Recorrentes
1. No histórico, toque em "Recorrentes" 
2. Visualize séries de transações agrupadas
3. Veja quantas restam e próximas datas
4. Exclua séries inteiras ou veja detalhes

### Visualizar Histórico
- Tela "Histórico" mostra transações do mês selecionado
- Use os filtros horizontais (Todas, Pendentes, Pagas, Gastos, Receitas)
- Filtros têm scroll horizontal para ver todas as opções
- Estatísticas no topo mostram resumo do mês

## Deploy

### Gerar APK
```bash
npx expo build:android
```

### Publicar na loja (opcional)
```bash
npx expo publish
```

## Customização

### Adicionar nova categoria
Edite `AddTransactionScreen.tsx` no array `categories`

### Alterar cores do tema
Modifique as cores nos arquivos de estilo de cada tela

### Configurar backup automático
Implemente sincronização com Google Drive (não incluído)

## Troubleshooting

### App não carrega
- Verifique se o Expo Go está atualizado
- Confirme que está na mesma rede WiFi
- Reinicie o comando `npm start`

### Dados não salvam
- Verifique configuração do Supabase
- Confirme que executou o SQL de criação das tabelas
- Veja logs de erro no console do Expo

### Notificações não funcionam
- Permita notificações quando solicitado
- Teste com data próxima (amanhã)
- Verifique se o app está funcionando em segundo plano

## Funcionalidades Implementadas ✅

- [x] **Transações básicas** - Criar, editar, excluir receitas e despesas
- [x] **Input monetário inteligente** - Formato automático baseado em centavos
- [x] **Seletor de data nativo** - Calendário integrado do sistema
- [x] **Transações recorrentes** - Geração automática de 12 meses
- [x] **Navegação temporal** - Visualizar histórico por mês
- [x] **Filtros avançados** - Por status, tipo, com scroll horizontal
- [x] **Dashboard inteligente** - Visão do mês atual com alertas
- [x] **Gerenciamento de recorrentes** - Tela dedicada para séries
- [x] **Layout responsivo** - Adaptado para diferentes tamanhos
- [x] **Notificações locais** - Lembretes de vencimento

## Próximas funcionalidades

- [ ] Backup para Google Drive
- [ ] Relatórios mensais com gráficos
- [ ] Importação de extrato bancário
- [ ] Modo escuro
- [ ] Múltiplas contas/carteiras
- [ ] Metas de gastos mensais
- [ ] Exportação para PDF/Excel
- [ ] Sincronização entre dispositivos

## Licença

Projeto pessoal - uso livre