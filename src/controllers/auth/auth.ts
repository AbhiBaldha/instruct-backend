"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { apiResponse, userStatus } from '../../common'
import bcryptjs from 'bcryptjs'
import config from 'config'
import { Request, Response } from 'express'
import { responseMessage } from '../../helpers/response'
import { userModel } from '../../database/models'
import jwt from 'jsonwebtoken'
import { email_verification_mail, forgot_password_mail } from '../../helpers'

const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret: any = config.get('jwt_token_secret')
const refresh_jwt_token_secret: any = config.get('refresh_jwt_token_secret')

export const signUp = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let body = req.body,
            otpFlag = 1, // OTP has already assign or not for cross-verification
            authToken = 0
        if (body.userType != 0) return res.status(409).json(await apiResponse(409, responseMessage.onlyUserRegister, {}, {}));
        let isAlready: any = await userModel.findOne({ email: body.email, isActive: true, isEmailVerified: true })
        let isAlreadyUserName: any = await userModel.findOne({ userName: body.userName, isActive: true, isEmailVerified: true })
        let isAlreadyUserNameInEmail: any = await userModel.findOne({ email: body.userName, isActive: true, isEmailVerified: true })
        if (isAlready) return res.status(409).json(await apiResponse(409, responseMessage.alreadyEmail, {}, {}));
        if (isAlreadyUserName) return res.status(409).json(await apiResponse(409, responseMessage.alreadyUserName, {}, {}));
        if (isAlreadyUserNameInEmail) return res.status(409).json(await apiResponse(409, responseMessage.alreadyUserNameInEmail, {}, {}));

        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        body.password = hashPassword
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                authToken = await Math.round(Math.random() * 1000000)
                if (authToken.toString().length == 6) {
                    flag++
                }
            }
            let isAlreadyAssign = await userModel.findOne({ otp: authToken })
            if (isAlreadyAssign?.otp != authToken) otpFlag = 0
        }
        body.authToken = authToken
        body.otp = authToken
        body.otpExpireTime = new Date(new Date().setMinutes(new Date().getMinutes() + 10))
        let isAlready1: any = await userModel.findOne({ email: body.email, isActive: true })
        if (isAlready1) {
            console.log("isAlready", isAlready1._id);
            await userModel.findOneAndUpdate({ _id: ObjectId(isAlready1._id), isActive: true }, body, { new: true }).then(async data => {
                let action = await email_verification_mail(data, authToken).then(data => { return data }).catch(async error => console.log(error))
                return res.status(200).json(await apiResponse(200, responseMessage.signupSuccess, { action: action }, {}));
            })
        } else {
            console.log("isAlready else");
            await new userModel(body).save().then(async data => {
                console.log("data ---------->>>", data);
                let action = await email_verification_mail(data, authToken).then(data => { return data }).catch(async error => console.log(error))
                return res.status(200).json(await apiResponse(200, responseMessage.signupSuccess, { action: action }, {}));
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}

export const otp_verification = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        body.isActive = true
        let data = await userModel.findOneAndUpdate(body, { otp: null, otpExpireTime: null, isEmailVerified: true, authToken: body.otp })

        if (!data) return res.status(400).json(await apiResponse(400, 'Invalid otp ', {}, {}));
        if (data.isBlock == true) return res.status(403).json(await apiResponse(403, 'Account has been blocked', {}, {}));
        if (new Date(data.otpExpireTime).getTime() < new Date().getTime()) return res.status(410).json(await apiResponse(410, 'OTP is expired.', {}, {}));

        if (data.isEmailVerified == false) {
            return res.status(200).json(await apiResponse(200, 'Email verification completed', { action: "Please go to login page" }, {}));
        }
        else {
            if (data) return res.status(200).json(await apiResponse(200, 'Otp verified successfully', { _id: data._id }, {}));
            else return res.status(501).json(await apiResponse(501, `Error in mail system`, {}, data));
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, error));
    }
} 

