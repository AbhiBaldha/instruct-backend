"use strict"
import { Request, Router, Response } from 'express'
import { userRouter } from './user'
import { userStatus } from '../common'
import { authRouter } from './auth'
import { uploadRouter } from './upload'
    
const router = Router()
const accessControl = (req: Request, res: Response, next: any) => {
    req.headers.userType = userStatus[req.originalUrl.split('/')[1]]
    next()
}
router.use('/auth',  accessControl, authRouter)
router.use('/user',  accessControl, userRouter)
router.use('/upload', accessControl, uploadRouter)

export { router }