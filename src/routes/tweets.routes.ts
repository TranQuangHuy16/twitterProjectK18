import { Router } from 'express'
import { create } from 'lodash'
import { createTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator } from '~/middlewares/tweets.middlwares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const tweetsRouter = Router()

/*
des: route tạo tweet
method: POST
header: {Authorization: Bearer <access_token>}
phải verify account thì mới tạo được tweet
body: TweetRequestBody
*/
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapAsync(createTweetController)
)
export default tweetsRouter
