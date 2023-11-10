import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import formidable, { Files } from 'formidable'
import { min } from 'lodash'
import { File } from 'formidable'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    // lưu vào thư mục uploads/temp
    return fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true //cho phép tạo folder nested vào nhau
    }) //fs.mkdirSync tạo ra thư mục
  }
  //   fs là thư viện dùng để thao tác với các đường dẫn
}

export const getNameFromFullName = (filename: string) => {
  // sadsadsa.sadsadsad.asdsadsa.png
  const nameArray = filename.split('.')
  // [sadsadsa, sadsadsad, asdsadsa, png]
  nameArray.pop() //xóa phần tử cuối cùng
  // [sadsadsa, sadsadsad, asdsadsa]
  return nameArray.join('')
}

// hàm xử lý file mà client đã gửi lên
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_TEMP_DIR), //lưu vào thư mục uploads/temp
    maxFiles: 4,
    keepExtensions: true, //giữ lại đuôi file ex: jpg,...
    maxFileSize: 300 * 1024 * 4, //giới hạn kích thước file
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/')) //kiểm tra file có phải là ảnh không
      if (!valid) {
        form.emit('error' as any, new Error('File is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files.image as File[])
    }) //form.parse ép req thành file
  })
}
