import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import Tweet from '~/models/schemas/Tweet.schema'

class TweetsServices {
  async createTweet(user_id: string, body: TweetRequestBody) {
    // lưu vào database
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: [], //để mảng rỗng xử lý sau
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    // result: kết quả là object có 2 thuộc tính {acknowledged: true, insertedId: 'id của tweet vừa tạo'}
    // lấy id tweet vừa tạo
    const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(result.insertedId) })
    return tweet
  }
}

const tweetsServices = new TweetsServices()
export default tweetsServices
