# StockMaster 📦

Sistema moderno de gerenciamento de estoque desenvolvido para otimizar o controle de almoxarifado.

## 🚀 Sobre o Projeto

StockMaster é uma aplicação web completa para controle de produtos, movimentações de estoque (entradas e saídas) e gestão de usuários. O sistema conta com validações de segurança (prevenção de estoque negativo) e sugestões automáticas de compras.

### ✨ Funcionalidades Principais

-   **🔐 Autenticação Segura**: Login com verificação de credenciais e controle de sessão.
-   **📦 Gestão de Produtos**: Cadastro, edição e visualização de produtos com histórico detalhado.

## 🛠️ Tecnologias Utilizadas

-   **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
-   **Backend / Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Ícones**: [Lucide React](https://lucide.dev/)

## ⚙️ Como Executar o Projeto

### Pré-requisitos

-   Node.js instalado (versão 18+ recomendada)
-   Conta no Supabase (para o banco de dados)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/stockmaster.git
    cd stockmaster
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Configure as variáveis de ambiente:
    Crie um arquivo `.env.local` na raiz do projeto com suas credenciais do Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
    ```

4.  Execute o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

5.  Acesse a aplicação em [http://localhost:3000](http://localhost:3000).

### Banco de Dados (Schema)

O esquema do banco de dados (tabelas e funções) está disponível no arquivo [`database_schema.sql`](./database_schema.sql).

**Como usar:**
Copie o conteúdo deste arquivo e execute no **SQL Editor** do seu projeto no Supabase para criar as tabelas necessárias automaticamente.

**Acesso Inicial:**
Após rodar o script, um usuário padrão será criado automaticamente:
- **Usuário:** `admin`
- **Senha:** `admin`

---

Desenvolvido para fins de estudo e portfólio.
