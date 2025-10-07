# 💰 Personal Finance Manager

Um aplicativo completo de gerenciamento financeiro pessoal desenvolvido com React Native e Expo, permitindo controle total de receitas, despesas e visualização de dados através de gráficos interativos.

## 📋 Índice

- [Como Rodar](#-como-rodar)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Fluxo do Usuário](#-fluxo-do-usuário)
- [Funcionalidades](#-funcionalidades)

## 🚀 Como Rodar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Conta no Firebase (para configuração do backend)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd ptech3
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication (Email/Password)
   - Ative Firestore Database
   - Ative Storage (para anexos)
   - Copie as credenciais e configure em `app/firebase/config.ts`

4. **Inicie o projeto**
   ```bash
   npm start
   # ou
   yarn start
   ```

5. **Execute em uma plataforma**
   - Pressione `w` para abrir no navegador (Web)
   - Pressione `a` para abrir no Android (requer emulador ou dispositivo)
   - Pressione `i` para abrir no iOS (requer Mac e simulador)
   - Escaneie o QR Code com o app Expo Go no seu celular

## 🛠 Tecnologias Utilizadas

### Core

- **React Native** `0.81.4` - Framework para desenvolvimento mobile
- **Expo** `~54.0.12` - Plataforma para desenvolvimento React Native
- **TypeScript** `~5.9.2` - Superset JavaScript com tipagem estática
- **React** `19.1.0` - Biblioteca JavaScript para interfaces

### Navegação

- **Expo Router** `~6.0.10` - Sistema de roteamento baseado em arquivos
- **React Navigation** `^7.1.8` - Navegação entre telas
- **React Native Screens** `~4.16.0` - Otimização de performance de navegação

### Backend & Database

- **Firebase** `^12.3.0` - Backend as a Service
  - Authentication (autenticação de usuários)
  - Firestore (banco de dados NoSQL)
  - Storage (armazenamento de arquivos)

### UI & Estilo

- **@expo/vector-icons** `^15.0.2` - Ícones (Ionicons, FontAwesome5)
- **React Native Reanimated** `~4.1.1` - Animações fluidas
- **React Native Gesture Handler** `~2.28.0` - Gestos touch

### Funcionalidades Extras

- **Expo Document Picker** `~12.0.2` - Seleção de documentos
- **Expo Image Picker** `~15.0.7` - Seleção de imagens da galeria
- **AsyncStorage** `^2.2.0` - Armazenamento local
- **Expo Haptics** `~15.0.7` - Feedback tátil

### Desenvolvimento

- **ESLint** `^9.25.0` - Linter para qualidade de código
- **@types/react** `~19.1.0` - Tipos TypeScript para React

## 👤 Fluxo do Usuário

### 1. **Autenticação**

#### Registro
- Usuário acessa a tela de registro
- Preenche email e senha
- Sistema cria conta no Firebase Authentication
- Redirecionamento automático para o Dashboard

#### Login
- Usuário insere credenciais na tela inicial
- Sistema valida com Firebase
- Acesso concedido ao Dashboard

### 2. **Dashboard (Tela Principal)**

O Dashboard possui **duas abas principais**:

#### Aba de Transações
- **Resumo Financeiro**: Cards com saldo total, receitas e despesas
- **Visibilidade do Saldo**: Toggle para ocultar/mostrar valores
- **Lista de Transações Recentes**: Últimas 4 transações com:
  - Ícone da categoria
  - Título e data
  - Valor colorido (verde para receitas, vermelho para despesas)
- **Menu de Opções**: 
  - Popular dados de exemplo
  - Fazer logout
- **Navegação Inferior**: Acesso rápido a Início, Transações e Adicionar

#### Aba de Gráficos
- **Cards de Resumo**: Receitas e Despesas totais lado a lado
- **Gráfico de Pizza**: Top 5 despesas por categoria com porcentagens
- **Gráfico de Barras**: Top 5 receitas por categoria
- **Gráfico Temporal**: Evolução dos últimos 7 dias (receitas vs despesas)
- **Resumo Geral**: Métricas importantes (total de transações, receitas, despesas e saldo)

### 3. **Adicionar Transação**

- Clique no botão "+" na navegação inferior
- **Seleção de Tipo**: Toggle entre Despesa e Receita
- **Formulário**:
  - Título (obrigatório)
  - Valor (obrigatório, formatado em R$)
  - Categoria (obrigatório, lista dinâmica por tipo)
  - Descrição (opcional)
  - Anexo (opcional - documento ou foto)
- **Validações**: Campos obrigatórios e valor mínimo
- **Salvamento**: Dados enviados ao Firestore
- Redirecionamento ao Dashboard

### 4. **Visualizar Detalhes da Transação**

- Clique em qualquer transação na lista
- **Informações Exibidas**:
  - Badge do tipo (Receita/Despesa)
  - Valor destacado com cor
  - Título, categoria, descrição e data
  - Anexo (se houver)
- **Ações Disponíveis**:
  - **Editar**: Redireciona para tela de edição
  - **Excluir**: Confirmação antes de deletar

### 5. **Editar Transação**

- Clique em "Editar" nos detalhes
- Reutiliza a tela de adicionar transação
- **Campos Pré-preenchidos** com dados atuais
- **Permite Alterar**:
  - Tipo (Receita ↔ Despesa)
  - Todos os campos do formulário
  - Anexo
- Salvamento atualiza no Firestore
- Retorna à tela de detalhes

### 6. **Lista Completa de Transações**

- Acesso via navegação inferior "Transações"
- **Funcionalidades**:
  - Lista paginada (10 por vez)
  - Scroll infinito (carrega mais ao chegar no fim)
  - Cada item mostra: ícone, título, data e valor
  - Clique para ver detalhes
- **Indicador de Carregamento**: Spinner ao buscar mais dados

### 7. **Dados de Exemplo**

- Menu > "Popular com dados de exemplo"
- Sistema cria 200 transações fictícias
- Distribuídas entre receitas e despesas
- Categorias variadas
- Datas dos últimos 30 dias
- Útil para testar e visualizar gráficos

## ✨ Funcionalidades

### Gerenciamento Financeiro
- ✅ Adicionar receitas e despesas
- ✅ Editar transações existentes
- ✅ Excluir transações com confirmação
- ✅ Categorização automática
- ✅ Anexar comprovantes (fotos ou documentos)
- ✅ Cálculo automático de saldo

### Visualização de Dados
- ✅ Dashboard com resumo financeiro
- ✅ Gráficos interativos e coloridos
- ✅ Análise por categoria
- ✅ Evolução temporal (7 dias)
- ✅ Porcentagens e valores detalhados

### Experiência do Usuário
- ✅ Interface moderna e intuitiva
- ✅ Tema escuro
- ✅ Animações suaves
- ✅ Feedback visual em todas as ações
- ✅ Validações em tempo real
- ✅ Formatação automática de valores em R$

### Segurança
- ✅ Autenticação via Firebase
- ✅ Dados protegidos por usuário
- ✅ Rotas protegidas
- ✅ Logout seguro

---

**Desenvolvido com ❤️ usando React Native + Expo + Firebase**
