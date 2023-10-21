import { Request, Response } from 'express'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'test@gmail.com' && password === '123456') {
    return res.json({
      message: 'login success',
      result: [
        { name: 'Điệp', yob: 1999 },
        { name: 'Hùng', yob: 2004 },
        { name: 'Được', yob: 1994 }
      ]
    })
  }
  return res.status(400).json({
    error: 'login failed'
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const { email, password, name } = req.body

  try {
    const result = await usersService.register(req.body)
    res.json({
      message: 'register success',
      result
    })
  } catch (error) {
    res.status(400).json({
      message: 'register failed',
      error
    })
  }
}
