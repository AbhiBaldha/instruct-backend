"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { Request, Response } from 'express'

export const ChatWithGpt = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        message: Joi.string().required().error(new Error('message is required!')),
        isFirstTime: Joi.boolean().required().error(new Error('isFristTime is required! & isFristTime is boolean field ')),
        historyRoomId: Joi.string().allow("", null).required().error(new Error('historyRoomId is required for isFristTime this field false!')),
    })
    schema.validateAsync(req.body).then(async result => {
        req.body = result
        return next()
    }).catch(async error => {
        res.status(400).json(await apiResponse(400, error.message, {}, {}));
    })
}
export const update_chat_by_id = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        chatId: Joi.string().required().error(new Error('chatId is required!')),
        message: Joi.string().required().error(new Error('message is required!')),
    })
    schema.validateAsync(req.body).then(async result => {
        req.body = result
        return next()
    }).catch(async error => {
        res.status(400).json(await apiResponse(400, error.message, {}, {}));
    })
}