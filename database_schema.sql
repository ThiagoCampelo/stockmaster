-- Arquivo de Referência do Schema do Banco de Dados (Supabase/PostgreSQL)

-- 1. Tabela de Usuários
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL, -- Hash MD5
    nome TEXT NOT NULL,
    status TEXT DEFAULT 'Ativo', -- 'Ativo' | 'Inativo'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Produtos
CREATE TABLE produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    quantidade INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Movimentações
CREATE TABLE movimentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    produto_id UUID REFERENCES produtos(id) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id),
    tipo TEXT NOT NULL, -- 'Entrada' | 'Saída'
    quantidade INTEGER NOT NULL,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Função RPC para Ajuste de Estoque em Lote (Stored Procedure)
-- Esta função é chamada via RPC pelo backend para atualizar o saldo dos produtos
CREATE OR REPLACE FUNCTION ajustar_estoque_lote(ajustes jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    item jsonb;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(ajustes)
    LOOP
        UPDATE produtos
        SET quantidade = quantidade + (item->>'delta')::int
        WHERE id = (item->>'produto_id_input')::uuid;
    END LOOP;
END;
$$;

-- 5. Inserção de Usuário Inicial (Admin)
-- Usuário: admin
-- Senha: admin (MD5: 21232f297a57a5a743894a0e4a801fc3)
INSERT INTO usuarios (usuario, senha, nome, status)
VALUES ('admin', '21232f297a57a5a743894a0e4a801fc3', 'Administrador', 'Ativo')
ON CONFLICT (usuario) DO NOTHING;