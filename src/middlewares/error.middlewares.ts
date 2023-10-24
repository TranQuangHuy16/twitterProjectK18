import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // lỗi từ các nơi về đây
  // 500 lỗi không xác định
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(err, ['status']))
}
