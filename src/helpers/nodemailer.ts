import config from 'config'
import nodemailer from 'nodemailer';

const mail: any = config.get("nodeMail");

const option = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: mail.mail,
        pass: mail.password
    }
}

const transPorter = nodemailer.createTransport(option)

export const email_verification_mail = (user, otp) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("user.email ----- ",user.email);
            
            const mailOptions = { 
                from: mail.mail, // sender address
                to: user.email, // list of receivers
                subject: "Please activate your Instruct AI account",
                html: `<html lang="en-US">
                <head>
                    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                    <title>Verification Email Template</title>
                    <meta name="description" content="Reset Password Email Template.">
                    <style type="text/css">
                        a:hover {text-decoration: underline !important;}
                    </style>
                </head>
                <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                        <tr>
                            <td>
                                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="height:80px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="height:20px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#111c44; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:0 35px;">
                                                        <h1 style="color:#f2f3f8; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;"><img src="https://res.cloudinary.com/danz85nwq/image/upload/v1688479540/profile_image/twxeawpqsl3fg8fwgzrt.png" alt="logo"  style=" width: 150px;margin-bottom: 10px; font-size:32px;font-family:'Rubik'"> <br> Email verification</h1>
                                                        <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                        <p style="color:#f2f3f8; font-size:15px;line-height:24px; margin:0;">
                                                            Hi ${user.userName}
                                                            <br>
                                                            Someone, hopefully you, has requested new account in Instruct AI.
                                                            <br>
                                                            Please verify your email using otp code.
                                                            <br>
                                                            OTP will expire in 10 minutes.
                                                            <br>
                                                            Verification code: ${otp}
                                                            <br>
                                                            <br>
                                                            Thanks,
                                                            <br>
                                                            Instruct AI
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                            </table>
                                        </td>
                                        <tr>
                                            <td style="height:20px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align:center;"><strong>www.instructAi.com</strong></p></td>
                                        </tr>
                                        <tr>
                                            <td style="height:80px;">&nbsp;</td>
                                        </tr>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>`, // html body
            };
            await transPorter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(`Email has been sent to ${user.email}, kindly follow the instructions`)
                }
            })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    });
}

export const forgot_password_mail = (user, otp) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mailOptions = {
                from: mail.mail, // sender address
                to: user.email, // list of receivers
                subject: "Instruct AI forgotten password reset",
                html: `<html lang="en-US">
                <head>
                    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                    <title>Verification Email Template</title>
                    <meta name="description" content="Reset Password Email Template.">
                    <style type="text/css">
                        a:hover {text-decoration: underline !important;}
                    </style>
                </head>
                <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                        <tr>
                            <td>
                                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="height:80px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="height:20px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#111c44; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:0 35px;">
                                                        <h1 style="color:#f2f3f8; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;"><img src="https://res.cloudinary.com/danz85nwq/image/upload/v1688479540/profile_image/twxeawpqsl3fg8fwgzrt.png" alt="logo"  style=" width: 150px;margin-bottom: 10px; font-size:32px;font-family:'Rubik'"> <br> Forgot Password</h1>
                                                        <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                        <p style="color:#f2f3f8; font-size:15px;line-height:24px; margin:0;">
                                                            Hi ${user.userName}
                                                            <br>
                                                            Someone, hopefully you, has requested to reset the password for your Instruct AI
                                                            <br>
                                                            account.
                                                            <br>
                                                            OTP will expire in 10 minutes.
                                                            <br>
                                                            Verification code: ${otp}
                                                            <br>
                                                            <br>
                                                            Thanks,
                                                            <br>
                                                            Instruct AI
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                            </table>
                                        </td>
                                        <tr>
                                            <td style="height:20px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align:center;"><strong>www.instructAi.com</strong></p></td>
                                        </tr>
                                        <tr>
                                            <td style="height:80px;">&nbsp;</td>
                                        </tr>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>`, // html body
            };
            await transPorter.sendMail(mailOptions, function (err, data1) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(`Email has been sent to ${user.email}, kindly follow the instructions`)
                }
            })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}
