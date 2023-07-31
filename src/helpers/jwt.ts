import jwt from 'jsonwebtoken'
import config from 'config'
// import { userModel } from '../database'
import mongoose from 'mongoose'
import {  apiResponse, userStatus } from '../common'
import { Request, response, Response } from 'express'
import { responseMessage } from './response'
import { userModel } from '../database'

const ObjectId = mongoose.Types.ObjectId
const jwt_token_secret :any= config.get('jwt_token_secret')

export const userJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any
    if (authorization) {
        try {
            let isVerifyToken: any = jwt.verify(authorization, jwt_token_secret)
            console.log(isVerifyToken?.type,"ewe");
            console.log(userType,"ewe");
            
            if (isVerifyToken?.type != 0 && userType != "5") return res.status(403).json(await apiResponse(403, responseMessage?.accessDenied, {}, {}));

            result = await userModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
            if (result?.isBlock == true) return res.status(403).json(await apiResponse(403, responseMessage?.accountBlock, {}, {}));
            if (result?.isActive == true && isVerifyToken.authToken == result.authToken) {
                // Set in Header Decode Token Information
                req.headers.user = result
                return next()
            } else {
                return res.status(401).json(await apiResponse(401, responseMessage?.invalidToken, {}, {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(403).json(await apiResponse(403, responseMessage?.differentToken, {}, {}))
            console.log(err)
            return res.status(401).json(await apiResponse(401, responseMessage.invalidToken, {}, {}))
        }
    } else {
        return res.status(401).json(await apiResponse(401, responseMessage?.tokenNotFound, {}, {}))
    }
}

