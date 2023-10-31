import { TokenPayload } from './models/requests/User.requests'
import User from './models/schemas/User.schema'
import { Request } from 'express'
// file này dùng để định nghĩa lại những thuộc tính có sẵn
declare module 'express' {
  interface Request {
    user?: User
    decoded_refresh_token?: TokenPayload
    decoded_authorization?: TokenPayload
    decoded_email_verify_token?: TokenPayload
  }
}
