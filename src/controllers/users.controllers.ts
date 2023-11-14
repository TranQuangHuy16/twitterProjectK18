import { NextFunction, Request, Response } from 'express'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterRequestBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnfollowParams,
  UpdateMeReqBody,
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
import { json } from 'stream/consumers'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  // lấy user_id từ user của req
  const user = req.user as User
  const user_id = user._id as ObjectId
  // dùng cái user_id để tạo access_token và refresh_token
  const result = await usersService.login({
    user_id: user_id.toString(),
    verify: user.verify
  })
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
  const { _id, verify } = req.user as User
  // dùng _id tìm và cập nhật lại user thêm vào forgot_password_token
  const result = await usersService.forgotPassword({
    user_id: (_id as ObjectId).toString(),
    verify
  })
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

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  // muốn cập nhật mật khẩu mới cần user_id và password mới
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  // cập nhật password mới cho user có user_id này
  const result = await usersService.resetPassword({ user_id, password })
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  // muốn lấy thông tin của user thì cần user_id
  const { user_id } = req.decoded_authorization as TokenPayload
  // tiến hành vào databse tìm và lấy thông tin user
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  // muốn updae thông tin của user thì cần user_id và thông tin người ta muốn update
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  // giờ mình sẽ update usert thông qua user_id này với body được cho
  const result = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
  // khi mới login xong cấp access_token verify vẫn là 0
  // khi đã verify email rồi thì access_token đó vẫn còn verify là 0
  // nên có 2 hướng giải quyết
  // 1 là đăng nhập lại or đợi access_token hết hạn tạo ra cái mới thì access_token mới có verify là 1
  // 2 là dùng socket io để bắn ngược req từ server về client yêu cầu client tạo ra refresh_token mới
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  // muốn lấy thông tin của user thì cần username
  const { username } = req.params
  // tiến hành vào databse tìm và lấy thông tin user
  const user = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body // lấy followed_user_id từ req.body
  const result = await usersService.follow(user_id, followed_user_id)
  return res.json(result)
}

export const unfollowController = async (req: Request<UnfollowParams>, res: Response, next: NextFunction) => {
  // lấy ra user_id người muốn thực hiện hành động unfollow
  const { user_id } = req.decoded_authorization as TokenPayload
  // lấy ra người mà mình muốn unfollow
  const { user_id: followed_user_id } = req.params
  // gọi hàm unfollow
  const result = await usersService.unfollow(user_id, followed_user_id)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  return res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ user_id, refresh_token, verify, exp })
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_IS_SUCCESS,
    result
  })

  return res.json(result)
}

export const oAuthController = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query
  const { access_token, refresh_token, new_user } = await usersService.oAuth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${access_token}&refresh_token=${refresh_token}&new_user=${new_user}`
  return res.redirect(urlRedirect)
}
