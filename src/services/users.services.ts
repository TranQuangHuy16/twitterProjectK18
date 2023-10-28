import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import e from 'express'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { config } from 'dotenv'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
config()

class UsersService {
  // viết hàm nhận vào user_id để bỏ vào payload tạo access token
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN
      }
    })
  }
  // viết hàm nhận vào user_id để bỏ vào payload tạo refresh token
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN
      }
    })
  }
  // ký access_token và refresh_token
  private async signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async checkUserExists(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user) //ép kiểu về boolean
  }

  async register(payload: RegisterRequestBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    // lấy user_id từ user mới tạo
    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    // lưu refresh_token vào database
    await databaseService.refeshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return { access_token, refresh_token }
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    // LƯU refresh_token vào database
    await databaseService.refeshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return { access_token, refresh_token }
  }
}

const usersService = new UsersService()
export default usersService
