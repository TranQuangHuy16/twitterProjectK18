import { Request } from 'express'
import { get } from 'lodash'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullName, handleUploadImage } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'

config()
class MediasService {
  async uploadImage(req: Request) {
    // lưu ảnh vào trong uploads/temp
    const files = await handleUploadImage(req)
    // xử lý file bằng sharp giúp tối ưu hình ảnh(giảm dung lượng, ...)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFileName = getNameFromFullName(file.newFilename) + '.jpg'
        const newPath = UPLOAD_DIR + '/' + newFileName
        const info = await sharp(file.filepath).jpeg().toFile(newPath) //chuyển đổi file sang định dạng jpg r đổi thành newPath
        // xóa file trong temp
        fs.unlinkSync(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFileName}`
            : `http://localhost:${process.env.PORT}/static/image/${newFileName}`,
          type: MediaType.Image
        }
      })
    )

    return result
  }
}

const mediasService = new MediasService()
export default mediasService
