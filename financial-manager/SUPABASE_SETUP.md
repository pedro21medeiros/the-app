# Configuração do Supabase

## Passo 1: Criar conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub/Google ou crie uma conta
4. Clique em "New Project"

## Passo 2: Configurar o projeto

1. **Nome do projeto**: `financial-manager` (ou o nome que preferir)
2. **Senha do banco**: Anote essa senha em local seguro
3. **Região**: Escolha a mais próxima (ex: South America - São Paulo)
4. **Pricing Plan**: Free (até 500MB e 500k requests/mês)
5. Clique em "Create new project"

## Passo 3: Obter as credenciais

Após o projeto ser criado (leva ~2 minutos):

1. Vá em **Settings** > **API**
2. Copie o **Project URL** 
3. Copie a **anon/public key**

## Passo 4: Configurar o banco de dados

1. Vá em **SQL Editor** no painel lateral
2. Clique em "New query"
3. Cole o conteúdo do arquivo `sql/create_tables.sql`
4. Clique em "Run" para executar

## Passo 5: Configurar as variáveis no app

Edite o arquivo `src/services/supabase.ts`:

```typescript
const supabaseUrl = 'SUA_PROJECT_URL_AQUI';
const supabaseAnonKey = 'SUA_ANON_KEY_AQUI';
```

## Passo 6: Testar a conexão

1. Execute `npm start`
2. Abra o app no simulador/device
3. Tente adicionar uma transação
4. Verifique no Supabase se apareceu na tabela

## Verificação dos dados

No painel do Supabase:
1. Vá em **Table Editor**
2. Selecione a tabela `transactions`
3. Você deve ver os dados de exemplo + suas transações

## Troubleshooting

### Erro de conexão
- Verifique se URL e chave estão corretas
- Confirme que executou o SQL para criar as tabelas

### Erro de permissão
- As políticas estão abertas para teste
- Em produção, configure autenticação e RLS apropriado

### Dados não aparecem
- Verifique logs do console no app
- Confirme que a tabela foi criada corretamente

## Exemplo de dados

Após executar o SQL, você terá algumas transações de exemplo:
- Salário Janeiro (R$ 5.000,00) - Pago
- Conta de Luz (R$ 150,00) - Pendente  
- Internet (R$ 99,90) - Pendente
- Freelance Web (R$ 1.200,00) - Pendente
- Supermercado (R$ 450,00) - Pago

## Próximos passos

Uma vez funcionando:
1. Remover dados de exemplo se desejar
2. Configurar autenticação (opcional para uso pessoal)
3. Ajustar políticas de segurança para produção
4. Considerar backup dos dados importantes