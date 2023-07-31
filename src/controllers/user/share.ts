"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'
import { historyRoomModel } from '../../database/models'
import { responseMessage } from '../../helpers'

const ObjectId = require('mongoose').Types.ObjectId


export const share_historyRoom_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    let { id } = user._id,
        historyRoomId: any = req.params.id
    try {
        let response: any = await historyRoomModel.aggregate([
            { $match: { _id: ObjectId(historyRoomId), isActive: true, userId: ObjectId(id) } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "chats",
                    let: { chatIds: "$chatIds" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$_id", "$$chatIds"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "chat_data"
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$userId"] },
                                        { $eq: ["$isActive", true] },
                                        { $eq: ["$isBlock", false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "user_data"
                }
            },
        ])
        if (response) return res.status(200).json(await apiResponse(200, responseMessage?.getDataSuccess('historyRoom'), response, {}))
        else return res.status(501).json(await apiResponse(501, 'Oops! Something went wrong!', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, {}))
    }
}