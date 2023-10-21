// giả xử là mình đang làm route / '/login'
// thì người dùng sẽ truyền email và password
// tạo 1 request có body là email và password
// -làm 1 middlewares kiểm tra xem email và password có
//      được truyền lên hay không?
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import usersService from '~/services/users.services'
import { validate } from '~/utils/validation'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing email or password'
    })
  }
  next()
}

/**
 body: {
  name,
  email,
  password,
  confirm_password,
  date_of_birth,
 }
 */
// checkSchema là của express-validator giúp validate dữ liệu
export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      }
    },
    email: {
      notEmpty: true,
      trim: true,
      isEmail: true,
      custom: {
        options: async (value, { req }) => {
          // value đại diện cho email vì custom nằm trong email
          const isExist = await usersService.checkUserExists(value)
          if (isExist) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 8,
          max: 50
        }
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage:
        'Password must be at least 8 characters long, contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol'
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 8,
          max: 50
        }
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage:
        'confirm_password must be at least 8 characters long, contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol',
      custom: {
        options: (value, { req }) => {
          // value đại diện cho confirm_password vì custom nằm trong confirm_password
          if (value !== req.body.password) {
            throw new Error('confirm_password does not match password')
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)
