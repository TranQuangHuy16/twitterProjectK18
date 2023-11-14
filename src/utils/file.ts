import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import formidable, { Files } from 'formidable'
import { min } from 'lodash'
import { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      // lưu vào thư mục uploads/temp
      return fs.mkdirSync(dir, {
        recursive: true //cho phép tạo folder nested vào nhau
      }) //fs.mkdirSync tạo ra thư mục
    }
    //   fs là thư viện dùng để thao tác với các đường dẫn
  })
}

// hinhanhdep.png => hinhanhdep
export const getNameFromFullName = (filename: string) => {
  // sadsadsa.sadsadsad.asdsadsa.png
  const nameArray = filename.split('.')
  // [sadsadsa, sadsadsad, asdsadsa, png]
  nameArray.pop() //xóa phần tử cuối cùng
  // [sadsadsa, sadsadsad, asdsadsa]
  return nameArray.join('')
}

// dsadsadsa.dsadsadsad.mp4 => mp4
export const getExtension = (filename: string) => {
  const nameArray = filename.split('.') //[dsadsadsa, dsadsadsad, mp4]
  return nameArray[nameArray.length - 1] //[mp4]
}

// hàm xử lý file mà client đã gửi lên
// formidable: biến req lại thành image, kiểm tra yêu cầu của hình
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMAGE_TEMP_DIR), //lưu vào thư mục uploads/temp
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

// đối với video thì chỉ cần 1 file và k cần giữ extension
// vì vd: sadasdsa.dsadsad.mp4 có bug nó chỉ lấy sa thôi
export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_VIDEO_DIR), //lưu vào thư mục uploads/temp
    maxFiles: 1,
    // keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024 * 1024, // 50gb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('video/')) //kiểm tra file có phải là ảnh không
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

      if (!files.video) {
        return reject(new Error('Video is empty'))
      }

      // trong file(originalFilename, filepath, newFilename)
      // vì mình đã tắt kêepsExtension nên file sẽ không có đuôi của file
      const videos = files.video as File[] //lấy ra danh sách các video đã upload
      // duyệt qua từng video và
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string) // lấy đuổi của tên gốc
        video.newFilename += `.${ext}` // lắp đuổi vào tên mới
        fs.renameSync(video.filepath, `${video.filepath}.${ext}`) // lắp đuổi vào filepath: đường dẫn đến file mới
      })
      return resolve(files.video as File[])
    }) //form.parse ép req thành file
  })
}
