import { Router } from 'express'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import {
  emailVerifyTokenController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { register } from 'module'
import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router()

// controller
/*
des: đăng nhập
path: /users/login
method: POST
body: {email, password}
*/
usersRouter.post('/login', loginValidator, wrapAsync(loginController))

// Description: Register a new user
// Path: /register
// Method: POST
// Body: {
//     email: string,
//     password: string,
//     confirm_password: string
//     date_of_birth: ISO8601
// }
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

/*
  des: lougout
  path: /users/logout
  method: POST
  Header: {Authorization: Bearer <access_token>}
  body: {refresh_token: string}
  */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController)) //ta sẽ thêm middleware sau

/*
des: verify email token
khi người dùng đăng ký họ sẽ nhận được mail có link dạng
http://localhost:3000/users/verify-email?token=<email_verify_token>
nếu mà nhấp vào link sẽ tạo ra req gửi lên email_verify_token lên server
server kiểm tra cái email_verify_token này có hợp lệ hay không
thì từ cái decoded_email_verify_token lấy ra user_id
và vào user_id đó để update email_verified thành '', verify = 1, update_at
path: /users/verify-email
method: POST
body: {token: string}
*/
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

/*
des: resend email verify token
khi email thất lạc hoặc email_verify_token hết hạn thì người dùng có nhu cầu resend lại email_verify_token
path: /users/resend-verify-email
method: POST
header: {Authorization: Bearer <access_token>} //đăng nhập mới được resend
body: {}
*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*
des: khi người dùng quên mật khẩu, họ gửi email để xin mình tạo cho họ forgot_password_token
path: /users/forgot-password
method: POST
body: {email: string}
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
des: khi người dùng nhấp vaò link trong email để reset password
họ sẽ gửi 1 req kèm forgot_password_token lên server
server kiểm tra cái forgot_password_token này có hợp lệ hay không
sau đó chuyển hướng họ tới trang đổi mật khẩu
path: /users/verify-forgot-password
method: POST
body: {forgot_password_token: string}
*/
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

/*
des: reset password
path: '/reset-password'
method: POST
Header: không cần, vì  ngta quên mật khẩu rồi, thì sao mà đăng nhập để có authen đc
body: {forgot_password_token: string, password: string, confirm_password: string}
*/
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/*
des: get profile của user
path: '/me'
method: get
Header: {Authorization: Bearer <access_token>}
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

export default usersRouter

// nếu là hàm async thì throw new Error sẽ lỗi nên ta phải dùng try catch để chụp lại err r next(err) | promise
