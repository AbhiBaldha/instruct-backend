"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { apiResponse } from '../../common'
import bcryptjs from 'bcryptjs'
import { Request, Response } from 'express'
import url from 'url';
import { userModel } from '../../database/models'
import { deleteImage } from '../../helpers'

const ObjectId = require('mongoose').Types.ObjectId


export const get_profile = async (req: Request, res: Response) => {
  reqInfo(req)
  let user: any = req.header('user')
  let { id } = user._id
  try {
    let response = await userModel.findOne({ _id: ObjectId(id), isActive: true, isBlock: false })
    if (response) return res.status(200).json(await apiResponse(200, 'user get profile successfully', response, {}))
    else return res.status(501).json(await apiResponse(501, 'Oops! Something went wrong!', {}, {}))
  } catch (error) {
    console.log(error)
    return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, {}))
  }
}

export const update_profile = async (req: Request, res: Response) => {
  reqInfo(req)
  let user: any = req.header('user'),
    id = user._id,
    body = req.body
  try {
    if (body.userName != null) {
      let isAlready = await userModel.findOne({ userName: body.userName, isActive: true, isBolck: true })
      if (isAlready && !isAlready._id.equals(id)) {
        return res.status(403).json(await apiResponse(403, 'UserName Already Exist!', {}, {}))
      }
    }
    if (body.email != null) {
      let isAlready = await userModel.findOne({ email: body.email, isActive: true, isBolck: true })
      if (isAlready && !isAlready._id.equals(id)) {
        return res.status(403).json(await apiResponse(403, 'email Already Exist!', {}, {}))
      }
    }
    let response = await userModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body)
    console.log("body?.profileImage != response?.profileImage ------------ >>", body?.profileImage != response?.profileImage);

    if (body?.profileImage != response?.profileImage && response.profileImage != null && body?.profileImage != null && body?.profileImage != undefined) {
      let profileImage = response?.profileImage
      const cloudinaryParts = url.parse(response?.profileImage, true).pathname?.split('/');
      const imageName = cloudinaryParts?.pop();
      const folderName = cloudinaryParts?.pop();
      const publicId = profileImage.split('/').slice(-1)[0].split('.')[0];
      await deleteImage(folderName, publicId)
    }
    if (response) {
      return res.status(200).json(await apiResponse(200, 'User profile updated successfully!', {}, {}))
    } else {
      return res.status(404).json(await apiResponse(404, 'User record not found', {}, {}))
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, {}))
  }
}

export const change_password = async (req: Request, res: Response) => {
  reqInfo(req)
  let user: any = req.header('user'),
    { old_password, new_password } = req.body,
    authToken: any
  try {
    let user_data = await userModel.findOne({ _id: ObjectId(user._id), isActive: true }).select('password')

    const passwordMatch = await bcryptjs.compare(old_password, user_data.password)
    if (!passwordMatch) return res.status(400).json(await apiResponse(400, 'Old password is wrong', {}, {}));

    const salt = await bcryptjs.genSaltSync(10)
    const hashPassword = await bcryptjs.hash(new_password, salt)
    for (let flag = 0; flag < 1;) {
      authToken = await Math.round(Math.random() * 1000000)
      if (authToken.toString().length == 6) {
        flag++
      }
    }
    let response = await userModel.findOneAndUpdate({ _id: ObjectId(user._id), isActive: true }, { password: hashPassword, authToken })
    if (response) return res.status(200).json(await apiResponse(200, 'Password has been changed successfully!', {}, {}))
    else return res.status(501).json(await apiResponse(501, 'Oops! Something went wrong!', {}, {}))
  } catch (error) {
    console.log(error)
    return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, {}))
  }
}