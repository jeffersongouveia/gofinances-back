import csv from 'neat-csv'
import fs from 'fs'

import AppError from '../errors/AppError'
import Transaction from '../models/Transaction'
import CreateTransactionService from './CreateTransactionService'

interface FileTransaction {
  title: string
  type: 'income' | 'outcome'
  value: number
  category: string
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService()
    const parsedTransactions = await this.parseCSV(path)

    // The pending requests will be saved here
    const transactions: Transaction[] = []

    for (const transaction of parsedTransactions) {
      const savedTransaction = await createTransactionService.execute({
        title: transaction.title,
        category: transaction.category,
        value: transaction.value,
        type: transaction.type,
      })

      transactions.push(savedTransaction)
    }

    this.deleteFileCSV(path)

    return transactions
  }

  private async parseCSV(path: string): Promise<FileTransaction[]> {
    return new Promise((resolve, reject) => {
      let transactions: FileTransaction[] = []

      fs.readFile(path, async (err, data) => {
        if (err) {
          reject(new AppError('An internal error occurred'))
          return
        }

        transactions = await csv(data, {
          mapHeaders: ({ header }) => header.trim(),
          mapValues: ({ value }) => value.trim(),
        })

        resolve(transactions)
      })
    })
  }

  private deleteFileCSV(path: string): void {
    fs.unlink(path, error => {
      if (error) {
        console.error(error)
      }
    })
  }
}

export default ImportTransactionsService
