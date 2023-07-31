"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'
import { chatModel } from '../../database/models'
import { responseMessage } from '../../helpers'
import moment from 'moment';


const ObjectId = require('mongoose').Types.ObjectId


// export const get_weeklyReport = async (req: Request, res: Response) => {
//     reqInfo(req);
//     let user: any = req.header('user');
//     let { id } = user._id;
//     let total_count: any;
//     let weekly_data: any;

//     try {
//         const todayDate = moment().format('YYYY-MM-DD');
//         const last7DaysDates = [];
//         for (let i = 0; i < 7; i++) {
//             last7DaysDates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
//         }
//         console.log("todayDate", new Date(todayDate));
//         console.log("last7DaysDates", last7DaysDates.map(date => new Date(date)));

//         [weekly_data, total_count] = await Promise.all([
//             chatModel.aggregate([
//                 {
//                     $match: {
//                         isActive: true,
//                         userId: ObjectId(id),
//                         createdAt: {
//                             $gte: new Date(last7DaysDates[6]),
//                             $lte: new Date(todayDate)
//                         }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//                         count: { $sum: 1 }
//                     }
//                 },
//                 { $sort: { _id: -1 } },
//                 {
//                     $group: {
//                         _id: null,
//                         weekly_data: {
//                             $push: {
//                                 date: "$_id",
//                                 count: "$count"
//                             }
//                         }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         weekly_data: {
//                             $map: {
//                                 input: last7DaysDates,
//                                 as: "date",
//                                 in: {
//                                     $let: {
//                                         vars: {
//                                             dateIndex: { $indexOfArray: ["$weekly_data.date", "$$date"] }
//                                         },
//                                         in: {
//                                             date: "$$date",
//                                             day: { $dayOfWeek: { $toDate: "$$date" } },
//                                             count: {
//                                                 $cond: [
//                                                     { $gte: ["$$dateIndex", 0] },
//                                                     { $arrayElemAt: ["$weekly_data.count", "$$dateIndex"] },
//                                                     0
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }


//             ]),
//             chatModel.countDocuments({
//                 isActive: true,
//                 userId: ObjectId(id),
//             })
//         ]);
//         weekly_data = weekly_data[0].weekly_data
//         const response = { weekly_data, total_count };
//         console.log("response --------->> ", response);

//         if (response) {
//             return res.status(200).json(await apiResponse(200, responseMessage?.getDataSuccess('weekly report'), response, {}));
//         } else {
//             return res.status(501).json(await apiResponse(501, 'Oops! Something went wrong!', {}, {}));
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, {}));
//     }
// };


export const get_weeklyReport = async (req: Request, res: Response) => {
    reqInfo(req);
    let user: any = req.header('user');
    let { id } = user._id;
    let total_count: any;
    let weekly_data: any;

    try {
        const todayDate = moment().format('YYYY-MM-DD');
        const last7DaysDates = [];
        for (let i = 0; i < 7; i++) {
            last7DaysDates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
        }
        console.log("todayDate", new Date(todayDate));
        console.log("last7DaysDates", last7DaysDates.map(date => new Date(date)));
        [weekly_data, total_count] = await Promise.all([
            chatModel.aggregate([
                {
                    $match: {
                        isActive: true,
                        userId: ObjectId(id),
                        createdAt: {
                            $gte: new Date(last7DaysDates[6]),
                            // $lte: new Date(todayDate)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } },
                {
                    $group: {
                        _id: null,
                        weekly_data: {
                            $push: {
                                date: "$_id",
                                count: "$count"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        weekly_data: {
                            $map: {
                                input: last7DaysDates,
                                as: "date",
                                in: {
                                    $let: {
                                        vars: {
                                            dayOfWeek: { $dayOfWeek: { $dateFromString: { dateString: "$$date" } } }
                                        },
                                        in: {
                                            date: "$$date",
                                            day: {
                                                $switch: {
                                                    branches: [
                                                        { case: { $eq: ["$$dayOfWeek", 1] }, then: "Sunday" },
                                                        { case: { $eq: ["$$dayOfWeek", 2] }, then: "Monday" },
                                                        { case: { $eq: ["$$dayOfWeek", 3] }, then: "Tuesday" },
                                                        { case: { $eq: ["$$dayOfWeek", 4] }, then: "Wednesday" },
                                                        { case: { $eq: ["$$dayOfWeek", 5] }, then: "Thursday" },
                                                        { case: { $eq: ["$$dayOfWeek", 6] }, then: "Friday" },
                                                        { case: { $eq: ["$$dayOfWeek", 7] }, then: "Saturday" }
                                                    ],
                                                    default: "Unknown"
                                                }
                                            },
                                            count: {
                                                $cond: [
                                                    { $in: ["$$date", "$weekly_data.date"] },
                                                    {
                                                        $arrayElemAt: [
                                                            "$weekly_data.count",
                                                            { $indexOfArray: ["$weekly_data.date", "$$date"] }
                                                        ]
                                                    },
                                                    0
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            ]),
            chatModel.countDocuments({
                isActive: true,
                userId: ObjectId(id),
            })
        ]);


        weekly_data = weekly_data[0].weekly_data
        const response = { weekly_data, total_count };
        console.log("response --------->> ", response);

        if (response) {
            return res.status(200).json(await apiResponse(200, responseMessage?.getDataSuccess('weekly report'), response, {}));
        } else {
            return res.status(501).json(await apiResponse(501, 'Oops! Something went wrong!', {}, {}));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(await apiResponse(500, 'Internal Server Error', {}, {}));
    }
};

