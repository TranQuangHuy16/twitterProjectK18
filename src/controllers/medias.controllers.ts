import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import { handleUploadImage } from '~/utils/file'
import fs from 'fs'
import mime from 'mime'

import HTTP_STATUS from '~/constants/httpStatus'
export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediasService.uploadImage(req)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

export const serveImageController = async (req: Request, res: Response) => {
  const { namefile } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, namefile), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found image')
    }
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const url = await mediasService.uploadVideo(req)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

export const serveVideoStreamController = async (req: Request, res: Response) => {
  const { namefile } = req.params
  const range = req.headers.range

  // lấy kích thước tối đa của video
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, namefile) //lấy đường dẫn của video
  const videoSize = fs.statSync(videoPath).size //lấy kích thước của video
  // nếu không có range thì yêu cầu range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires range header')
  }
  const CHUNK_SIZE = 10 ** 6 // 1mb
  const start = Number(range.replace(/\D/g, '')) //lấy số trong range
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1) //lấy phần tử cuối cùng của video
  // dung lực thực tế của video
  const contentLength = end - start + 1
  const contentTpye = mime.getType(videoPath) || 'video/*' //lấy kiểu của video
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentTpye
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers) //trả về phần của video
  const videoStreams = fs.createReadStream(videoPath, { start, end }) //đọc video từ start đến end
  videoStreams.pipe(res) //trả về video
}
