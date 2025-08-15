# Financial Manager App

App de gestão financeira pessoal desenvolvido com React Native + Expo + Supabase.

## Funcionalidades

✅ **Gestão de Transações**
- Adicionar receitas e despesas
- Categorizar transações
- Marcar como pago/pendente
- Histórico completo com filtros

✅ **Dashboard Inteligente**
- Visão geral das finanças
- Alertas de contas em atraso
- Próximos vencimentos
- Saldo atual

✅ **Notificações Locais**
- Lembretes automáticos de vencimento
- Configurável (1-7 dias de antecedência)
- Funciona offline

✅ **Interface Moderna**
- Design iOS/Android nativo
- Navegação por abas
- Estados de loading
- Feedback visual

## Tecnologias

- **React Native** + **Expo** - Framework mobile
- **TypeScript** - Tipagem estática  
- **Supabase** - Backend as a Service (PostgreSQL)
- **React Navigation** - Navegação
- **React Hook Form** - Formulários
- **Expo Notifications** - Notificações locais
- **date-fns** - Manipulação de datas

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
3. Preencha descrição, valor e categoria
4. Defina a data de vencimento
5. Marque como recorrente se necessário

### Marcar como Pago
- Na tela inicial, toque em "Pagar" na transação
- Ou no histórico, use o botão verde com ✓

### Configurar Notificações
1. Vá em "Configurações"
2. Ative/desative notificações
3. Escolha quantos dias antes ser lembrado

### Visualizar Histórico
- Tela "Histórico" mostra todas as transações
- Use os filtros para ver apenas pendentes, pagas, etc.
- Estatísticas no topo mostram resumo

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

## Próximas funcionalidades

- [ ] Backup para Google Drive
- [ ] Relatórios mensais
- [ ] Gráficos de gastos
- [ ] Importação de extrato bancário
- [ ] Modo escuro
- [ ] Múltiplas contas

## Licença

Projeto pessoal - uso livre