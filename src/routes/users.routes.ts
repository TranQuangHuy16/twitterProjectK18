import { Router } from 'express'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
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
usersRouter.get('/login', loginValidator, wrapAsync(loginController))

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

export default usersRouter

// nếu là hàm async thì throw new Error sẽ lỗi nên ta phải dùng try catch để chụp lại err r next(err) | promise