export const login = async (req: Request, res: Response) => {
    let body = req.body, otpFlag = 1, authToken: any
    reqInfo(req)
    try {
        for (let flag = 0; flag < 1;) {
            authToken = await Math.round(Math.random() * 1000000)
            if (authToken.toString().length == 6) {
                flag++
            }
        }
        let response = await userModel.findOneAndUpdate({ $or: [{ email: body.email }, { userName: body.email }], isActive: true, userType: 0 }, { $addToSet: { ...(body?.deviceToken != null) && { deviceToken: body?.deviceToken } }, lastLogin: new Date() }, { new: true }).select('-__v -createdAt -updatedAt')
        if (!response) return res.status(400).json(await apiResponse(400, responseMessage.invalidUserEmail, {}, {}));
        if (response.isEmailVerified == false) return res.status(502).json(await apiResponse(502, 'Email is unverified.', {}, {}));
        if (response?.isBlock == true) return res.status(403).json(await apiResponse(403, 'Your account han been blocked.', {}, {}));
        const passwordMatch = await bcryptjs.compare(body.password, response.password)

        if (!passwordMatch) return res.status(400).json(await apiResponse(400, responseMessage.invalidUserPassword, {}, {}));
        const token = jwt.sign({
            _id: response._id,
            authToken: response.authToken,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)
        const refresh_token = jwt.sign({
            _id: response._id,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret)
        response = {
            _id: response?._id,
            userName: response.userName,
            name: response.name,
            profileImage: response.profileImage,
            email: response.email,
            userType: response.userType,
            loginType: response.loginType,
            token,
            refresh_token
        }
        return res.status(200).json(await await apiResponse(200, responseMessage.loginSuccess, response, {}));

    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}

export const resend_otp = async (req: Request, res: Response) => {
    reqInfo(req)
    let { email, } = req.body,
        otpFlag = 1, // OTP has already assign or not for cross-verification
        otp = 0,
        response
    try {
        let data = await userModel.findOne({ email, isActive: true })
        if (!data) return res.status(400).json(await apiResponse(400, 'You have entered email is not exist in database', {}, {}));
        if (data.isBlock == true) return res.status(403).json(await apiResponse(403, 'Account has been blocked', {}, {}));
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 1000000)
                if (otp.toString().length == 6) {
                    flag++
                }
            }
            let isAlreadyAssign = await userModel.findOne({ otp: otp })
            if (isAlreadyAssign?.otp != otp) otpFlag = 0
        }
        if (data.isEmailVerified == false) {
            response = await email_verification_mail(data, otp)
        }
        else {
            response = await forgot_password_mail(data, otp)
        }
        if (response) {
            await userModel.findOneAndUpdate({ email, isActive: true }, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
            return res.status(200).json(await apiResponse(200, `${response}`, {}, {}));
        }
        else return res.status(501).json(await apiResponse(501, `Error in mail system`, {}, `${response}`));
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, {}))
    }
}

export const forgot_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        otpFlag = 1, // OTP has already assign or not for cross-verification
        otp = 0
    try {
        body.isActive = true
        let data = await userModel.findOne(body)

        if (!data) return res.status(400).json(await apiResponse(400, 'You have entered an email is not exist in database', {}, {}));
        if (data.isBlock == true) return res.status(403).json(await apiResponse(403, 'Account has been blocked', {}, {}));
        if (data?.isEmailVerified == false) return res.status(502).json(await apiResponse(502, 'Email already exists and email is unverified.', {}, {}));

        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 1000000)
                if (otp.toString().length == 6) {
                    flag++
                }
            }
            let isAlreadyAssign = await userModel.findOne({ otp: otp })
            if (isAlreadyAssign?.otp != otp) otpFlag = 0
        }
        let response = await forgot_password_mail(data, otp)
        if (response) {
            await userModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
            return res.status(200).json(await apiResponse(200, `${response}`, data, {}));
        }
        else return res.status(501).json(await apiResponse(501, `Error in mail system`, {}, `${response}`));
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, error));
    }
}

export const reset_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        authToken = 0,
        email = body.email
    try {
        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        delete body.email
        body.password = hashPassword

        for (let flag = 0; flag < 1;) {
            authToken = await Math.round(Math.random() * 1000000)
            if (authToken.toString().length == 6) {
                flag++
            }
        }
        body.authToken = authToken
        let response = await userModel.findOneAndUpdate({ email: email, isActive: true }, body)
        if (response) return res.status(200).json(await apiResponse(200, 'Password reset successfully', { action: "Please go to login page" }, {}));
        else return res.status(501).json(await apiResponse(501, `Something went wrong while Reseting the password!`, {}, response));

    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, error));
    }
}