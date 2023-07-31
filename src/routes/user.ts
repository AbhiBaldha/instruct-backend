"use strict"
import express, { Router } from 'express';
import { userController } from '../controllers';
import { userJWT } from '../helpers';
import * as validation from '../validation';
const router = express.Router();


// ------------------ share Modal -----------------

router.get('/share/:id', userController?.share_historyRoom_by_id)

// ================== user Token ==================


router.use(userJWT);

//  ------------------ profile Model ----------------
router.get('/get_profile', userController?.get_profile)
router.put('/update_profile', validation.update_profile, userController?.update_profile)
router.post('/change_password', validation.change_password, userController.change_password)


//  ------------------ chat Model ------------------
router.post('/ChatWithGpt', validation?.ChatWithGpt, userController?.ChatWithGpt)
router.put('/update/chat/by_id', validation?.update_chat_by_id, userController?.update_chat_by_id)


// -------------------- historyRoom Model ------------

router.get('/get/historyRoom', userController?.get_historyRoom)
router.get('/get/historyRoom/:id', userController?.get_historyRoom_by_id)
router.put('/update/historyRoom/by_id', validation?.update_historyRoom_by_id, userController?.update_historyRoom_by_id)
router.delete('/delete/historyRoom/:id', validation?.by_id, userController?.delete_historyRoom_by_id)


// ------------------- weeklyReport Modal -------------

router.get('/get/weeklyReport', userController?.get_weeklyReport)


export const userRouter = router; 