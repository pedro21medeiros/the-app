-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    due_date TIMESTAMPTZ NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Política de segurança (Row Level Security)
-- Por enquanto, permitir acesso a todos os dados
-- Em produção, você deve configurar políticas de segurança baseadas em usuários
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política temporária que permite acesso total (REMOVA EM PRODUÇÃO)
CREATE POLICY "Allow all operations for now" ON transactions
    FOR ALL USING (true) WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE transactions IS 'Tabela para armazenar transações financeiras (receitas e despesas)';
COMMENT ON COLUMN transactions.amount IS 'Valor da transação em formato decimal';
COMMENT ON COLUMN transactions.type IS 'Tipo da transação: income (receita) ou expense (despesa)';
COMMENT ON COLUMN transactions.status IS 'Status da transação: pending (pendente) ou paid (pago)';
COMMENT ON COLUMN transactions.due_date IS 'Data de vencimento da transação';
COMMENT ON COLUMN transactions.is_recurring IS 'Indica se a transação é recorrente (mensal)';

-- Inserir dados de exemplo (opcional)
INSERT INTO transactions (description, amount, category, type, due_date, status) VALUES
('Salário Janeiro', 5000.00, 'Salário', 'income', '2024-01-05', 'paid'),
('Conta de Luz', 150.00, 'Moradia', 'expense', '2024-01-15', 'pending'),
('Internet', 99.90, 'Moradia', 'expense', '2024-01-10', 'pending'),
('Freelance Web', 1200.00, 'Freelance', 'income', '2024-01-20', 'pending'),
('Supermercado', 450.00, 'Alimentação', 'expense', '2024-01-08', 'paid')
ON CONFLICT DO NOTHING;