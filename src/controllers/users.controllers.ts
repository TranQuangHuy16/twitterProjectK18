import { Request, Response } from 'express'
import {
  LoginReqBody,
  LogoutReqBody,
  RegisterRequestBody,
  TokenPayload,
  VerifyEmailReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ErrorWithStatus } from '~/models/Errors'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  // lấy user_id từ user của req
  const user = req.user as User
  const user_id = user._id as ObjectId
  // dùng cái user_id để tạo access_token và refresh_token
  const result = await usersService.login(user_id.toString())
  // res access_token và refresh_token cho client
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const { email, password, name } = req.body

  const result = await usersService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  // lấy refresh_token từ req.body
  const { refresh_token } = req.body
  // logout: vào database xóa refresh_token này
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyTokenController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  // nếu mà code vào được đây nghĩa là email_verify_token hợp lệ
  // và mình đã lấy được decoded_email_verify_token
  // từ cái decoded_email_verify_token lấy ra user_id
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  // dựa vào user_id tìm user và xem nó đã verify email chưa
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  // nếu đã validate rồi thì không cần validate lại
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_IS_ALREADY_VERIFIED_BEFORE
    })
  }
  // NẾU MÀ KHÔNG KHỚP email_verify_token
  if (user.email_verify_token !== (req.body.email_verify_token as string)) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INCORRECT,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  // nếu mà xuống được đây có nghĩa là user chưa verify
  // mình sẽ update lại user đó
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  // nếu vào được đây có nghĩa là access_token hợp lệ
  // và mình đã lấy được decoded_authorization
  // từ cái decoded_authorization lấy ra user_id
  const { user_id } = req.decoded_authorization as TokenPayload
  // dựa vào user_id tìm user và xem nó đã verify email chưa
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_IS_ALREADY_VERIFIED_BEFORE
    })
  }
  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  // user này thật sự chưa verify: mình sẽ tạo lại email_verify_token
  // cập nhật lại user
  const result = await usersService.resendEmailVerify(user_id)
  return res.json({
    message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
    result
  })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  // lấy user_id từ user của req
  const { _id } = req.user as User
  // dùng _id tìm và cập nhật lại user thêm vào forgot_password_token
  const result = await usersService.forgotPassword((_id as ObjectId).toString())
  return res.json({
    message: USERS_MESSAGES.FORGOT_PASSWORD_SUCCESS,
    result
  })
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}
