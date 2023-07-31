"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'
import { chatModel, historyRoomModel, userModel } from '../../database/models'
import { responseMessage } from '../../helpers'
import moment from 'moment';
import { date } from 'joi'


const ObjectId = require('mongoose').Types.ObjectId

export const get_historyRoom = async (req: Request, res: Response) => {
    reqInfo(req);
    let user: any = req.header('user');
    let { id } = user._id;

    try {
        const todayDate = moment().format('YYYY-MM-DD');
        const yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        // const last3DaysDate = moment().subtract(3, 'days').format('YYYY-MM-DD');
        const last7DaysDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
        const last14DaysDate = moment().subtract(14, 'days').format('YYYY-MM-DD');
        const last30DaysDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
        const last60DaysDate = moment().subtract(60, 'days').format('YYYY-MM-DD');
        console.log("todayDate", new Date(todayDate));
        console.log("last60DaysDate", new Date(last60DaysDate));


        let response: any = await historyRoomModel.aggregate([
            {
                $match: {
                    isActive: true,
                    userId: ObjectId(id),
                    createdAt: {
                        $gte: new Date(last30DaysDate),
                        // $lt: new Date(todayDate)
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $gte: ['$createdAt', new Date(todayDate)] },
                            // '1Today',
                            1,
                            {
                                $cond: [
                                    { $gte: ['$createdAt', new Date(yesterdayDate)] },
                                    // '2Yesterday',
                                    2,
                                    {
                                        $cond: [
                                            { $gte: ['$createdAt', new Date(last7DaysDate)] },
                                            // '7Days Previous',
                                            7,
                                            {
                                                $cond: [
                                                    { $gte: ['$createdAt', new Date(last14DaysDate)] },
                                                    // '14Days Previous',
                                                   14,
                                                    {
                                                        $cond: [
                                                            { $gte: ['$createdAt', new Date(last30DaysDate)] },
                                                            // '30Days Previous',
                                                            30,
                                                            'false'
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    data: { $push: '$$ROOT' }
                }
            },
            { $sort: { _id: 1 } }
        ])
        if (response) {
            return res.status(200).json(await apiResponse(200, responseMessage?.getDataSuccess('historyRoom'), response, {}));
        } else {
            return res.status(501).json(await apiResponse(501, 'Oops! Something went wrong!', {}, {}));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, {}));
    }
}

export const get_historyRoom_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    let { id } = user._id,
        historyRoomId: any = req.params.id
    try {
        // let response: any = await historyRoomModel.findOne({ _id: ObjectId(historyRoomId), isActive: true, userId: ObjectId(id) })
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

export const update_historyRoom_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    let { id } = user._id,
        historyRoomId: any = req.body.historyRoomId,
        title: any = req.body.title
    try {
        let response = await historyRoomModel.findByIdAndUpdate({ _id: ObjectId(historyRoomId), isActive: true, userId: ObjectId(id) }, { title: title }, { new: true })
        if (response) return res.status(200).json(await apiResponse(200, responseMessage?.updateDataSuccess('historyRoom title'), response, {}))
        else return res.status(501).json(await apiResponse(501, 'Oops! Something went wrong!', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, {}))
    }
}

export const delete_historyRoom_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    let { id } = user._id,
        historyRoomId: any = req.params.id
    try {
        let response: any = await historyRoomModel.deleteOne({ _id: ObjectId(historyRoomId), isActive: true, userId: ObjectId(id) })
        await chatModel.deleteMany({ _id: { $in: response?.chatIds }, isActive: true })
        if (response) return res.status(200).json(await apiResponse(200, responseMessage?.deleteDataSuccess('historyRoom title'), {}, {}))
        else return res.status(501).json(await apiResponse(501, 'Oops! Something went wrong!', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, {}))
    }
}
