import { TransactionInput } from '../types/transaction';

export interface MockTransactionData extends TransactionInput {
}

export const mockDataService = {

  generateMockTransactions: (): MockTransactionData[] => {
    const transactions: MockTransactionData[] = [];
    
    const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Prêmios'];
    const expenseCategories = ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Entretenimento', 'Compras', 'Contas'];
    
    const incomeTitles = {
      'Salário': ['Salário Mensal', 'Pagamento CLT', 'Salário Empresa'],
      'Freelance': ['Projeto Web', 'Consultoria', 'Design Gráfico', 'Desenvolvimento App'],
      'Investimentos': ['Dividendos', 'Rendimento CDB', 'Lucro Ações', 'Juros Poupança'],
      'Vendas': ['Venda Produto', 'Comissão Vendas', 'Marketplace'],
      'Prêmios': ['Prêmio Performance', 'Bonificação', 'Premiação']
    };
    
    const expenseTitles = {
      'Alimentação': ['Supermercado', 'Restaurante', 'Delivery', 'Padaria', 'Açougue', 'Feira'],
      'Transporte': ['Combustível', 'Uber', 'Ônibus', 'Metrô', 'Estacionamento', 'Pedágio'],
      'Saúde': ['Farmácia', 'Consulta Médica', 'Exames', 'Plano de Saúde', 'Dentista'],
      'Educação': ['Curso Online', 'Livros', 'Mensalidade', 'Material Escolar'],
      'Entretenimento': ['Cinema', 'Netflix', 'Spotify', 'Show', 'Teatro', 'Games'],
      'Compras': ['Roupas', 'Eletrônicos', 'Casa', 'Presente', 'Online'],
      'Contas': ['Luz', 'Água', 'Internet', 'Telefone', 'Aluguel', 'Cartão de Crédito']
    };

    for (let i = 0; i < 200; i++) {
      const isIncome = Math.random() < 0.3;
      const type: 'income' | 'expense' = isIncome ? 'income' : 'expense';
      
      let category: string;
      let title: string;
      
      if (isIncome) {
        category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
        const titles = incomeTitles[category as keyof typeof incomeTitles];
        title = titles[Math.floor(Math.random() * titles.length)];
      } else {
        category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        const titles = expenseTitles[category as keyof typeof expenseTitles];
        title = titles[Math.floor(Math.random() * titles.length)];
      }
      
      const minAmount = 500;
      const maxAmount = isIncome ? 500000 : 200000;
      const amount = Math.floor(Math.random() * (maxAmount - minAmount)) + minAmount;
      
      const daysAgo = Math.floor(Math.random() * 90);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      const descriptions = [
        '',
        'Pagamento realizado via PIX',
        'Compra parcelada',
        'Pagamento à vista',
        'Transferência bancária',
        'Débito automático',
        'Cartão de crédito'
      ];
      
      const transaction: MockTransactionData = {
        title,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        amount,
        type,
        category,
        date
      };
      
      transactions.push(transaction);
    }
    
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
};
