import { Request, Response } from 'express'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/User.requests'
import { TWEETS_MESSAGES } from '~/constants/messages'
import tweetsServices from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  // muốn đăng bài thì cần user_id: biết ai là người đăng
  //   body: nội dung của tweet
  const body = req.body as TweetRequestBody
  const { user_id } = req.decoded_authorization as TokenPayload
  //   gọi hàm lưu vào database
  const result = await tweetsServices.createTweet(user_id, body)
  return res.json({
    message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESSFULLY,
    result
  })
}
