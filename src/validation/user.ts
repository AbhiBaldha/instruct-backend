"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const signUp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().max(50).required().error(new Error('email is required! & max length is 50')),
        password: Joi.string().max(20).required().error(new Error('password is required! & max length is 20')),                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
        userName: Joi.string().required().error(new Error('username is required!')),
        userType: Joi.number().max(1).required().error(new Error('userType is required! & must be a number & valid userType 0, 1')),
    }) 
    schema.validateAsync(req.body).then(async result => {
        req.body = result
        return next()
    }).catch(async error => {
        res.status(400).json(await apiResponse(400, error.message, {}, {}));
    })

}

export const login = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().max(50).required().error(new Error('email is required! & max length is 50')),
        password: Joi.string().max(20).required().error(new Error('password is required! & max length is 20')),
        deviceToken: Joi.string().error(new Error('deviceToken is string!')),
    })
    schema.validateAsync(req.body).then(async result => {
        req.body = result
        return next()
    }).catch(async error => {
        res.status(400).json(await apiResponse(400, error.message, {}, {}));
    })
}

export const otp_verification = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        otp: Joi.number().min(100000).max(999999).required().error(new Error('otp is required! & must be 6 digits')),
    })
    schema.validateAsync(req.body).then(async result => {
        return next()
    }).catch(async error => {
        res.status(400).json(await apiResponse(400, error.message, {}, {}));
    })
}

export const resend_otp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().required().error(new Error('email is required! '))
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})); })
}

export const forgot_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().required().error(new Error('email is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(async error => {
        res.status(400).json(await apiResponse(400, error.message, {}, {}));
    })
}

export const reset_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().required().error(new Error('email is required! ')),
        password: Joi.string().max(20).required().error(new Error('password is required! & max length is 20')),
    })
    schema.validateAsync(req.body).then(async result => {
        return next()
    }).catch(async error => {
        res.status(400).json(await apiResponse(400, error.message, {}, {}));
    })
}

export const change_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        old_password: Joi.string().required().error(new Error('old_password is required! ')),
        new_password: Joi.string().required().error(new Error('new_password is required! ')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})); })
}

export const update_profile = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        name: Joi.string().error(new Error('name is string')),
        userName: Joi.string().error(new Error('userName is string')),
        profileImage: Joi.string().error(new Error('profileImage is string')),
        email: Joi.string().error(new Error('email is string')),
        aboutMe: Joi.string().allow("",null).max(150).error(new Error('aboutMe is string')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(async error => {
        res.status(400).json(await apiResponse(400, error.message, {}, {}))
    })
}