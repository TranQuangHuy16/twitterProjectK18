import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Other'

// định nghĩa người dùng truyền lên cái gì để tạo tweet
export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[] //không dùng objectID vì người dùng chỉ string
  mentions: string[]
  medias: Media[]
}
