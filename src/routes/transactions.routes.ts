import { Router } from 'express'
import { getCustomRepository } from 'typeorm'
import multer from 'multer'
import path from 'path'

import TransactionsRepository from '../repositories/TransactionsRepository'
import CreateTransactionService from '../services/CreateTransactionService'
import DeleteTransactionService from '../services/DeleteTransactionService'
import ImportTransactionsService from '../services/ImportTransactionsService'

const transactionsRouter = Router()
const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'tmp'),
    filename(req, file, callback) {
      const now = new Date()
      const filename = `${now.getTime()}-${file.originalname}`

      return callback(null, filename)
    },
  }),
})

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository)
  const transactions = await transactionsRepository.getTransactions()

  return response.json(transactions)
})

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body

  const createTransactionService = new CreateTransactionService()
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  })

  return response.json(transaction)
})

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params

  const deleteTransactionService = new DeleteTransactionService()
  const transaction = await deleteTransactionService.execute(id)

  return response.json(transaction)
})

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService()
    const transactions = await importTransactionService.execute(
      request.file.path,
    )

    return response.json(transactions)
  },
)

export default transactionsRouter
