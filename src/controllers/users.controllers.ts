import { Request, Response } from 'express'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'

export const loginController = async (req: Request, res: Response) => {
  // lấy user_id từ user của req
  const { user }: any = req
  const user_id = user._id
  // dùng cái user_id để tạo access_token và refresh_token
  const result = await usersService.login(user_id.toString())
  // res access_token và refresh_token cho client
  res.json({
    message: 'login success',
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const { email, password, name } = req.body

  const result = await usersService.register(req.body)
  res.json({
    message: 'register success',
    result
  })
}
