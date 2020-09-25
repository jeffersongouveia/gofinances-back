import { getCustomRepository, getRepository } from 'typeorm'

import Transaction from '../models/Transaction'
import Category from '../models/Category'
import CreateCategoryService from './CreateCategoryService'
import TransactionsRepository from '../repositories/TransactionsRepository'
import AppError from '../errors/AppError'

interface Request {
  title: string
  value: number
  type: 'income' | 'outcome'
  category: string
}

class CreateTransactionService {
  public async execute(data: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository)
    const categoryRepository = getRepository(Category)

    let category = await categoryRepository.findOne({
      where: { title: data.category },
    })

    // Checks if the client have balance to add a outcome
    if (data.type === 'outcome') {
      const balance = await transactionRepository.getBalance()

      if (balance.total - data.value < 0) {
        throw new AppError("You haven't balance enough to add this outcome")
      }
    }

    if (!category) {
      const createCategory = new CreateCategoryService()
      category = await createCategory.execute(data.category)
    }

    const transaction = transactionRepository.create({
      ...data,
      category,
    })
    await transactionRepository.save(transaction)

    return transaction
  }
}

export default CreateTransactionService
