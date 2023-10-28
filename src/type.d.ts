import User from './models/schemas/User.schema'
import { Request } from 'express'
// file này dùng để định nghĩa lại những thuộc tính có sẵn
declare module 'express' {
  interface Request {
    user?: User
  }
}
