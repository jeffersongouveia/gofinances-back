import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Transactions {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomes = await this.find({ where: { type: 'income' } });
    const outcomes = await this.find({ where: { type: 'outcome' } });

    const incomeSum = incomes.reduce((sum, item) => sum + item.value, 0);
    const outcomeSum = outcomes.reduce((sum, item) => sum + item.value, 0);

    return {
      income: incomeSum,
      outcome: outcomeSum,
      total: incomeSum - outcomeSum,
    };
  }

  public async getTransactions(): Promise<Transactions> {
    const transactions = await this.find({ relations: ['category'] });
    const balance = await this.getBalance();

    return { transactions, balance };
  }
}

export default TransactionsRepository;
