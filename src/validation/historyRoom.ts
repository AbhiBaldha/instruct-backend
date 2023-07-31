"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const update_historyRoom_by_id = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        historyRoomId: Joi.string().required().error(new Error('historyRoomId is required!')),                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
        title: Joi.string().required().error(new Error('title is required!'))
    }) 
    schema.validateAsync(req.body).then(async result => {
        req.body = result
        return next()
    }).catch(async error => {
        res.status(400).json(await apiResponse(400, error.message, {}, {}));
    })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(await apiResponse(400, 'invalid id', {}, {}))
    return next()
}