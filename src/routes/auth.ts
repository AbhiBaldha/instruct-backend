"use strict"
import express from 'express';
import { authController } from '../controllers';
import * as validation from '../validation';
const router = express.Router();


router.post('/signUp', validation?.signUp, authController.signUp)
router.post('/login', validation?.login, authController.login)
router.post('/otp_verification', validation?.otp_verification, authController.otp_verification)
router.post('/resend_otp', validation.resend_otp, authController.resend_otp)
router.post('/forgot_password', validation.forgot_password, authController.forgot_password)
router.post('/reset_password', validation.reset_password, authController.reset_password)


export const authRouter = router;